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
            .set({
                ...data,
                productId,
                owner: email,
            });
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

// Public route: fetch all products with stock > 0, filtered by name (if provided)
router.get("/search/:query", async (req, res) => {
    const { query } = req.params;
    console.log("Query:", query);
    try {
        const usersSnapshot = await db.collection("Users").get();
        const products = [];

        for (const userDoc of usersSnapshot.docs) {
            const prodSnapshot = await db
                .collection("Users")
                .doc(userDoc.id)
                .collection("Products")
                .where("productStock", ">", 0)
                .get();

            for (const docSnap of prodSnapshot.docs) {
                const data = docSnap.data();
                if (
                    !query ||
                    data.productName.toLowerCase().includes(query.toLowerCase())
                ) {
                    products.push(data);
                }
            }
        }
        if (products.length === 0) {
            return res
                .status(404)
                .json({ error: "No matching products found." });
        }

        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to search products." });
    }
});

module.exports = router;
