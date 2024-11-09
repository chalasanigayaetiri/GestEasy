import React from "react";
import { useCart } from "./CartContext";
import "./cart.css";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cartItems } = useCart();

  // Calculate total price with a default value of 0 if price is invalid
  const totalPrice = cartItems.reduce((acc, item) => {
    const price = parseFloat(item.price); // Ensure price is a number
    return acc + (isNaN(price) ? 0 : price); // If price is not valid, add 0
  }, 0);

  const formattedTotalPrice = totalPrice.toFixed(2); // Format the total price
  const navigate = useNavigate();
  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
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
          onClick={() => {
            navigate("/payment");
          }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;
