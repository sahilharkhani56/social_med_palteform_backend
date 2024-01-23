import firebase from 'firebase/compat/app'
import "firebase/compat/firestore"
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
    apiKey: `${process.env.FIREBASE_API_KEY}`,
    authDomain: `${process.env.FIREBASE_AUTH_DOMAIN}`,
    projectId: `clickcreate-7de20`,
    storageBucket: `${process.env.FIREBASE_STORAGE_BUCKET}`,
    messagingSenderId: `${process.env.FIREBASE_MESSAGING_SENDER_ID}`,
    appId: `${process.env.FIREBASE_APP_ID}`,
    measurementId: `${process.env.MEASUREMENT_ID}`
  };
const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db=getFirestore(app)
export default app;

