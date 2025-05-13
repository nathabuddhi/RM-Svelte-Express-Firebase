// backend/routes/products.js
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const admin = require("firebase-admin");
const router = express.Router();

// Get Firebase Firestore instance
const db = admin.firestore();

// Authentication middleware (imported from index.js)
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

// Role check middleware
const sellerOnly = async (req, res, next) => {
    try {
        const uid = req.user.uid;
        const userDoc = await db.collection("Users").doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const userData = userDoc.data();

        if (userData.role !== "Seller") {
            return res
                .status(403)
                .json({ message: "Access denied. Sellers only." });
        }

        next();
    } catch (error) {
        console.error("Role check error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all products for current seller
router.get("/", authenticateUser, sellerOnly, async (req, res) => {
    try {
        const sellerId = req.user.uid;

        const productsRef = db
            .collection("Products")
            .where("sellerId", "==", sellerId);

        const snapshot = await productsRef.get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const products = [];
        snapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        res.status(200).json(products);
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
});

// Get a single product
router.get("/:id", authenticateUser, sellerOnly, async (req, res) => {
    try {
        const sellerId = req.user.uid;
        const productId = req.params.id;

        const productDoc = await db.collection("Products").doc(productId).get();

        if (!productDoc.exists) {
            return res.status(404).json({ message: "Product not found" });
        }

        const productData = productDoc.data();

        // Check if the product belongs to the seller
        if (productData.sellerId !== sellerId) {
            return res.status(403).json({ message: "Access denied" });
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

// Create a new product
router.post("/", authenticateUser, sellerOnly, async (req, res) => {
    try {
        const sellerId = req.user.uid;
        const {
            productName,
            productDescription,
            productImages,
            productPrice,
            productStock,
        } = req.body;

        // Validate required fields
        if (!productName || !productDescription || !productPrice) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Generate a unique product ID using UUID
        const productId = uuidv4();

        // Prepare product data
        const productData = {
            productId,
            productName,
            productDescription,
            productImages: productImages || [],
            productPrice: parseFloat(productPrice).toFixed(2),
            productStock: parseInt(productStock) || 0,
            sellerId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Add the product to Firestore
        await db.collection("Products").doc(productId).set(productData);

        res.status(201).json({
            message: "Product created successfully",
            product: {
                id: productId,
                ...productData,
            },
        });
    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({ message: "Failed to create product" });
    }
});

// Update a product
router.put("/:id", authenticateUser, sellerOnly, async (req, res) => {
    try {
        const sellerId = req.user.uid;
        const productId = req.params.id;

        // Check if product exists and belongs to seller
        const productDoc = await db.collection("Products").doc(productId).get();

        if (!productDoc.exists) {
            return res.status(404).json({ message: "Product not found" });
        }

        const productData = productDoc.data();

        if (productData.sellerId !== sellerId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const {
            productName,
            productDescription,
            productImages,
            productPrice,
            productStock,
        } = req.body;

        // Prepare updated data
        const updatedData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (productName !== undefined) updatedData.productName = productName;
        if (productDescription !== undefined)
            updatedData.productDescription = productDescription;
        if (productImages !== undefined)
            updatedData.productImages = productImages;
        if (productPrice !== undefined)
            updatedData.productPrice = parseFloat(productPrice).toFixed(2);
        if (productStock !== undefined)
            updatedData.productStock = parseInt(productStock);

        // Update the product
        await db.collection("Products").doc(productId).update(updatedData);

        res.status(200).json({
            message: "Product updated successfully",
            product: {
                id: productId,
                ...productData,
                ...updatedData,
            },
        });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ message: "Failed to update product" });
    }
});

// Delete a product
router.delete("/:id", authenticateUser, sellerOnly, async (req, res) => {
    try {
        const sellerId = req.user.uid;
        const productId = req.params.id;

        // Check if product exists and belongs to seller
        const productDoc = await db.collection("Products").doc(productId).get();

        if (!productDoc.exists) {
            return res.status(404).json({ message: "Product not found" });
        }

        const productData = productDoc.data();

        if (productData.sellerId !== sellerId) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Delete the product
        await db.collection("Products").doc(productId).delete();

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ message: "Failed to delete product" });
    }
});

module.exports = router;
