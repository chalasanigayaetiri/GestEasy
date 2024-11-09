import React, { useEffect, useState, useRef } from "react";
import { database, ref, get } from "../firebase"; // Adjust Firebase imports as needed
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [model, setModel] = useState(null);
  const [message, setMessage] = useState(""); // Message state to indicate palm detection status
  const [selectedProducts, setSelectedProducts] = useState([]); // State for selected products
  const [feedback, setFeedback] = useState([]); // State to store feedback data
  const webcamRef = useRef(null);

  useEffect(() => {
    // Load products from the database
    const fetchProducts = async () => {
      const snapshot = await get(ref(database, "artworks"));
      if (snapshot.exists()) {
        setProducts(Object.values(snapshot.val()));
      }
    };

    // Load feedback from the database
    const fetchFeedback = async () => {
      const snapshot = await get(ref(database, "feedbacks"));
      if (snapshot.exists()) {
        // Extract feedback text and store it in an array
        const feedbackData = Object.values(snapshot.val()).map(
          (feedback) => feedback.text
        );
        console.log("Fetched Feedback Data:", feedbackData); // Log the feedback data for debugging
        setFeedback(feedbackData);
      } else {
        console.log("No feedback data found in the database.");
      }
    };

    // Load the handpose model
    const loadModel = async () => {
      const handposeModel = await handpose.load();
      setModel(handposeModel);
    };

    fetchProducts();
    fetchFeedback();
    loadModel();
  }, []);

  // Detect gesture (two palms) and update message
  const detectGesture = async () => {
    if (
      model &&
      webcamRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      const handEstimations = await model.estimateHands(
        webcamRef.current.video
      );

      // Check if two hands are detected
      if (handEstimations.length === 2) {
        setMessage("Two palms detected! You may now compare two products.");
        setTimeout(() => {
          const confirmCompare = window.confirm(
            "Show two products to compare them"
          );
          if (confirmCompare) {
            alert("Select two products for comparison.");
          }
        }, 5000); // Wait 5 seconds before showing the prompt
      } else if (handEstimations.length === 1) {
        setMessage(
          "Only one palm detected. You can still compare products. Select two products to compare."
        );
        setTimeout(() => {
          const confirmCompare = window.confirm(
            "Only one palm detected. Would you still like to compare two products?"
          );
          if (confirmCompare) {
            alert("Select two products for comparison.");
          }
        }, 5000); // Wait 5 seconds before showing the prompt
      } else {
        setMessage("No palms detected. Please show both palms.");
      }
    }
  };

  useEffect(() => {
    if (model) {
      // Start gesture detection with a 5-second interval
      const intervalId = setInterval(() => {
        detectGesture();
      }, 5000); // 5 seconds interval for gesture detection

      return () => clearInterval(intervalId); // Cleanup on component unmount
    }
  }, [model]);

  // Handle selecting products for comparison
  const handleProductClick = (product) => {
    if (selectedProducts.length < 2) {
      setSelectedProducts((prevSelected) => [...prevSelected, product]);
    }
  };

  // Display comparison result if two products are selected
  const displayComparison = () => {
    if (selectedProducts.length === 2) {
      const [product1, product2] = selectedProducts;
      return (
        <div className="comparison-section">
          <h3>Comparing Products:</h3>
          <div className="comparison-card">
            <img
              src={product1.imageUrl}
              alt={product1.title}
              className="comparison-image"
            />
            <div className="comparison-info">
              <h4>{product1.title}</h4>
              <p>{product1.description}</p>
              <p>Price: ${product1.price}</p>
            </div>
          </div>
          <div className="comparison-card">
            <img
              src={product2.imageUrl}
              alt={product2.title}
              className="comparison-image"
            />
            <div className="comparison-info">
              <h4>{product2.title}</h4>
              <p>{product2.description}</p>
              <p>Price: ${product2.price}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Display feedback section
  const displayFeedback = () => {
    if (feedback.length > 0) {
      return (
        <div className="feedback-section">
          <h3>User Feedback:</h3>
          {feedback.map((feedbackText, index) => (
            <div key={index} className="feedback-card">
              <p>
                <strong>User{index + 1}:</strong> "{feedbackText}"
              </p>{" "}
              {/* Format feedback */}
            </div>
          ))}
        </div>
      );
    }
    return <p>No feedback available.</p>;
  };

  return (
    <div className="products-container">
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
      <h2>Artworks</h2>
      <Webcam
        ref={webcamRef}
        style={{ position: "absolute", top: 0, left: 0, opacity: 0 }} // Hide webcam preview
      />
      <p className="palm-detection-message">{message}</p>{" "}
      {/* Display message */}
      <div className="products-list">
        {products.map((product, index) => (
          <div
            key={index}
            className={`product-card ${
              selectedProducts.includes(product) ? "selected" : ""
            }`}
            onClick={() => handleProductClick(product)}
          >
            <img
              src={product.imageUrl}
              alt={product.title}
              className="product-image"
            />
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
          </div>
        ))}
      </div>
      {displayComparison()}
      {displayFeedback()}
    </div>
  );
}

export default Products;
