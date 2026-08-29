import { initializeApp, applicationDefault } from 'firebase-admin/app';
try {
  initializeApp({ credential: applicationDefault(), projectId: 'gen-lang-client-0467065981' });
  console.log("Init OK");
} catch(e) {
  console.log("Caught:", e);
}
