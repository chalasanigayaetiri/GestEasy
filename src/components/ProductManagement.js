// src/components/ProductManagement.js
import React, { useState } from "react";
import { addProduct, deleteProduct } from "../firebase_product_management"; // Adjust the path as necessary

const ProductManagement = () => {
  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productId, setProductId] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!productName || !productImage || !productPrice) {
      setErrorMessage("Please fill in all required fields.");
      return false;
    }
    if (productPrice <= 0) {
      setErrorMessage("Product price must be a positive number.");
      return false;
    }
    return true;
  };

  // Function to handle adding a product
  const handleAddProduct = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setErrorMessage("");
    setConfirmationMessage("");

    const newProduct = {
      name: productName,
      image: productImage,
      price: parseFloat(productPrice),
      description: productDescription,
    };

    try {
      await addProduct(newProduct);
      setConfirmationMessage("Product added successfully!");
      clearFields();
    } catch (error) {
      console.error("Error adding product:", error);
      setErrorMessage("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle deleting a product
  const handleDeleteProduct = async () => {
    if (!productId) {
      setErrorMessage("Please enter a Product ID to delete.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setConfirmationMessage("");

    try {
      await deleteProduct(productId);
      setConfirmationMessage("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      setErrorMessage("Failed to delete product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to clear input fields
  const clearFields = () => {
    setProductName("");
    setProductImage("");
    setProductPrice("");
    setProductDescription("");
    setProductId("");
  };

  return (
    <div className="product-management-container">
      <h1>Product Management</h1>
      <div>
        <input
          type="text"
          placeholder="Product ID (for deletion)"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Product Image URL"
          value={productImage}
          onChange={(e) => setProductImage(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Product Price"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Product Description"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
        />
        <button onClick={handleAddProduct} disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
        <button onClick={handleDeleteProduct} disabled={loading}>
          {loading ? "Deleting..." : "Delete Product"}
        </button>
      </div>
      {confirmationMessage && (
        <div className="confirmation-message">{confirmationMessage}</div>
      )}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default ProductManagement;
