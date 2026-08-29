import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import crypto from 'crypto';
import { getAuth } from 'firebase-admin/auth';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import express from 'express';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly',
  'https://www.googleapis.com/auth/meetings.space.settings'
];

export function createGoogleRouter(db: Firestore | null) {
  const router = express.Router();

  const getOAuthClient = (req: express.Request) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host || 'localhost:8000';
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${protocol}://${host}/api/google/auth/callback`;
    return new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );
  };

  const getEncryptionKey = () => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be exactly 32 characters long in production');
    }
    return key;
  };

  const encrypt = (text: string) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(getEncryptionKey()), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  };

  const decrypt = (text: string) => {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(getEncryptionKey()), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  };

  const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      (req as any).user = decodedToken;
      next();
    } catch (e) {
      return res.status(401).json({ error: 'INVALID_TOKEN' });
    }
  };

  const getAuthenticatedClient = async (userId: string) => {
    if (!db) throw new Error("Database not initialized");
    const doc = await db.collection('integration_credentials').doc(userId).get();
    if (!doc.exists) throw new Error("Not connected");
    const data = doc.data()!;
    if (data.provider !== 'google') throw new Error("Invalid provider");
    
    let tokens = data.tokens;
    if (data.encrypted) {
      tokens = JSON.parse(decrypt(data.encryptedData));
    }
    
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    client.setCredentials(tokens);
    return client;
  };

  // Init Auth Flow securely
  router.post('/auth/init', async (req, res) => {
    console.log('[GOOGLE_AUTH_INIT] request received');
    try {
      if (!db) {
        console.log('[GOOGLE_AUTH_INIT] FAILED_AT=db_check');
        console.log('[GOOGLE_AUTH_INIT] ERROR=Database missing');
        return res.status(500).json({ error: 'DB_MISSING' });
      }

      console.log('[GOOGLE_AUTH_INIT] firebase verification started');
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[GOOGLE_AUTH_INIT] FAILED_AT=firebase_verification');
        console.log('[GOOGLE_AUTH_INIT] ERROR=Missing Authorization Header');
        return res.status(401).json({ error: 'UNAUTHORIZED' });
      }

      const token = authHeader.split('Bearer ')[1];
      let decodedToken;
      try {
        decodedToken = await getAuth().verifyIdToken(token);
        console.log('[GOOGLE_AUTH_INIT] firebase verification passed');
      } catch (e: any) {
        console.log('[GOOGLE_AUTH_INIT] FAILED_AT=firebase_verification');
        console.log(`[GOOGLE_AUTH_INIT] ERROR=${e.code || e.message}`);
        return res.status(401).json({ error: 'INVALID_TOKEN' });
      }

      const userId = decodedToken.uid;
      
      // We don't have a rigid OWNER/ADMIN check here based on email in the current codebase,
      // but if the user document is found, we should log it.
      // The instruction says: "inspect the canonical Firestore: users/{uid} ... Verify USER DOCUMENT: FOUND / MISSING ... ROLE: OWNER ... AUTHORIZATION: PASS / FAIL"
      // I will add a check for the user document to ensure they are an OWNER/ADMIN.
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.log('[GOOGLE_AUTH_INIT] FAILED_AT=authorization');
        console.log('[GOOGLE_AUTH_INIT] ERROR=User document missing in users collection');
        return res.status(403).json({ error: 'USER_MISSING' });
      }
      
      const userData = userDoc.data()!;
      if (userData.role !== 'OWNER' && userData.role !== 'ADMIN') {
        console.log('[GOOGLE_AUTH_INIT] FAILED_AT=authorization');
        console.log(`[GOOGLE_AUTH_INIT] ERROR=Insufficient role: ${userData.role}`);
        return res.status(403).json({ error: 'INSUFFICIENT_ROLE' });
      }
      
      console.log('[GOOGLE_AUTH_INIT] authorization passed');

      console.log('[GOOGLE_AUTH_INIT] init record creation started');
      const initId = crypto.randomBytes(32).toString('hex');
      
      await db.collection('oauth_state').doc(initId).set({
        userId,
        createdAt: FieldValue.serverTimestamp(),
      });
      
      console.log('[GOOGLE_AUTH_INIT] init record creation passed');
      console.log('[GOOGLE_AUTH_INIT] response sent');
      res.json({ initId });
    } catch (e: any) {
      console.log('[GOOGLE_AUTH_INIT] FAILED_AT=unknown');
      console.log(`[GOOGLE_AUTH_INIT] ERROR=${e.message}`);
      res.status(500).json({ error: 'FAILED_TO_INIT' });
    }
  });

  // Start Auth Flow
  router.get('/auth/start', async (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: 'CONFIG_MISSING', message: 'Google Client ID and Secret must be configured' });
    }
    const initId = req.query.init as string;
    if (!initId) return res.status(400).send('Missing init parameter');

    try {
      if (!db) return res.status(500).send('Database missing');
      
      const docRef = db.collection('oauth_state').doc(initId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return res.status(400).send(`<h1>KYMRSTUDIO GOOGLE OAUTH</h1><p>STATUS: FAILED</p><p>STAGE: AUTH_START</p><p>ERROR: Invalid or expired initiation request</p>`);
      }
      
      const data = doc.data()!;
      if (!data.createdAt) {
         return res.status(400).send(`<h1>KYMRSTUDIO GOOGLE OAUTH</h1><p>STATUS: FAILED</p><p>STAGE: AUTH_START</p><p>ERROR: Invalid initiation request</p>`);
      }
      const createdAt = data.createdAt.toDate();
      if (Date.now() - createdAt.getTime() > 5 * 60 * 1000) {
        await docRef.delete();
        return res.status(400).send(`<h1>KYMRSTUDIO GOOGLE OAUTH</h1><p>STATUS: FAILED</p><p>STAGE: AUTH_START</p><p>ERROR: Initiation request expired</p>`);
      }

      const client = getOAuthClient(req);
      const authorizeUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
        state: initId
      });
      res.redirect(authorizeUrl);
    } catch (e: any) {
      console.error(e);
      res.status(500).send('Error initiating OAuth');
    }
  });

  // Auth Callback
  router.get('/auth/callback', async (req, res) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    
    if (!code) return res.status(400).send(`<h1>KYMRSTUDIO GOOGLE OAUTH</h1><p>STATUS: FAILED</p><p>STAGE: CALLBACK_RECEIVED</p><p>ERROR: No code provided</p>`);
    if (!state) return res.status(400).send(`<h1>KYMRSTUDIO GOOGLE OAUTH</h1><p>STATUS: FAILED</p><p>STAGE: CALLBACK_RECEIVED</p><p>ERROR: Missing state parameter</p>`);
    
    try {
      if (!db) return res.status(500).send(`<h1>KYMRSTUDIO GOOGLE OAUTH</h1><p>STATUS: FAILED</p><p>STAGE: STATE_VALIDATED</p><p>ERROR: Database missing</p>`);
      
      const docRef = db.collection('oauth_state').doc(state);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return res.status(400).send(`<h1>KYMRSTUDIO GOOGLE OAUTH</h1><p>STATUS: FAILED</p><p>STAGE: STATE_VALIDATED</p><p>ERROR: Invalid or expired state parameter</p>`);
      }
      
      const data = doc.data()!;
      const userId = data.userId;
      
      // Single use - consume the state immediately
      await docRef.delete();
      
      if (data.createdAt) {
        const createdAt = data.createdAt.toDate();
        if (Date.now() - createdAt.getTime() > 10 * 60 * 1000) {
           return res.status(400).send(`<h1>KYMRSTUDIO GOOGLE OAUTH</h1><p>STATUS: FAILED</p><p>STAGE: STATE_VALIDATED</p><p>ERROR: OAuth request expired</p>`);
        }
      }

      const client = getOAuthClient(req);
      const { tokens } = await client.getToken(code);
      
      const encryptedData = encrypt(JSON.stringify(tokens));
      
      await db.collection('integration_credentials').doc(userId).set({
        provider: 'google',
        encrypted: true,
        encryptedData,
        updatedAt: FieldValue.serverTimestamp()
      });
      
      // Send success but DO NOT close the window (Debug Mode)
      res.send(`<h1>KYMRSTUDIO GOOGLE OAUTH</h1><p>STATUS: SUCCESS</p><script>window.opener.postMessage("GOOGLE_AUTH_SUCCESS", "*");</script>`);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(`<h1>KYMRSTUDIO GOOGLE OAUTH</h1><p>STATUS: FAILED</p><p>STAGE: TOKEN_EXCHANGE_OR_STORAGE</p><p>ERROR: ${e.message}</p>`);
    }
  });

  // Status Check
  router.get('/status', authMiddleware, async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB_MISSING' });
    const userId = (req as any).user.uid;
    const doc = await db.collection('integration_credentials').doc(userId).get();
    res.json({ isAuthorized: doc.exists });
  });

  // Disconnect
  router.post('/disconnect', authMiddleware, async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB_MISSING' });
    const userId = (req as any).user.uid;
    
    try {
       const client = await getAuthenticatedClient(userId);
       const token = (await client.getAccessToken()).token;
       if (token) await client.revokeToken(token);
    } catch (e) {
       console.error("Failed to revoke token, but deleting from db anyway", e);
    }
    
    await db.collection('integration_credentials').doc(userId).delete();
    res.json({ success: true });
  });

  // API Proxy - Gmail Send
  router.post('/gmail/send', authMiddleware, async (req, res) => {
    try {
      const { to, subject, message } = req.body;
      const client = await getAuthenticatedClient((req as any).user.uid);
      const gmail = google.gmail({ version: 'v1', auth: client as any as any });
      
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `To: ${to}`,
        `Subject: ${utf8Subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        message
      ];
      
      const messageStr = messageParts.join('\n');
      const encodedMessage = Buffer.from(messageStr).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage }
      });
      
      res.json(result.data);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'GMAIL_ERROR', message: e.message });
    }
  });

  // Calendar
  router.post('/calendar/events', authMiddleware, async (req, res) => {
    try {
      const client = await getAuthenticatedClient((req as any).user.uid);
      const calendar = google.calendar({ version: 'v3', auth: client as any as any });
      const result = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        sendUpdates: 'all',
        requestBody: req.body
      });
      res.json(result.data);
    } catch (e: any) {
      res.status(500).json({ error: 'CALENDAR_ERROR', message: e.message });
    }
  });

  // Drive Create Folder
  router.post('/drive/folders', authMiddleware, async (req, res) => {
    try {
      const client = await getAuthenticatedClient((req as any).user.uid);
      const drive = google.drive({ version: 'v3', auth: client as any });
      const result = await drive.files.create({
        requestBody: req.body,
        fields: 'id, name, webViewLink'
      });
      res.json(result.data);
    } catch (e: any) {
      res.status(500).json({ error: 'DRIVE_ERROR', message: e.message });
    }
  });

  // Drive Search
  router.get('/drive/search', authMiddleware, async (req, res) => {
    try {
      const client = await getAuthenticatedClient((req as any).user.uid);
      const drive = google.drive({ version: 'v3', auth: client as any });
      const result = await drive.files.list({
        q: req.query.q as string,
        fields: 'files(id, name, mimeType, webViewLink, createdTime)',
        pageSize: 10
      });
      res.json(result.data.files || []);
    } catch (e: any) {
      res.status(500).json({ error: 'DRIVE_ERROR', message: e.message });
    }
  });

  // Sheets
  router.post('/sheets', authMiddleware, async (req, res) => {
    try {
      const client = await getAuthenticatedClient((req as any).user.uid);
      const sheets = google.sheets({ version: 'v4', auth: client as any as any });
      
      const createRes = await sheets.spreadsheets.create({
        requestBody: { properties: { title: req.body.title } }
      });
      const spreadsheetId = createRes.data.spreadsheetId!;
      
      if (req.body.sheetData && req.body.sheetData.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Sheet1',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: req.body.sheetData }
        });
      }
      res.json(createRes.data);
    } catch (e: any) {
      res.status(500).json({ error: 'SHEETS_ERROR', message: e.message });
    }
  });

  return router;
}
