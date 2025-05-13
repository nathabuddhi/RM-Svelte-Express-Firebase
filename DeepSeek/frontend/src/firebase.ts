import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAxC1_l8nDqjBUttyJGabJByfzjYCmeH9I",
    authDomain: "rm-deepseek.firebaseapp.com",
    projectId: "rm-deepseek",
    storageBucket: "rm-deepseek.firebasestorage.app",
    messagingSenderId: "641481672299",
    appId: "1:641481672299:web:ba111836a21875ae88532e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
