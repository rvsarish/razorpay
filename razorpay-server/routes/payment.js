// routes/payment.js
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto"); // Import crypto for HMAC SHA256
const router = express.Router();

router.post("/orders", async (req, res) => {
    try {
        // Create a new instance of Razorpay
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID, // Your Razorpay key_id from .env
            key_secret: process.env.RAZORPAY_SECRET, // Your Razorpay secret from .env
        });

        // Create an order with options
        const options = {
            amount: 50000, // amount in smallest currency unit (e.g., paise)
            currency: "INR",
            receipt: "receipt_order_74394", // Unique receipt ID
        };

        // Create the order on Razorpay
        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Could not create order");

        // Return the order details to the frontend
        res.json(order);
    } catch (error) {
        console.error("Error creating order: ", error); // Log error details
        res.status(500).send("Internal Server Error");
    }
});

router.post("/success", async (req, res) => {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        // Create a digest (HMAC SHA256) of the orderCreationId and razorpayPaymentId
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = shasum.digest("hex");

        // Compare the generated digest with the signature provided by Razorpay
        if (digest !== razorpaySignature) {
            return res.status(400).json({ msg: "Transaction not legit!" });
        }

        // Transaction is legit, you can save the payment details in the database here

        res.json({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        console.error("Error verifying payment: ", error); // Log error details
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
