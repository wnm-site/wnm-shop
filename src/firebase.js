import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCQkX3f0ZqBwtnauBfaydQPiU_kaG5KAfI",
  authDomain: "e-com-ddd.firebaseapp.com",
  projectId: "e-com-ddd",
  storageBucket: "e-com-ddd.appspot.com",  // ← Use .appspot.com NOT .firebasestorage.app
  messagingSenderId: "574401916360",
  appId: "1:574401916360:web:f06e079d2dcae7177a24fd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;