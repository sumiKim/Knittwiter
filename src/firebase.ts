// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAFny_D9jfuSluK-s5BDfD1gFY2c4hoXSk',
  authDomain: 'knitwitter-a6937.firebaseapp.com',
  projectId: 'knitwitter-a6937',
  storageBucket: 'knitwitter-a6937.firebasestorage.app',
  messagingSenderId: '943114580937',
  appId: '1:943114580937:web:d6f525d1dc0acb4fa9ae18',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
