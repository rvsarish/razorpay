// server.js
require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const paymentRoutes = require("./routes/payment");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies in requests

// Use the payment routes
app.use("/payment", paymentRoutes);

app.listen(port, () => console.log(`Server started on port ${port}`));
