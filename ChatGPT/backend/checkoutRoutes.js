const express = require("express");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const db = getFirestore();

// Checkout endpoint
router.post("/:email", async (req, res) => {
    const { email } = req.params;
    const { paymentMethod, shippingAddress } = req.body;

    if (!paymentMethod || !shippingAddress) {
        return res
            .status(400)
            .json({ error: "Payment method and address required." });
    }

    try {
        const cartSnap = await db
            .collection("Users")
            .doc(email)
            .collection("Cart")
            .get();
        if (cartSnap.empty) {
            return res.status(400).json({ error: "Cart is empty." });
        }

        const orders = [];

        for (const doc of cartSnap.docs) {
            const { productId, quantity, seller } = doc.data();
            const productRef = db
                .collection("Users")
                .doc(seller)
                .collection("Products")
                .doc(productId);
            const productSnap = await productRef.get();

            if (!productSnap.exists) {
                return res
                    .status(400)
                    .json({ error: `Product ${productId} no longer exists.` });
            }

            const product = productSnap.data();
            if (product.productStock < quantity) {
                return res
                    .status(400)
                    .json({
                        error: `Product ${product.productName} is out of stock.`,
                    });
            }

            // Update product stock
            await productRef.update({
                productStock: FieldValue.increment(-quantity),
            });

            // Create order entry
            const orderId = uuidv4();
            orders.push({
                orderId,
                productId,
                quantity,
                customer: email,
                status: "Pending",
                timestamp: FieldValue.serverTimestamp(),
            });
        }

        // Submit orders in bulk
        const batch = db.batch();
        for (const order of orders) {
            const orderRef = db.collection("Orders").doc(order.orderId);
            batch.set(orderRef, order);
        }

        // Clear cart
        for (const doc of cartSnap.docs) {
            batch.delete(doc.ref);
        }

        await batch.commit();

        res.json({ message: "Checkout successful.", orders });
    } catch (err) {
        console.error("Checkout error:", err);
        res.status(500).json({ error: "Checkout failed." });
    }
});

module.exports = router;
