const express = require("express");
const { db } = require("../firebase-admin");
const authMiddleware = require("./authMiddleware");

const router = express.Router();
router.use(authMiddleware);

// GET cart items
router.get("", async (req, res) => {
    try {
        const cartRef = db
            .collection("Users")
            .doc(req.user.uid)
            .collection("Cart");
        const snapshot = await cartRef.get();

        const cartItems = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const productDoc = await db
                .collection("Products")
                .doc(data.productId)
                .get();
            if (productDoc.exists) {
                cartItems.push({
                    productId: data.productId,
                    quantity: data.quantity,
                    product: productDoc.data(),
                });
            }
        }

        res.json(cartItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load cart" });
    }
});

// ADD or UPDATE item
router.post("", async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId || quantity < 1)
        return res.status(400).json({ error: "Invalid input" });

    try {
        const productRef = db.collection("Products").doc(productId);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = productSnap.data();
        if (quantity > product.productStock) {
            return res.status(400).json({ error: "Quantity exceeds stock" });
        }

        await db
            .collection("Users")
            .doc(req.user.uid)
            .collection("Cart")
            .doc(productId)
            .set({ productId, quantity });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add/update cart item" });
    }
});

// DELETE cart item
router.delete("/:productId", async (req, res) => {
    const { productId } = req.params;

    try {
        await db
            .collection("Users")
            .doc(req.user.uid)
            .collection("Cart")
            .doc(productId)
            .delete();

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete item" });
    }
});

module.exports = router;
