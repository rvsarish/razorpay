import React, { useState } from "react";

function App() {
  const [orderId, setOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Create a new order by making a request to the backend
  const createOrder = async () => {
    try {
      const response = await fetch("http://localhost:5000/payment/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!data || !data.id) {
        throw new Error("Failed to create order");
      }

      // Save order ID for later use
      setOrderId(data.id);

      // Initiate the Razorpay payment process
      openRazorpayCheckout(data);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  // Function to open Razorpay checkout
  const openRazorpayCheckout = (orderData) => {
    const options = {
      key: "rzp_test_iX7C3rD2Wc40Ru", // Use key_id from Razorpay
      amount: orderData.amount, // amount in smallest currency unit
      currency: orderData.currency,
      name: "Your Company Name",
      description: "Test Transaction",
      order_id: orderData.id, // Order ID from the backend
      handler: async function (response) {
        // Send the payment details to the backend for verification
        try {
          const verifyPayment = await fetch("http://localhost:5000/payment/success", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderCreationId: orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const result = await verifyPayment.json();
          if (result.msg === "success") {
            setPaymentSuccess(true);
            setPaymentId(response.razorpay_payment_id);
          } else {
            alert("Payment verification failed!");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          alert("Payment verification failed!");
        }
      },
      prefill: {
        name: "Your Name",
        email: "email@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#FBC02D", // Customize the color
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div>
      <h1>Razorpay Payment Gateway Integration</h1>
      <button onClick={createOrder}>Pay Now</button>
      {paymentSuccess && (
        <div>
          <h2>Payment Successful!</h2>
          <p>Payment ID: {paymentId}</p>
        </div>
      )}
    </div>
  );
}

export default App;
