const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");
const router = express.Router();
const db = getFirestore();

// GET /api/cart/:email
router.get("/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const cartSnap = await db
            .collection("Users")
            .doc(email)
            .collection("Cart")
            .get();
        const cartItems = [];

        for (const cartDoc of cartSnap.docs) {
            const cartItem = cartDoc.data();
            const productSnap = await db
                .collection("Users")
                .doc(cartItem.seller)
                .collection("Products")
                .doc(cartItem.productId)
                .get();
            if (productSnap.exists) {
                cartItems.push({
                    ...productSnap.data(),
                    quantity: cartItem.quantity,
                    seller: cartItem.seller,
                });
            }
        }

        res.json(cartItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch cart" });
    }
});

// POST /api/cart/:email
router.post("/:email", async (req, res) => {
    const { email } = req.params;
    const { productId, quantity, seller } = req.body;
    try {
        await db
            .collection("Users")
            .doc(email)
            .collection("Cart")
            .doc(productId)
            .set({ productId, quantity, seller });

        res.json({ message: "Added to cart" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add to cart" });
    }
});

// PUT /api/cart/:email/:productId
router.put("/:email/:productId", async (req, res) => {
    const { email, productId } = req.params;
    const { quantity } = req.body;

    try {
        await db
            .collection("Users")
            .doc(email)
            .collection("Cart")
            .doc(productId)
            .update({ quantity });

        res.json({ message: "Cart updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update cart" });
    }
});

// DELETE /api/cart/:email/:productId
router.delete("/:email/:productId", async (req, res) => {
    const { email, productId } = req.params;

    try {
        await db
            .collection("Users")
            .doc(email)
            .collection("Cart")
            .doc(productId)
            .delete();

        res.json({ message: "Item removed from cart" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to remove item" });
    }
});

module.exports = router;
