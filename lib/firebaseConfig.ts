  import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCP8mhn038kDGkxkRBQb_TVLnCetb5aG0A",
  authDomain: "mellowverse-f144f.firebaseapp.com",
  projectId: "mellowverse-f144f",
  storageBucket: "mellowverse-f144f.firebasestorage.app",
  messagingSenderId: "185408173853",
  appId: "1:185408173853:web:4f4469bc437c15861913f4",
  measurementId:"G-FR0HDLNC4V"
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }