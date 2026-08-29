import express from 'express';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin
let db: Firestore | null = null;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    initializeApp({
      projectId: 'gen-lang-client-0467065981'
    });
  }
  db = getFirestore('ai-studio-remixremixkymrst-beeda92b-77a0-4bfa-a083-53618ab3416e');
} catch (e) {
  console.warn('Firebase Admin init warning:', e);
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

  // Rate Limiting (Simple In-Memory)
  const rateLimitMap = new Map<string, number[]>();
  const WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_REQUESTS = 5;

  const rateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const windowTimestamps = timestamps.filter(t => now - t < WINDOW_MS);
    if (windowTimestamps.length >= MAX_REQUESTS) {
      return res.status(429).json({ error: 'RATE_LIMITED', message: 'Too many requests. Please try again shortly.' });
    }
    windowTimestamps.push(now);
    rateLimitMap.set(ip, windowTimestamps);
    next();
  };

  // Middleware
  app.use(express.json({
    verify: (req, res, buf) => {
      (req as any).rawBody = buf;
    }
  }));
  
  // CORS Configuration for the API
  const allowedOrigins = [
    'https://kymrstudio.com', 
    'https://www.kymrstudio.com',
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
        callback(new Error('Not allowed by CORS'));
      }
    }
  }));

  // ==========================================
  // PUBLIC API ENDPOINTS
  // ==========================================

  // 1. Submit Public Inquiry
  app.post('/api/public/inquiries', rateLimiter, async (req, res) => {
    try {
      const idempotencyKey = req.headers['idempotency-key'] as string;
      if (idempotencyKey && db) {
        const idempDoc = await db.collection('idempotency_keys').doc(idempotencyKey).get();
        if (idempDoc.exists) {
          return res.status(200).json({ 
            success: true, 
            inquiryId: idempDoc.data()?.inquiryId,
            message: 'Idempotent replay' 
          });
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

      // Construct safe payload (ignoring any injected internal fields)
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
      
      // If Start.jsx sends config/tier at top level, map it to scopeRequest
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
        await db.collection('idempotency_keys').doc(idempotencyKey).set({
          inquiryId: docRef.id,
          createdAt: FieldValue.serverTimestamp()
        });
      }

      return res.status(201).json({
        success: true,
        inquiryId: docRef.id
      });
    } catch (error: any) {
      console.error('Error submitting inquiry:', error);
      // Do not expose stack traces or details to public caller
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to submit inquiry' });
    }
  });

  // 2. Cal.com Webhook
  app.post('/api/webhooks/calcom', async (req, res) => {
    try {
      // Validate webhook signature if secret is configured
      const signature = req.headers['x-cal-signature-256'] as string;
      const secret = process.env.CALCOM_WEBHOOK_SECRET;
      
      if (secret) {
        if (!signature) {
          return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing webhook signature' });
        }
        const expectedSignature = crypto.createHmac('sha256', secret).update((req as any).rawBody || JSON.stringify(req.body)).digest('hex');
        if (signature !== expectedSignature) {
          return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid webhook signature' });
        }
      }
      
      const eventType = req.body.triggerEvent;
      const payload = req.body.payload;

      if (!db) {
        return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Database not initialized' });
      }

      if (eventType === 'MEETING_ENDED') {
         // handle meeting ended logic if necessary
      }

      if (eventType === 'BOOKING_CREATED') {
        const attendeeEmail = payload.attendees?.[0]?.email?.toLowerCase();
        const attendeeName = payload.attendees?.[0]?.name;
        const externalId = payload.uid || payload.id;
        
        // Idempotency check: see if meeting already exists
        const existingMeeting = await db.collection('meetings').where('externalBookingId', '==', externalId).get();
        if (!existingMeeting.empty) {
          return res.status(200).json({ success: true, message: 'Already processed' });
        }

        let relatedInquiryId = null;
        let relatedClientId = null;

        if (attendeeEmail) {
          // Attempt to link to Client
          const clientsSnapshot = await db.collection('clients').where('email', '==', attendeeEmail).limit(1).get();
          if (!clientsSnapshot.empty) {
            relatedClientId = clientsSnapshot.docs[0].id;
          } else {
            // Attempt to link to Inquiry
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
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        };

        await db.collection('meetings').add(meetingData);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to process webhook' });
    }
  });


  // ==========================================
  // VITE & FRONTEND SERVING
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use('/admin', vite.middlewares);
    
    // Serve public app in dev
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
