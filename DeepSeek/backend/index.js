const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const searchRoutes = require("./routes/searchRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/search", searchRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "Server is running" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
