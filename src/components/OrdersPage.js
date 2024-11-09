import React, { useEffect, useState } from "react";
import { database, get, ref } from "../firebase"; // Import the `get` method
import { useNavigate } from "react-router-dom";
import "./OrderPage.css";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch orders from Firebase when the component is mounted
    const ordersRef = ref(database, "orders"); // Reference to the 'orders' node in the database

    get(ordersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          // Convert the snapshot to an array of orders
          const ordersData = [];
          snapshot.forEach((childSnapshot) => {
            ordersData.push({ id: childSnapshot.key, ...childSnapshot.val() });
          });
          setOrders(ordersData); // Store the orders in the state
        } else {
          console.log("No orders found");
        }
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      });
  }, []);

  return (
    <div className="orders-container">
      <h2>Order Details</h2>
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order.id} className="order-item">
            <h3>Order ID: {order.id}</h3>
            <p>Status: {order.status}</p>
            <p>Estimated Delivery: {order.estimatedDelivery}</p>
            <h4>Items:</h4>
            {order.items.map((item, index) => (
              <div key={index} className="order-item-details">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="order-item-image"
                />
                <div className="order-item-text">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <p>Price: ${item.price}</p>
                </div>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
}

export default OrdersPage;
