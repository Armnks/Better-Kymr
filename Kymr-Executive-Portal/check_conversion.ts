import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Use Application Default Credentials
initializeApp();
const db = getFirestore('ai-studio-remixremixkymrst-beeda92b-77a0-4bfa-a083-53618ab3416e');

async function checkFailedConversion() {
  console.log("Checking inquiries for failed conversion...");
  
  // Find inquiries that might have been converted but have issues
  const inquiriesSnap = await db.collection('inquiries').get();
  
  let targetInquiry = null;
  let partialClient = null;

  // Let's find the specific inquiry that failed in the manual test.
  // The manual test was against a "real existing Inquiry".
  
  for (const doc of inquiriesSnap.docs) {
    const data = doc.data();
    // Maybe it failed but partial client was created
    const clientsSnap = await db.collection('clients').where('email', '==', data.email || '').get();
    
    // Check if there's any client with this inquiry's email but the inquiry is not marked WON,
    // OR inquiry is marked WON but no convertedClientId, etc.
    
    // Just dump all inquiries to find the one the user clicked.
    // The user clicked "CONVERT TO CLIENT" on a real inquiry and got an error.
    // It's likely an inquiry with undefined fields like company, website, phone.
    if (data.email && data.email !== 'test@synthetic.com') {
       console.log(`Real Inquiry found: ${doc.id} - ${data.email} - status: ${data.status}`);
       if (data.status !== 'WON') {
         targetInquiry = { id: doc.id, ...data };
       }
    }
  }

  if (targetInquiry) {
    console.log(`\nFound potential target inquiry: ${targetInquiry.id}`);
    
    // Check for partial clients
    const clientsSnap = await db.collection('clients')
        .where('email', '==', targetInquiry.email)
        .get();
        
    if (!clientsSnap.empty) {
       console.log(`Partial client found!`);
       clientsSnap.forEach(c => console.log(c.id, c.data()));
    } else {
       console.log(`No partial client found for ${targetInquiry.email}`);
    }
  }

  // Reproduce the error programmatically
  console.log("\nReproducing undefined fields error:");
  try {
    const testDoc = db.collection('clients').doc('test-dummy');
    await testDoc.set({
      name: "Test",
      company: undefined, // this should throw
      email: "test@test.com"
    });
  } catch (e: any) {
    console.log("Error caught:");
    console.log("Code:", e.code);
    console.log("Message:", e.message);
  }
}

checkFailedConversion().catch(console.error);
