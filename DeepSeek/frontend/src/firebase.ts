import { initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    type UserCredential,
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import type { UserRole } from "./types/auth";

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

export const registerWithEmailAndPassword = async (
    email: string,
    password: string,
    role: UserRole
): Promise<UserCredential> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        await setDoc(doc(db, "Users", userCredential.user.uid), {
            email,
            role,
        });
        return userCredential;
    } catch (error) {
        throw error;
    }
};

export const loginWithEmailAndPassword = async (
    email: string,
    password: string
): Promise<UserCredential> => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async (): Promise<void> => {
    await signOut(auth);
};

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
    const userDoc = await getDoc(doc(db, "Users", userId));
    return userDoc.exists() ? (userDoc.data().role as UserRole) : null;
};
