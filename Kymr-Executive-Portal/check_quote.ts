import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore('ai-studio-remixremixkymrst-beeda92b-77a0-4bfa-a083-53618ab3416e');

async function checkQuoteFailure() {
  console.log("Checking for partial quotes...");
  
  // Look for quotes that might have been created around now
  const quotesSnap = await db.collection('quotes').orderBy('createdAt', 'desc').limit(5).get();
  
  quotesSnap.forEach(doc => {
    console.log(`Found quote: ${doc.id} - title: ${doc.data().title} - total: ${doc.data().total}`);
  });

  console.log("\nReproducing undefined fields error for Quotes:");
  try {
    const testDoc = db.collection('quotes').doc('test-quote-fail');
    await testDoc.set({
      title: "Test Proposal",
      clientId: "some-client",
      inquiryId: undefined, // this should throw
      total: 121
    });
  } catch (e: any) {
    console.log("Error caught:");
    console.log("Code:", e.code);
    console.log("Message:", e.message);
  }
}

checkQuoteFailure().catch(console.error);
