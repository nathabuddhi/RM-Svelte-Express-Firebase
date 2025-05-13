import admin from "firebase-admin";
import serviceAccount from "./firebase-service-account.json" assert { type: "json" };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();
