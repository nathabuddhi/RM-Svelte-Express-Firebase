const express = require("express");
const { db } = require("../firebase-admin");
const router = express.Router();

// Get all available products (stock > 0)
router.get("", async (req, res) => {
    try {
        const productsRef = db.collection("Products");
        const snapshot = await productsRef.where("productStock", ">", 0).get();

        const products = [];
        snapshot.forEach((doc) => {
            products.push(doc.data());
        });

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Search products by name
router.get("/:searchTerm", async (req, res) => {
    try {
        const searchTerm = req.params.searchTerm.toLowerCase();
        const productsRef = db.collection("Products");

        // Get all products with stock > 0
        const snapshot = await productsRef.where("productStock", ">", 0).get();

        // Filter products where name contains search term (case insensitive)
        const products = [];
        snapshot.forEach((doc) => {
            const product = doc.data();
            if (product.productName.toLowerCase().includes(searchTerm)) {
                products.push(product);
            }
        });

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
