import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GestureGallery from "./components/GestureGallery";
import Login from "./components/Login";
import Register from "./components/Register";
import Landing from "./components/Landing";
import Settings from "./components/Settings";
import UserManagement from "./components/UserManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./components/AdminLogin";
import AdminInterface from "./components/Admininterface";
import ArtistInterface from "./components/Artistinterface";
import Cart from "./components/cart";
import { CartProvider } from "./components/CartContext";
import PaymentPage from "./components/PaymentPage";
import OrdersPage from "./components/OrdersPage";
import Products from "./components/Products";
import Feedback from "./components/Feedback";
import AdminManagement from "./components/admin";

function App() {
  const [cartItems, setCartItems] = useState([]);

  // Clear cart function
  const clearCart = () => setCartItems([]);

  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<GestureGallery />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/adminregister" element={<AdminManagement />} />
          <Route
            path="/landing"
            element={<ProtectedRoute element={<Landing />} />}
          />
          <Route
            path="/settings"
            element={<ProtectedRoute element={<Settings />} />}
          />
          <Route
            path="/user-management"
            element={<ProtectedRoute element={<UserManagement />} />}
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin-interface" element={<AdminInterface />} />
          <Route
            path="/artist-interface"
            element={<ProtectedRoute element={<ArtistInterface />} />}
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute
                element={<Cart cartItems={cartItems} clearCart={clearCart} />}
              />
            }
          />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
