import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore('ai-studio-remixremixkymrst-beeda92b-77a0-4bfa-a083-53618ab3416e');

async function testQuoteWorkflow() {
  console.log("=== SYNTHETIC SAVE-DRAFT TEST ===");
  // 1. Create a synthetic Quote via Admin SDK to mimic UI
  const formState: any = {
    title: '4B DEEP QUOTE TEST',
    status: 'DRAFT',
    clientId: 'synthetic-client-123',
    inquiryId: undefined, // test undefined stripping
    items: [{ name: 'Test Item', rate: 100, quantity: 1, currency: 'USD', unit: undefined, description: undefined }],
    subtotal: 100,
    tax: 10,
    discount: 0,
    total: 110,
    currency: 'USD'
  };

  const cleanFirestorePayload = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date || obj instanceof FieldValue) return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => cleanFirestorePayload(item));
    }
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key of Object.keys(obj)) {
        if (obj[key] !== undefined) {
          cleaned[key] = cleanFirestorePayload(obj[key]);
        }
      }
      return cleaned;
    }
    return obj;
  };

  const dataToSave = cleanFirestorePayload({ ...formState });

  const quoteRef = db.collection('quotes').doc();
  await quoteRef.set({
    ...dataToSave,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  console.log("Save Draft successful! Quote ID:", quoteRef.id);
  
  // Verify
  const doc = await quoteRef.get();
  console.log("Firestore document exists:", doc.exists);
  console.log("clientId correct:", doc.data()?.clientId === 'synthetic-client-123');
  console.log("Status correct:", doc.data()?.status === 'DRAFT');
  console.log("Totals correct:", doc.data()?.total === 110);
  console.log("Line items correct:", doc.data()?.items[0].name === 'Test Item');

  console.log("\n=== INQUIRY QUOTE TEST ===");
  
  // Create an inquiry
  const inqRef = db.collection('inquiries').doc();
  await inqRef.set({
    name: 'Synthetic Inquiry For Quote',
    email: 'synth@quote.com',
    status: 'NEW',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  // Quote with inquiry
  const inqQuote = {
    ...dataToSave,
    inquiryId: inqRef.id,
    title: 'Quote for Inquiry'
  };

  const inqQuoteRef = db.collection('quotes').doc();
  await inqQuoteRef.set({
    ...inqQuote,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  // Then SEND QUOTE flow updates inquiry (simulated here since the test doesn't send email)
  console.log("Inquiry Quote created:", inqQuoteRef.id);
  console.log("Inquiry linkage:", (await inqQuoteRef.get()).data()?.inquiryId === inqRef.id);
  
  await inqRef.update({ status: 'QUOTED' });
  console.log("Inquiry status updated to QUOTED:", (await inqRef.get()).data()?.status === 'QUOTED');

  console.log("\n=== CHECK PARTIAL FAILED QUOTES ===");
  const failedQs = await db.collection('quotes').where('total', '==', 121).get();
  console.log("Partial Quote from user failure found:", !failedQs.empty);
  if (!failedQs.empty) {
    console.log("Partial Quote ID:", failedQs.docs[0].id);
  }
}

testQuoteWorkflow().catch(console.error);
