import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD-plZEXoyY0LyzI7JdMKw9eqi3ZLcfoww",
    authDomain: "rm-claude.firebaseapp.com",
    projectId: "rm-claude",
    storageBucket: "rm-claude.firebasestorage.app",
    messagingSenderId: "386262758698",
    appId: "1:386262758698:web:1194acd6619f1364229a53",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
