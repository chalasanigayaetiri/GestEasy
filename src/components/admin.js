import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Ensure this path is correct
import { addAdmin } from "./firebase_user_management"; // Ensure this path is correct

const AdminManagement = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle adding a new admin (registration)
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !name || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      // Step 1: Register the admin using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const adminId = userCredential.user.uid; // Get the UID of the newly created admin

      // Step 2: Store admin details in your database
      await addAdmin(adminId, email, name, "admin"); // Role as 'admin' (or you can adjust this logic)
      setSuccess("Admin registered successfully!");

      // Clear input fields after successful addition
      setEmail("");
      setName("");
      setPassword("");
    } catch (error) {
      console.error("Error registering admin:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="admin-management-container">
      <h2>Admin Management</h2>

      {/* Display error or success messages */}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <h3>Register New Admin</h3>
      <form onSubmit={handleAddAdmin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register Admin</button>
      </form>
    </div>
  );
};

export default AdminManagement;
