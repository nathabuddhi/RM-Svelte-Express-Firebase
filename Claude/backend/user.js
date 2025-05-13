const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

const db = admin.firestore();
const { authMiddleware, validateFirebaseIdToken } = require("./authMiddleware");

// Authenticated route to get user role
router.get("/getrole", authMiddleware, async (req, res) => {
    try {
        const userRef = db.collection("Users").doc(req.user.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();

        res.json({ role: userData.role });
    } catch (err) {
        console.error("Error getting user role:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
