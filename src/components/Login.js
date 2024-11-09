import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import defaultLoginImage from "../images/login1.jpg";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database"; // Import ref and get for database access
import { database } from "../firebase"; // Import your Firebase database configuration

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User is logged in:", user);
        navigate("/landing"); // Redirect to landing if user is logged in
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Reset any previous errors

    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid; // Get the user's ID

      console.log("Login successful"); // Log success

      // Fetch the user's role from the database
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const { role } = snapshot.val();
        if (role === "artist") {
          navigate("/artist-interface"); // Redirect to artist interface
        } else {
          navigate("/landing"); // Redirect to landing for other users
        }
      } else {
        setError("User data not found.");
      }
    } catch (err) {
      console.error("Login Error:", err); // Log the error for debugging

      switch (err.code) {
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/user-not-found":
          setError("No user found with this email. Please register.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format. Please enter a valid email.");
          break;
        default:
          setError("Invalid login credentials. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <nav className="navbar">
        <h2>GestEasy Art Gallery</h2>
        <ul className="nav-links">
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/artist-login">Artist Login</a>
          </li>
          <li>
            <a href="/about">About Us</a>
          </li>
        </ul>
      </nav>

      <div className="login-content">
        <div className="image-section">
          <h2>Welcome to our Art Gallery</h2>
          <img
            src={defaultLoginImage}
            alt="Login"
            className="default-login-image"
          />
        </div>

        <div className="form-section">
          <div className="form-box">
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="aside">
                <a href="/forgot-password" className="forgot-password">
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="login-button">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>© 2023 Art Gallery. All rights reserved. Privacy Policy</p>
      </footer>
    </div>
  );
}

export default Login;
