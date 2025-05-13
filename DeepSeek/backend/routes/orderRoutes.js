const express = require("express");
const { db } = require("../firebase-admin");
const { v4: uuidv4 } = require("uuid");
const authMiddleware = require("./authMiddleware");

const router = express.Router();
router.use(authMiddleware);

// Submit order
router.post("/checkout", async (req, res) => {
    const { paymentMethod, shippingAddress } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email;

    if (!paymentMethod || !shippingAddress) {
        return res.status(400).json({
            error: "Payment method and shipping address are required",
        });
    }

    try {
        // Get cart items
        const cartRef = db.collection("Users").doc(userId).collection("Cart");
        const cartSnapshot = await cartRef.get();

        if (cartSnapshot.empty) {
            return res.status(400).json({ error: "No items in cart" });
        }

        // Prepare order items and validate stock
        const orderItems = [];
        const batch = db.batch();

        for (const cartDoc of cartSnapshot.docs) {
            const cartItem = cartDoc.data();
            const productRef = db
                .collection("Products")
                .doc(cartItem.productId);
            const productDoc = await productRef.get();

            if (!productDoc.exists) {
                return res.status(400).json({
                    error: `Product ${cartItem.productId} no longer exists`,
                });
            }

            const product = productDoc.data();
            if (product.productStock < cartItem.quantity) {
                return res.status(400).json({
                    error: `Not enough stock for ${product.productName}. Available: ${product.productStock}`,
                });
            }

            orderItems.push({
                productId: cartItem.productId,
                quantity: cartItem.quantity,
                productName: product.productName,
                price: product.productPrice,
            });

            // Update product stock
            batch.update(productRef, {
                productStock: product.productStock - cartItem.quantity,
            });

            // Remove from cart
            batch.delete(cartDoc.ref);
        }

        // Create order
        const orderId = uuidv4();
        const orderRef = db.collection("Orders").doc(orderId);
        const orderData = {
            orderId,
            customer: userEmail,
            items: orderItems,
            paymentMethod,
            shippingAddress,
            status: "Pending",
            timestamp: new Date(),
            total: orderItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            ),
        };

        batch.set(orderRef, orderData);

        // Commit all changes
        await batch.commit();

        res.json({
            success: true,
            orderId,
            message: "Order placed successfully",
        });
    } catch (error) {
        console.error("Checkout error:", error);
        res.status(500).json({ error: "Failed to process order" });
    }
});

// Get user orders
router.get("/", async (req, res) => {
    try {
        const ordersRef = db
            .collection("Orders")
            .where("customer", "==", req.user.email)
            .orderBy("timestamp", "desc");

        const snapshot = await ordersRef.get();
        const orders = [];
        snapshot.forEach((doc) => orders.push(doc.data()));

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

module.exports = router;
