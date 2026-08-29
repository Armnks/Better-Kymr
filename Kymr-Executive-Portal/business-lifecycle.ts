import express from 'express';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'crypto';

export function createBusinessLifecycleRouter(db: Firestore | null) {
  const router = express.Router();

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

  const cleanUndefined = (obj: any): any => {
    if (obj === undefined) return null;
    if (obj === null) return null;
    if (Array.isArray(obj)) return obj.map(cleanUndefined);
    if (typeof obj === 'object') {
      if (obj.toDate) return obj; // Timestamp
      const res: any = {};
      Object.keys(obj).forEach(k => {
        if (obj[k] !== undefined) res[k] = cleanUndefined(obj[k]);
      });
      return res;
    }
    return obj;
  };

  router.post('/quotes/:quoteId/accept', authMiddleware, async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB_MISSING' });
    const { quoteId } = req.params;
    const actorId = (req as any).user.uid;

    try {
      const result = await db.runTransaction(async (t) => {
        const quoteRef = db.collection('quotes').doc(quoteId);
        const quoteDoc = await t.get(quoteRef);

        if (!quoteDoc.exists) {
          throw new Error('QUOTE_NOT_FOUND');
        }

        const quote = quoteDoc.data()!;

        if (quote.status === 'ACCEPTED') {
          return { success: true, message: 'ALREADY_ACCEPTED', quoteId, projectId: quote.projectId, clientId: quote.clientId, invoiceId: quote.invoiceId };
        }

        let clientId = quote.clientId;
        let inquiryRef: any = null;
        let inquiry: any = null;

        if (quote.inquiryId) {
          inquiryRef = db.collection('inquiries').doc(quote.inquiryId);
          const inquiryDoc = (await t.get(inquiryRef as any)) as any;
          if (inquiryDoc.exists) {
            inquiry = inquiryDoc.data()!;
            if (inquiry.convertedClientId) {
              clientId = inquiry.convertedClientId;
            } else if (!clientId) {
              // Convert inquiry to client
              const newClientRef = db.collection('clients').doc();
              clientId = newClientRef.id;
              t.set(newClientRef, {
                name: inquiry.name,
                email: inquiry.email || null,
                phone: inquiry.phone || null,
                company: inquiry.company || null,
                website: inquiry.website || null,
                sourceInquiryId: quote.inquiryId,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
              });
              
              // Activity: Client Created
              const actClientRef = db.collection('activity').doc();
              t.set(actClientRef, {
                type: 'CLIENT_CREATED',
                actorId,
                entityType: 'CLIENT',
                entityId: clientId,
                description: `Client automatically converted from inquiry during quote acceptance`,
                createdAt: FieldValue.serverTimestamp()
              });
            }
          }
        }

        if (!clientId) {
          throw new Error('CLIENT_MISSING');
        }

        // Project Creation
        let projectId = quote.projectId;
        if (!projectId) {
          const newProjectRef = db.collection('projects').doc();
          projectId = newProjectRef.id;
          t.set(newProjectRef, {
            name: quote.title,
            clientId: clientId,
            quoteId: quoteId,
            sourceInquiryId: quote.inquiryId || null,
            status: 'PLANNING',
            budget: quote.total || 0,
            currency: quote.currency || 'USD',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          });

          // Activity: Project Created
          const actProjRef = db.collection('activity').doc();
          t.set(actProjRef, {
            type: 'PROJECT_CREATED',
            actorId,
            entityType: 'PROJECT',
            entityId: projectId,
            relatedClientId: clientId,
            description: `Project created from accepted quote: ${quote.title}`,
            createdAt: FieldValue.serverTimestamp()
          });
        }

        // Invoice Creation (Auto on Acceptance)
        let invoiceId = quote.invoiceId;
        if (!invoiceId) {
          const newInvoiceRef = db.collection('invoices').doc();
          invoiceId = newInvoiceRef.id;
          const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
          t.set(newInvoiceRef, cleanUndefined({
            invoiceNumber,
            title: `Invoice for ${quote.title}`,
            clientId: clientId,
            projectId: projectId,
            quoteId: quoteId,
            status: 'DRAFT',
            items: quote.items || [],
            subtotal: quote.subtotal || 0,
            discount: quote.discount || 0,
            discountType: quote.discountType || 'FIXED',
            tax: quote.tax || 0,
            total: quote.total || 0,
            amountPaid: 0,
            currency: quote.currency || 'USD',
            issueDate: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          }));

          // Activity: Invoice Created
          const actInvRef = db.collection('activity').doc();
          t.set(actInvRef, {
            type: 'INVOICE_CREATED',
            actorId,
            entityType: 'INVOICE',
            entityId: invoiceId,
            relatedClientId: clientId,
            relatedProjectId: projectId,
            description: `Invoice ${invoiceNumber} created from accepted quote`,
            createdAt: FieldValue.serverTimestamp()
          });
        }

        // Update Quote
        t.update(quoteRef, {
          status: 'ACCEPTED',
          acceptedAt: FieldValue.serverTimestamp(),
          clientId: clientId,
          projectId: projectId,
          invoiceId: invoiceId,
          updatedAt: FieldValue.serverTimestamp()
        });

        // Activity: Quote Accepted
        const actQuoteRef = db.collection('activity').doc();
        t.set(actQuoteRef, {
          type: 'QUOTE_ACCEPTED',
          actorId,
          entityType: 'QUOTE',
          entityId: quoteId,
          relatedClientId: clientId,
          description: `Quote accepted: ${quote.title}`,
          createdAt: FieldValue.serverTimestamp()
        });

        // Update Inquiry if present
        if (inquiryRef && inquiry && inquiry.status !== 'WON') {
          t.update(inquiryRef, {
            status: 'WON',
            convertedClientId: clientId,
            updatedAt: FieldValue.serverTimestamp()
          });
          
          const actInqRef = db.collection('activity').doc();
          t.set(actInqRef, {
            type: 'INQUIRY_STATUS_CHANGED',
            actorId,
            entityType: 'INQUIRY',
            entityId: quote.inquiryId,
            description: `Inquiry won via quote acceptance`,
            createdAt: FieldValue.serverTimestamp()
          });
        }

        return { success: true, quoteId, projectId, clientId, invoiceId };
      });

      res.json(result);
    } catch (e: any) {
      console.error('Lifecycle Error:', e);
      res.status(500).json({ error: e.message || 'LIFECYCLE_ERROR' });
    }
  });

  // Generate Invoice via Swipe API
  router.post('/invoices/generate', authMiddleware, async (req, res) => {
    if (!db) return res.status(500).json({ error: 'DB_MISSING' });
    const { projectId } = req.body;
    const actorId = (req as any).user.uid;

    if (!projectId) return res.status(400).json({ error: 'PROJECT_ID_REQUIRED' });

    try {
      const result = await db.runTransaction(async (t) => {
        // Idempotency / Duplicate Check
        const invoicesRef = db.collection('invoices');
        const q = invoicesRef.where('projectId', '==', projectId).limit(1);
        const existingDocs = await t.get(q);
        
        if (!existingDocs.empty) {
          const existing = existingDocs.docs[0];
          return { success: true, message: 'ALREADY_GENERATED', invoiceId: existing.id };
        }

        const projRef = db.collection('projects').doc(projectId);
        const projDoc = await t.get(projRef);
        if (!projDoc.exists) throw new Error('PROJECT_NOT_FOUND');
        const project = projDoc.data()!;

        const clientRef = db.collection('clients').doc(project.clientId);
        const clientDoc = await t.get(clientRef);
        if (!clientDoc.exists) throw new Error('CLIENT_NOT_FOUND');
        const client = clientDoc.data()!;

        // Check required fields
        if (!client.company && !client.name) throw new Error('CLIENT_NAME_MISSING');
        if (!project.budget) throw new Error('PROJECT_BUDGET_MISSING');

        // Try Swipe API
        let swipeInvoiceId = null;
        let swipeInvoiceNumber = null;
        let swipePdfUrl = null;
        
        if (process.env.SWIPE_API_KEY) {
          
          // First ensure customer exists/is updated
          const customerRes = await fetch('https://app.getswipe.in/api/partner/v2/customer', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + process.env.SWIPE_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              customer_id: clientRef.id,
              name: client.company || client.name,
              email: client.email || '',
              phone_number: client.phone || ''
            })
          });
          const customerData = await customerRes.json();
          // We don't block if customer creation fails or says already exists, we will attempt doc anyway.

          const swipePayload = {
            document_type: 'invoice',
            customer_id: clientRef.id,
            document_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: [
              {
                id: `proj-${projectId}`,
                item_type: 'Service',
                name: `Project Deliverables: ${project.name}`,
                quantity: 1,
                unit_price: project.budget || 0,
                net_amount: project.budget || 0,
                price_with_tax: project.budget || 0,
                total_amount: project.budget || 0
              }
            ]
          };
          
          const swipeRes = await fetch('https://app.getswipe.in/api/partner/v2/doc', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + process.env.SWIPE_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(swipePayload)
          });
          const swipeData = await swipeRes.json();
          
          if (swipeData.success && swipeData.data) {
             swipeInvoiceId = swipeData.data.hash_id || swipeData.data.id || null;
             swipeInvoiceNumber = swipeData.data.serial_number || null;
             swipePdfUrl = swipeData.data.pdf_url || swipeData.data.document_url || null;
          } else {
             console.error('Swipe API Error during generation:', swipeData);
             throw new Error('SWIPE_API_FAIL: ' + JSON.stringify(swipeData.errors || swipeData.message));
          }
        } else {
           throw new Error('SWIPE_CREDENTIALS_MISSING');
        }

        // Persist Normalized Invoice to Firestore
        const newInvoiceRef = db.collection('invoices').doc();
        const invoiceData = {
          invoiceNumber: swipeInvoiceNumber,
          externalProvider: 'SWIPE',
          externalInvoiceId: swipeInvoiceId,
          externalCustomerId: clientRef.id,
          clientId: project.clientId,
          projectId: projectId,
          quoteId: project.quoteId || null,
          sourceInquiryId: project.sourceInquiryId || null,
          clientName: client.company || client.name,
          clientEmail: client.email || null,
          lineItems: [{ name: `Project Deliverables: ${project.name}`, quantity: 1, rate: project.budget }],
          subtotal: project.budget || 0,
          tax: 0,
          total: project.budget || 0,
          currency: project.currency || 'USD',
          status: 'DRAFT',
          documentUrl: swipePdfUrl,
          issueDate: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        };
        
        // Clean undefined (we already do this cleanly in firestore or with cleanUndefined)
        const cleanPayload = cleanUndefined(invoiceData);
        t.set(newInvoiceRef, cleanPayload);

        // Activity
        const actRef = db.collection('activity').doc();
        t.set(actRef, {
          type: 'INVOICE_CREATED',
          actorId,
          entityType: 'INVOICE',
          entityId: newInvoiceRef.id,
          relatedClientId: project.clientId,
          relatedProjectId: projectId,
          description: `Generated Swipe Invoice ${swipeInvoiceNumber || ''}`,
          createdAt: FieldValue.serverTimestamp()
        });
        
        return { success: true, invoiceId: newInvoiceRef.id, swipeInvoiceId, swipeInvoiceNumber };
      });

      res.json(result);
    } catch (e: any) {
      console.error('Invoice Generation Error:', e);
      res.status(500).json({ error: e.message || 'INVOICE_GEN_ERROR' });
    }
  });

  return router;
}
