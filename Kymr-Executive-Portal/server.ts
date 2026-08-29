import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getVercelOidcToken } from '@vercel/functions/oidc';
import { ExternalAccountClient } from 'google-auth-library';

// Initialize Firebase Admin
let db: Firestore | null = null;
try {
  let hasCredentials = false;
  let initConfig: any = {
    projectId: 'gen-lang-client-0467065981'
  };

  // 1. Vercel Workload Identity Federation (Keyless OIDC)
  if (process.env.GCP_WORKLOAD_IDENTITY_POOL_ID && process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID && process.env.GCP_PROJECT_NUMBER && process.env.GCP_SERVICE_ACCOUNT_EMAIL) {
    try {
      const audience = `//iam.googleapis.com/projects/${process.env.GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${process.env.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`;
      
      const authClient = ExternalAccountClient.fromJSON({
        type: 'external_account',
        audience: audience,
        subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
        token_url: 'https://sts.googleapis.com/v1/token',
        service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
        subject_token_supplier: {
          getSubjectToken: async () => await getVercelOidcToken(),
        },
      });

      initConfig.credential = {
        getAccessToken: async () => {
          const token = await authClient.getAccessToken();
          return {
            access_token: token.token!,
            expires_in: 3600
          };
        }
      };
      hasCredentials = true;
    } catch (e) {
      console.warn('Failed to configure Vercel OIDC Workload Identity Federation:', e);
    }
  }
  // 2. Explicit Service Account (Legacy/Fallback)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      // Safely parse JSON and handle newlines in private key
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      initConfig.credential = cert(serviceAccount);
      hasCredentials = true;
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is valid JSON.');
    }
  } 
  // 3. Explicit ADC File Path (Standard Local GCP Tooling)
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    hasCredentials = true;
  }
  // 4. Managed Google Cloud Environment (Cloud Run, Functions, App Engine)
  else if (process.env.K_SERVICE || process.env.FUNCTION_TARGET || process.env.GOOGLE_CLOUD_PROJECT) {
    hasCredentials = true;
  }

  if (hasCredentials) {
    initializeApp(initConfig);
    // Use canonical named database as instructed
    db = getFirestore('ai-studio-remixremixkymrst-beeda92b-77a0-4bfa-a083-53618ab3416e');
  } else {
    console.warn('Firebase Admin init skipped: No keyless OIDC config, no ADC, and no FIREBASE_SERVICE_ACCOUNT_KEY found. Backend CRM features will return 500.');
  }
} catch (e) {
  console.warn('Firebase Admin init error:', e);
}

const app = express();

// Rate Limiting (Firestore-backed for serverless consistency)
const rateLimiter = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!db) return next();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const WINDOW_MS = 60 * 1000;
  const MAX_REQUESTS = 5;

  try {
    const ref = db.collection('rate_limits').doc(ip.replace(/[^a-zA-Z0-9.-]/g, '_'));
    await db.runTransaction(async (t) => {
      const doc = await t.get(ref);
      if (!doc.exists) {
        t.set(ref, { count: 1, resetTime: now + WINDOW_MS });
      } else {
        const data = doc.data()!;
        if (now > data.resetTime) {
          t.set(ref, { count: 1, resetTime: now + WINDOW_MS });
        } else if (data.count >= MAX_REQUESTS) {
          throw new Error('RATE_LIMITED');
        } else {
          t.update(ref, { count: FieldValue.increment(1) });
        }
      }
    });
    next();
  } catch (e: any) {
    if (e.message === 'RATE_LIMITED') {
      return res.status(429).json({ error: 'RATE_LIMITED', message: 'Too many requests. Please try again shortly.' });
    }
    next();
  }
};

// Middleware
app.use(express.json({
  verify: (req, res, buf) => {
    (req as any).rawBody = buf;
  }
}));

import { createGoogleRouter } from './google-backend';
import { createBusinessLifecycleRouter } from './business-lifecycle';

// CORS Configuration for the API
const allowedOrigins = [
  'https://kymrstudio.com', 
  'https://www.kymrstudio.com',
  'http://localhost:8000',
  'http://localhost:5173', // Vite dev client
  'http://localhost:3000'
];

if (process.env.PUBLIC_WEBSITE_URL) {
  allowedOrigins.push(process.env.PUBLIC_WEBSITE_URL);
}

app.use('/api', cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Mount Google Backend API
app.use('/api/google', createGoogleRouter(db));

// Mount Business Lifecycle API
app.use('/api/admin', createBusinessLifecycleRouter(db));

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// 1. Submit Public Inquiry
app.post('/api/public/inquiries', rateLimiter, async (req, res) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'] as string;
    
    // FIX: Prompt 4A - Atomic Idempotency Check using .create()
    if (idempotencyKey && db) {
      try {
        await db.collection('idempotency_keys').doc(idempotencyKey).create({
          createdAt: FieldValue.serverTimestamp(),
          status: 'PENDING'
        });
      } catch (e: any) {
        if (e.code === 6) { // ALREADY_EXISTS in Firebase Admin
          const existing = await db.collection('idempotency_keys').doc(idempotencyKey).get();
          if (existing.exists && existing.data()?.inquiryId) {
             return res.status(200).json({ success: true, inquiryId: existing.data()?.inquiryId, message: 'Idempotent replay' });
          } else {
             return res.status(429).json({ error: 'CONCURRENT_REQUEST', message: 'Request is already processing' });
          }
        }
        throw e;
      }
    }

    const { 
      name, email, phone, company, website, 
      message, serviceInterest, budgetRange, 
      source, submissionType, scopeRequest, externalBookingId 
    } = req.body;

    // Strict validation logic
    if (!db) {
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Database not initialized' });
    }
    if (!name || typeof name !== 'string' || name.length > 255) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Valid name is required' });
    }
    if (email && (typeof email !== 'string' || !email.includes('@') || email.length > 255)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Valid email is required' });
    }
    
    const allowedSources = ['website', 'referral', 'organic', 'cal.com'];
    if (source && !allowedSources.includes(source)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid source' });
    }

    const allowedTypes = ['BOOKING', 'CONFIGURED_SCOPE', 'CONTACT_FORM', 'GENERAL_INQUIRY'];
    if (submissionType && !allowedTypes.includes(submissionType)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid submissionType' });
    }

    // Construct safe payload
    const payload: any = {
      name: name.trim(),
      status: 'NEW',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    if (email) payload.email = email.trim().toLowerCase();
    if (phone && typeof phone === 'string') payload.phone = phone.trim().substring(0, 50);
    if (company && typeof company === 'string') payload.company = company.trim().substring(0, 255);
    if (website && typeof website === 'string') payload.website = website.trim().substring(0, 255);
    if (message && typeof message === 'string') payload.message = message.trim().substring(0, 2000);
    if (serviceInterest && typeof serviceInterest === 'string') payload.serviceInterest = serviceInterest.substring(0, 255);
    if (budgetRange && typeof budgetRange === 'string') payload.budgetRange = budgetRange.substring(0, 255);
    if (source) payload.source = source;
    if (submissionType) payload.submissionType = submissionType;
    if (externalBookingId && typeof externalBookingId === 'string') payload.externalBookingId = externalBookingId;
    
    const reqConfig = req.body.config;
    const reqTier = req.body.tier;
    if (reqConfig || scopeRequest) {
      payload.scopeRequest = {
        volume: reqConfig?.volume || scopeRequest?.volume || null,
        mix: reqConfig?.mix || scopeRequest?.mix || null,
        cadence: reqConfig?.cadence || scopeRequest?.cadence || null,
        tier: reqTier || scopeRequest?.tier || null
      };
    }

    const docRef = await db.collection('inquiries').add(payload);

    if (idempotencyKey && db) {
      await db.collection('idempotency_keys').doc(idempotencyKey).update({
        inquiryId: docRef.id,
        status: 'DONE',
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return res.status(201).json({
      success: true,
      inquiryId: docRef.id
    });
  } catch (error: any) {
    console.error('Error submitting inquiry:', error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to submit inquiry' });
  }
});

// 2. Cal.com Webhook
app.post('/api/webhooks/calcom', async (req, res) => {
  try {
    const signature = req.headers['x-cal-signature-256'] as string;
    const secret = process.env.CALCOM_WEBHOOK_SECRET;
    
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: CALCOM_WEBHOOK_SECRET is not configured in production.');
        return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Server misconfiguration' });
      }
      console.warn('WARNING: CALCOM_WEBHOOK_SECRET not set. Bypassing signature verification in development.');
    } else {
      if (!signature) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing webhook signature' });
      }
      
      // FIX: Prompt 4A - Vercel robust raw-body fallback
      // `req.rawBody` is set by our express.json middleware. Vercel sometimes stringifies `req.body` cleanly, but `rawBody` is safest.
      const payloadString = (req as any).rawBody ? (req as any).rawBody.toString('utf8') : JSON.stringify(req.body);
      const expectedSignature = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
      
      if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid webhook signature' });
      }
    }
    
    const eventType = req.body.triggerEvent;
    const payload = req.body.payload;

    if (!db) {
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Database not initialized' });
    }

    if (eventType === 'BOOKING_CREATED') {
      const attendeeEmail = payload.attendees?.[0]?.email?.toLowerCase();
      const attendeeName = payload.attendees?.[0]?.name;
      const externalId = payload.uid || payload.id;
      
      const existingMeeting = await db.collection('meetings').where('externalBookingId', '==', externalId).get();
      if (!existingMeeting.empty) {
        return res.status(200).json({ success: true, message: 'Already processed' });
      }

      let relatedInquiryId = null;
      let relatedClientId = null;

      if (attendeeEmail) {
        const clientsSnapshot = await db.collection('clients').where('email', '==', attendeeEmail).limit(1).get();
        if (!clientsSnapshot.empty) {
          relatedClientId = clientsSnapshot.docs[0].id;
        } else {
          const inquirySnapshot = await db.collection('inquiries').where('email', '==', attendeeEmail).orderBy('createdAt', 'desc').limit(1).get();
          if (!inquirySnapshot.empty) {
            relatedInquiryId = inquirySnapshot.docs[0].id;
          }
        }
      }

      const meetingData = {
        title: payload.title || 'Scheduled Meeting',
        date: Timestamp.fromDate(new Date(payload.startTime)),
        durationMinutes: payload.duration || 30,
        attendeeName: attendeeName || 'Guest',
        attendeeEmail: attendeeEmail || '',
        status: 'SCHEDULED',
        meetUrl: payload.metadata?.videoCallUrl || payload.videoCallData?.url || '',
        externalBookingId: externalId,
        externalProvider: 'CAL.COM',
        inquiryId: relatedInquiryId,
        clientId: relatedClientId,
        providerVerified: true,
        source: 'CAL.COM',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await db.collection('meetings').add(meetingData);
    } else if (eventType === 'BOOKING_CANCELLED') {
      const externalId = payload.uid || payload.id;
      if (externalId) {
        const existingMeeting = await db.collection('meetings').where('externalBookingId', '==', externalId).get();
        if (!existingMeeting.empty) {
          await existingMeeting.docs[0].ref.update({
            status: 'CANCELLED',
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      }
    } else if (eventType === 'BOOKING_RESCHEDULED') {
      const externalId = payload.uid || payload.id;
      if (externalId) {
        const existingMeeting = await db.collection('meetings').where('externalBookingId', '==', externalId).get();
        if (!existingMeeting.empty) {
          await existingMeeting.docs[0].ref.update({
            date: Timestamp.fromDate(new Date(payload.startTime)),
            meetUrl: payload.metadata?.videoCallUrl || payload.videoCallData?.url || existingMeeting.docs[0].data().meetUrl,
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to process webhook' });
  }
});

// Export the Express API for Vercel
export default app;

// Local Development Server Execution
async function startLocalServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use('/admin', vite.middlewares);
    
    const publicDist = path.join(process.cwd(), 'public-app', 'build');
    app.use(express.static(publicDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(publicDist, 'index.html'));
    });
  } else {
    const adminDist = path.join(process.cwd(), 'dist');
    const publicDist = path.join(process.cwd(), 'public-app', 'build');
    
    app.use('/admin', express.static(adminDist));
    app.get('/admin/*', (req, res) => {
      res.sendFile(path.join(adminDist, 'index.html'));
    });
    
    app.use(express.static(publicDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(publicDist, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// Only start the server locally if not running in Vercel
if (!process.env.VERCEL) {
  startLocalServer();
}
