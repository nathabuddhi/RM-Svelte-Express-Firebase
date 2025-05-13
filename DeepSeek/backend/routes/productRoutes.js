const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { check, validationResult } = require("express-validator");
const { db } = require("../firebase-admin");
const authMiddleware = require("./authMiddleware.js"); // import this

const router = express.Router();

router.use(authMiddleware); // all routes below require auth

// Get seller's products
router.get("", async (req, res) => {
    try {
        const productsRef = db.collection("Products");
        const snapshot = await productsRef
            .where("sellerId", "==", req.user.uid)
            .get();

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

// Create new product
router.post(
    "",
    [
        check("productName", "Product name is required").not().isEmpty(),
        check("productPrice", "Valid price is required").isFloat({ min: 0 }),
        check("productStock", "Valid stock is required").isInt({ min: 0 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const productId = uuidv4();
            const productData = {
                productId,
                sellerId: req.user.uid,
                productName: req.body.productName,
                productDescription: req.body.productDescription || "",
                productImages: req.body.productImages || [],
                productPrice: parseFloat(req.body.productPrice),
                productStock: parseInt(req.body.productStock),
            };

            await db.collection("Products").doc(productId).set(productData);
            res.json({ success: true, product: productData });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Server error" });
        }
    }
);

// Update product
router.put("/:productId", async (req, res) => {
    try {
        const productRef = db.collection("Products").doc(req.params.productId);
        const doc = await productRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (doc.data().sellerId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const updateData = {
            productName: req.body.productName,
            productDescription: req.body.productDescription,
            productImages: req.body.productImages,
            productPrice: parseFloat(req.body.productPrice),
            productStock: parseInt(req.body.productStock),
        };

        await productRef.update(updateData);
        res.json({
            success: true,
            product: { ...updateData, productId: req.params.productId },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete product
router.delete("/:productId", async (req, res) => {
    try {
        const productRef = db.collection("Products").doc(req.params.productId);
        const doc = await productRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (doc.data().sellerId !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await productRef.delete();
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
