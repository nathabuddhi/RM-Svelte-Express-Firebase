const admin = require("firebase-admin");

const db = admin.firestore();
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = { uid: decodedToken.uid };
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ error: "Invalid token" });
    }
};

const validateFirebaseIdToken = async (req, res, next) => {
    if (
        !req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ")
    ) {
        return res
            .status(403)
            .json({ error: "Unauthorized: No token provided" });
    }

    const idToken = req.headers.authorization.split("Bearer ")[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Error verifying Firebase ID token:", error);
        return res.status(403).json({ error: "Unauthorized: Invalid token" });
    }
};

module.exports = { authMiddleware, validateFirebaseIdToken };
