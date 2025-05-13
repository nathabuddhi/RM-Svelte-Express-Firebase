const express = require("express");
const db = require("../firebase-admin").db;
const auth = require("../firebase-admin").auth;

const router = express.Router();

// Check if email exists with a different role
router.post("/check-email", async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email exists in Firestore Users collection
        const usersRef = db.collection("Users");
        const snapshot = await usersRef.where("email", "==", email).get();

        if (snapshot.empty) {
            return res.status(200).json({ exists: false });
        }

        const userData = snapshot.docs[0].data();
        return res.status(200).json({
            exists: true,
            role: userData.role,
        });
    } catch (error) {
        console.error("Error checking email:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Get user role by UID
router.get("/user-role/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const userDoc = await db.collection("Users").doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();
        return res.status(200).json({ role: userData ? userData.role : null });
    } catch (error) {
        console.error("Error getting user role:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
