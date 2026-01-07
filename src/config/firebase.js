import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCGaMZx6AdSaQuK4hmP8WdyzzHjbZVBf2Q",
  authDomain: "web-sitem-new-firebase.firebaseapp.com",
  projectId: "web-sitem-new-firebase",
  storageBucket: "web-sitem-new-firebase.firebasestorage.app",
  messagingSenderId: "734745221788",
  appId: "1:734745221788:web:6a2dfcdd9ec923c4f6ab59",
  measurementId: "G-65D0SLE678"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Cloud Storage
export const storage = getStorage(app);

export default app;
