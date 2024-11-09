import React, { useState } from "react";
import {
  registerUser,
  approveArtist,
  addAdmin,
} from "./firebase_user_management.js";

const UserManagement = () => {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("artist");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!userId || !username || !email) {
      setErrorMessage("All fields are required.");
      return false;
    }
    // Basic email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setConfirmationMessage("");
    setErrorMessage("");

    try {
      await registerUser(userId, username, email, role);
      setConfirmationMessage("User registered successfully!");
      clearFields();
    } catch (error) {
      console.error("Error registering user:", error);
      setErrorMessage("Failed to register user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveArtist = async () => {
    if (!userId) {
      setErrorMessage("User ID is required for approving an artist.");
      return;
    }

    setLoading(true);
    setConfirmationMessage("");
    setErrorMessage("");

    try {
      await approveArtist(userId);
      setConfirmationMessage("Artist approved successfully!");
    } catch (error) {
      console.error("Error approving artist:", error);
      setErrorMessage("Failed to approve artist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!userId) {
      setErrorMessage("User ID is required to add an admin.");
      return;
    }

    setLoading(true);
    setConfirmationMessage("");
    setErrorMessage("");

    try {
      await addAdmin(userId);
      setConfirmationMessage("Admin added successfully!");
    } catch (error) {
      console.error("Error adding admin:", error);
      setErrorMessage("Failed to add admin. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearFields = () => {
    setUserId("");
    setUsername("");
    setEmail("");
    setRole("artist");
  };

  return (
    <div>
      <h2>User Management</h2>
      <div>
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="artist">Artist</option>
          <option value="admin">Admin</option>
          <option value="visitor">Visitor</option>
        </select>
        <button onClick={handleRegister} disabled={loading}>
          {loading ? "Registering..." : "Register User"}
        </button>
        <button onClick={handleApproveArtist} disabled={loading}>
          {loading ? "Approving..." : "Approve Artist"}
        </button>
        <button onClick={handleAddAdmin} disabled={loading}>
          {loading ? "Adding..." : "Add Admin"}
        </button>
      </div>
      {confirmationMessage && (
        <div className="confirmation-message">{confirmationMessage}</div>
      )}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default UserManagement;
