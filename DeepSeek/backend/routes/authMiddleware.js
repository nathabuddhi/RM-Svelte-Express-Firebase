const admin = require("firebase-admin");

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Unauthorized - No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || "Customer", // Assuming you store role in custom claims
        };
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
};
