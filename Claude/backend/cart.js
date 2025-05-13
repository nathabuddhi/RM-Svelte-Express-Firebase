// routes/cart.js
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const { authMiddleware, validateFirebaseIdToken } = require("./authMiddleware");

// Get cart items
router.get("", validateFirebaseIdToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const db = admin.firestore();

        // Get user document with cart
        const userDoc = await db.collection("Users").doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();
        const cart = userData.cart || [];

        // If cart is empty, return empty array
        if (cart.length === 0) {
            return res.json({ items: [], totalItems: 0 });
        }

        // Get product details for each item in cart
        const productIds = cart.map((item) => item.productId);
        const productsSnapshot = await db
            .collection("Products")
            .where(admin.firestore.FieldPath.documentId(), "in", productIds)
            .get();

        const products = {};
        productsSnapshot.forEach((doc) => {
            products[doc.id] = { ...doc.data(), id: doc.id };
        });

        // Combine cart items with product details
        const cartItems = cart
            .map((item) => {
                const product = products[item.productId];
                if (!product) return null; // Skip if product not found

                // Ensure quantity doesn't exceed stock
                const quantity = Math.min(item.quantity, product.stock || 0);

                return {
                    productId: item.productId,
                    productName: product.productName || product.name,
                    price: product.price || 0,
                    quantity: quantity,
                    stock: product.stock || 0,
                    imageUrl: product.imageUrl || product.image,
                };
            })
            .filter(Boolean); // Remove nulls

        res.json({
            items: cartItems,
            totalItems: cartItems.length,
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ error: "Failed to fetch cart items" });
    }
});

// Add item to cart
router.post("", validateFirebaseIdToken, async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const { productId, quantity } = req.body;
        const userId = req.user.uid;

        // Validate request
        if (!productId || !quantity || quantity < 1) {
            return res
                .status(400)
                .json({ error: "Invalid product or quantity" });
        }

        const db = admin.firestore();

        // Check if product exists and has enough stock
        const productRef = db.collection("Products").doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = productDoc.data();
        if (product.stock < quantity) {
            return res
                .status(400)
                .json({ error: "Not enough stock available" });
        }

        // Get user document
        const userRef = db.collection("Users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Create user document if it doesn't exist
            await userRef.set({
                cart: [{ productId, quantity }],
            });
            return res.status(201).json({ message: "Item added to cart" });
        }

        // Update existing user document
        const userData = userDoc.data();
        const userCart = userData.cart || [];

        // Check if product already in cart
        const existingItemIndex = userCart.findIndex(
            (item) => item.productId === productId
        );

        if (existingItemIndex >= 0) {
            // Update quantity if product already in cart
            const newQuantity = userCart[existingItemIndex].quantity + quantity;

            // Check if new quantity exceeds stock
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    error: "Adding this quantity would exceed available stock",
                });
            }

            userCart[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new product to cart
            userCart.push({ productId, quantity });
        }

        // Update user document with new cart
        await userRef.update({
            cart: userCart,
        });

        res.status(200).json({ message: "Item added to cart" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ error: "Failed to add item to cart" });
    }
});

// Update cart item
router.put("", validateFirebaseIdToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.uid;

        // Validate request
        if (!productId || !quantity || quantity < 1) {
            return res
                .status(400)
                .json({ error: "Invalid product or quantity" });
        }

        const db = admin.firestore();

        // Check if product exists and has enough stock
        const productRef = db.collection("Products").doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = productDoc.data();
        if (product.stock < quantity) {
            return res
                .status(400)
                .json({ error: "Not enough stock available" });
        }

        // Get user document
        const userRef = db.collection("Users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update cart
        const userData = userDoc.data();
        const userCart = userData.cart || [];

        // Find product in cart
        const existingItemIndex = userCart.findIndex(
            (item) => item.productId === productId
        );

        if (existingItemIndex === -1) {
            return res.status(404).json({ error: "Product not found in cart" });
        }

        // Update quantity
        userCart[existingItemIndex].quantity = quantity;

        // Update user document with new cart
        await userRef.update({
            cart: userCart,
        });

        res.status(200).json({ message: "Cart updated successfully" });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ error: "Failed to update cart" });
    }
});

// Remove item from cart
router.delete("/:productId", validateFirebaseIdToken, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.uid;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        const db = admin.firestore();

        // Get user document
        const userRef = db.collection("Users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update cart
        const userData = userDoc.data();
        let userCart = userData.cart || [];

        // Remove product from cart
        userCart = userCart.filter((item) => item.productId !== productId);

        // Update user document with new cart
        await userRef.update({
            cart: userCart,
        });

        res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ error: "Failed to remove item from cart" });
    }
});

// Checkout cart
router.post("/checkout", validateFirebaseIdToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const db = admin.firestore();

        // Get user document
        const userRef = db.collection("Users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();
        const cart = userData.cart || [];

        if (cart.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // Transaction to handle checkout
        await db.runTransaction(async (transaction) => {
            // Get products in cart
            const productRefs = cart.map((item) =>
                db.collection("Products").doc(item.productId)
            );
            const productDocs = await Promise.all(
                productRefs.map((ref) => transaction.get(ref))
            );

            // Validate product availability
            for (let i = 0; i < cart.length; i++) {
                const item = cart[i];
                const productDoc = productDocs[i];

                if (!productDoc.exists) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                const product = productDoc.data();
                if (product.stock < item.quantity) {
                    throw new Error(
                        `Not enough stock for ${
                            product.productName || product.name
                        }`
                    );
                }
            }

            // Update product stock
            productDocs.forEach((doc, index) => {
                if (doc.exists) {
                    const product = doc.data();
                    const item = cart[index];
                    transaction.update(productRefs[index], {
                        stock: product.stock - item.quantity,
                    });
                }
            });

            // Create order (this would be handled in the checkout process, but we'll add basic structure)
            const orderRef = db.collection("Orders").doc();
            transaction.set(orderRef, {
                userId,
                items: cart,
                status: "pending",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Clear cart
            transaction.update(userRef, {
                cart: [],
            });
        });

        res.status(200).json({ message: "Checkout successful" });
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).json({
            error: error.message || "Failed to process checkout",
        });
    }
});

module.exports = router;
