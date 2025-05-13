const admin = require("firebase-admin");
const { db } = require("../firebase-admin");

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Unauthorized: No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Fetch the user document from Firestore
        const userDoc = await db.collection("Users").doc(uid).get();
        if (!userDoc.exists) {
            return res
                .status(404)
                .json({ error: "User not found in Firestore" });
        }

        req.user = userDoc.data(); // now req.user has fields like uid, name, email, etc.
        req.user.uid = uid; // ensure uid is attached

        next();
    } catch (err) {
        console.error("Error verifying token:", err);
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
}

module.exports = authMiddleware;
