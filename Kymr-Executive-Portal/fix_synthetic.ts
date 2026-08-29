import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let initConfig: any = {
  projectId: 'gen-lang-client-0467065981'
};
initializeApp(initConfig);
const db = getFirestore('ai-studio-remixremixkymrst-beeda92b-77a0-4bfa-a083-53618ab3416e');

async function fixSyntheticMeeting() {
  const snapshot = await db.collection('meetings').where('title', '==', 'Synthetic Strategy Call').get();
  for (const doc of snapshot.docs) {
    await doc.ref.update({
      isSynthetic: true
    });
    console.log(`Updated meeting ${doc.id} as synthetic.`);
  }
}

fixSyntheticMeeting().catch(console.error);
