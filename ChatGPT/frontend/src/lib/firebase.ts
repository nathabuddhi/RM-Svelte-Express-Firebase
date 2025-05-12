import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAg3AMVzacBRvJF7vBX9ulz7EFNQGjQK6M",
    authDomain: "rm-gpt.firebaseapp.com",
    projectId: "rm-gpt",
    storageBucket: "rm-gpt.firebasestorage.app",
    messagingSenderId: "42951264639",
    appId: "1:42951264639:web:b28f583b3552d4fbc8f24a",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
