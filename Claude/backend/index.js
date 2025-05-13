// backend/index.js
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const serviceAccount = require("./firebase-service-account.json");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Initialize Firebase Admin SDK
// You'll need to create a service account key file in the Firebase console
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Initialize Firestore
const db = admin.firestore();
const productRoutes = require("./product");
const userRoutes = require("./user");
const searchRoutes = require("./productSearch");
const cartRoutes = require("./cart");
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/products", productRoutes);

// Authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Unauthorized" });
    }
};

// User registration endpoint
app.post("/api/users/register", authenticateUser, async (req, res) => {
    try {
        const { uid, email, role } = req.body;

        if (!uid || !email || !role) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (role !== "Customer" && role !== "Seller") {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Check if the email is already used with a different role
        const usersSnapshot = await db
            .collection("Users")
            .where("email", "==", email)
            .get();

        if (!usersSnapshot.empty) {
            const existingUser = usersSnapshot.docs[0].data();

            if (existingUser.role !== role) {
                return res.status(400).json({
                    message: `This email is already registered as a ${existingUser.role}`,
                });
            }
        }

        // Store user in Firestore
        await db.collection("Users").doc(uid).set({
            email,
            role,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get user profile endpoint
app.get("/api/users/profile", authenticateUser, async (req, res) => {
    try {
        const uid = req.user.uid;

        // Get user from Firestore
        const userDoc = await db.collection("Users").doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const userData = userDoc.data();

        res.status(200).json({
            uid,
            email: userData.email,
            role: userData.role,
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
