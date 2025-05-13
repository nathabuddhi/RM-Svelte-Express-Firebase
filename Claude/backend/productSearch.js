const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Get Firebase Firestore instance
const db = admin.firestore();

// Search products endpoint - public access (no authentication required)
router.get("", async (req, res) => {
    try {
        const searchQuery = req.query.q || ""; // Get search query parameter

        // Base query - products with stock > 0
        let productsRef = db
            .collection("Products")
            .where("productStock", ">", 0);

        // Execute search query
        const snapshot = await productsRef.get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        // Process results
        let products = [];
        snapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Filter by product name if search query is provided
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            products = products.filter((product) =>
                product.productName.toLowerCase().includes(query)
            );
        }

        res.status(200).json(products);
    } catch (error) {
        console.error("Product search error:", error);
        res.status(500).json({ message: "Failed to search products" });
    }
});

// Get a single product by ID - public access
router.get("/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        const productDoc = await db.collection("Products").doc(productId).get();

        if (!productDoc.exists) {
            return res.status(404).json({ message: "Product not found" });
        }

        const productData = productDoc.data();

        // Only return products with stock > 0
        if (productData.productStock <= 0) {
            return res.status(404).json({ message: "Product not available" });
        }

        res.status(200).json({
            id: productDoc.id,
            ...productData,
        });
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
});

module.exports = router;
