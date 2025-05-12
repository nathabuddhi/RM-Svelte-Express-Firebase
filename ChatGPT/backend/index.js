const express = require("express");
const cors = require("cors");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./firebase-service-account.json");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();
const productRoutes = require("./productRoutes");
const cartRoutes = require("./cartRoutes");
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);

app.post("/api/check-role", async (req, res) => {
    const { email, role } = req.body;
    try {
        const userDoc = await db.collection("Users").doc(email).get();
        if (userDoc.exists && userDoc.data().role !== role) {
            return res
                .status(400)
                .json({ error: "Email is already used with another role." });
        }
        return res.json({ ok: true });
    } catch (err) {
        console.error("Firestore error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
});

app.listen(process.env.PORT, () => {
    console.log("Server running on http://localhost:" + process.env.PORT);
});
