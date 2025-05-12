const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const db = getFirestore();

// Get all products for seller
router.get("/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const snapshot = await db
            .collection("Users")
            .doc(email)
            .collection("Products")
            .get();
        const products = snapshot.docs.map((doc) => doc.data());
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// Create new product
router.post("/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const productId = uuidv4();
        const data = { ...req.body, productId };
        await db
            .collection("Users")
            .doc(email)
            .collection("Products")
            .doc(productId)
            .set(data);
        res.json({ message: "Product added", productId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add product" });
    }
});

// Update product
router.put("/:email/:productId", async (req, res) => {
    try {
        const { email, productId } = req.params;
        await db
            .collection("Users")
            .doc(email)
            .collection("Products")
            .doc(productId)
            .update(req.body);
        res.json({ message: "Product updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// Delete product
router.delete("/:email/:productId", async (req, res) => {
    try {
        const { email, productId } = req.params;
        await db
            .collection("Users")
            .doc(email)
            .collection("Products")
            .doc(productId)
            .delete();
        res.json({ message: "Product deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

module.exports = router;
