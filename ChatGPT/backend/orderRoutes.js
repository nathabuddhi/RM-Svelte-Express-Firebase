const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");
const router = express.Router();
const db = getFirestore();

router.get("/customer/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const snapshot = await db
            .collection("Orders")
            .where("customer", "==", email)
            .orderBy("timestamp", "desc")
            .get();

        const orders = snapshot.docs.map((doc) => doc.data());
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch customer orders" });
    }
});

router.get("/seller/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const snapshot = await db.collection("Orders").get();
        const productsSnapshot = await db
            .collection("Users")
            .doc(email)
            .collection("Products")
            .get();

        const ownedProductIds = new Set(
            productsSnapshot.docs.map((doc) => doc.id)
        );

        const orders = snapshot.docs
            .map((doc) => doc.data())
            .filter((order) => ownedProductIds.has(order.productId));

        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch seller orders" });
    }
});

router.put("/:orderId", async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["Accepted", "Shipped", "Completed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        await db.collection("Orders").doc(orderId).update({ status });
        res.json({ message: "Order status updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update order status" });
    }
});

module.exports = router;
