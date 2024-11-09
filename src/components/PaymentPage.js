import React, { useState } from "react"; // Add useState here
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import { database, ref, push, set } from "../firebase";
import "./PaymentPage.css";

function PaymentPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false); // State to show confirmation message

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = parseFloat(item.price);
    return acc + (isNaN(price) ? 0 : price);
  }, 0);
  const formattedTotalPrice = totalPrice.toFixed(2);

  const handleProceedToCheckout = async () => {
    try {
      const newOrderRef = push(ref(database, "orders"));
      const orderData = {
        items: cartItems,
        totalPrice: formattedTotalPrice,
        orderDate: new Date().toLocaleDateString(),
        estimatedDelivery: new Date(
          new Date().setDate(new Date().getDate() + 7)
        ).toLocaleDateString(),
        status: "Pending",
        userId: "USER_ID", // Replace with actual user ID if available
      };
      await set(newOrderRef, orderData);
      setOrderPlaced(true); // Set orderPlaced to true after successful checkout
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const handleGoToLandingPage = () => {
    navigate("/products"); // Redirect to the landing page
  };
  const handleFeedbackRedirect = () => {
    navigate("/feedback"); // Redirect to feedback page
  };

  return (
    <div className="cart-container">
      <h2>Payments Page</h2>
      {orderPlaced ? (
        <div>
          <h3>Order placed successfully!</h3>
          <p>
            Your order has been successfully placed. We will notify you once
            it's on the way.
          </p>
          <button className="checkout-button" onClick={handleGoToLandingPage}>
            Go to Artworks Page
          </button>
          <button onClick={handleFeedbackRedirect}>Leave Feedback</button>
        </div>
      ) : (
        <>
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p className="price">Price: ${item.price}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Your cart is empty.</p>
          )}
          <div className="cart-summary">
            <h3>Total: ${formattedTotalPrice}</h3>
            <button
              className="checkout-button"
              onClick={handleProceedToCheckout}
            >
              Make Payments
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PaymentPage;
