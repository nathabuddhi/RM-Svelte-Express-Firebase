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

const ORDER_STATUS = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    SHIPPED: "Shipped",
    COMPLETED: "Completed",
};

// Get orders for current user (customer or seller)
router.get("", async (req, res) => {
    try {
        let ordersRef = db.collection("Orders");

        if (req.user.role === "Seller") {
            // For sellers, get all orders that contain their products
            const productsRef = db
                .collection("Products")
                .where("sellerId", "==", req.user.uid);

            const productsSnapshot = await productsRef.get();
            const productIds = productsSnapshot.docs.map((doc) => doc.id);

            ordersRef = ordersRef.where(
                "items",
                "array-contains-any",
                productIds
            );
        } else {
            // For customers, get their own orders
            ordersRef = ordersRef.where("customer", "==", req.user.email);
        }

        const snapshot = await ordersRef.orderBy("timestamp", "desc").get();
        const orders = [];
        snapshot.forEach((doc) => orders.push(doc.data()));

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// Update order status (for sellers)
router.put("/:orderId/status", async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = Object.values(ORDER_STATUS);

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        const orderRef = db.collection("Orders").doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Verify seller owns at least one product in the order
        if (req.user.role === "Seller") {
            const items = orderDoc.data().items;
            const productIds = items.map((item) => item.productId);

            const productsRef = db
                .collection("Products")
                .where("sellerId", "==", req.user.uid)
                .where(
                    admin.firestore.FieldPath.documentId(),
                    "in",
                    productIds
                );

            const productsSnapshot = await productsRef.get();

            if (productsSnapshot.empty) {
                return res
                    .status(403)
                    .json({ error: "Not authorized to update this order" });
            }
        }

        await orderRef.update({ status });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update order status" });
    }
});

// Customer confirms order received
router.put("/:orderId/complete", async (req, res) => {
    const { orderId } = req.params;

    try {
        if (req.user.role !== "Customer") {
            return res
                .status(403)
                .json({ error: "Only customers can complete orders" });
        }

        const orderRef = db.collection("Orders").doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return res.status(404).json({ error: "Order not found" });
        }

        const order = orderDoc.data();

        // Verify order belongs to this customer
        if (order.customer !== req.user.email) {
            return res
                .status(403)
                .json({ error: "Not authorized to complete this order" });
        }

        // Verify order is in Shipped status
        if (order.status !== ORDER_STATUS.SHIPPED) {
            return res
                .status(400)
                .json({ error: "Order must be shipped before completing" });
        }

        await orderRef.update({ status: ORDER_STATUS.COMPLETED });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to complete order" });
    }
});

module.exports = router;
