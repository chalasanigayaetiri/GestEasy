import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs-backend-webgl";
import KalmanFilter from "kalmanjs";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import "./Landing.css";
import piece1 from "../images/piece1.jpg";
import piece2 from "../images/piece2.jpg";
import piece3 from "../images/piece3.jpg";
import firebase from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  query,
  orderByChild,
  equalTo,
  get,
} from "firebase/database";
import { database, child } from "../firebase";
import { useCart } from "../components/CartContext";

function Landing() {
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);
  const [gestureMode, setGestureMode] = useState(true);
  const [cursorX, setCursorX] = useState(window.innerWidth / 2);
  const [cursorY, setCursorY] = useState(window.innerHeight / 2);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();
  const [isClicking, setIsClicking] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const detectionThreshold = 5; // Number of frames to detect V gesture
  const [lastGestureTime, setLastGestureTime] = useState(0);
  const [userName, setUserName] = useState(""); // Replace with dynamic username from database
  const [approvedArtworks, setApprovedArtworks] = useState([null]); // This should be defined
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const db = getDatabase();

  const { addToCart } = useCart(); // Destructure addToCart from useCart
  const [cartItemCount, setCartItemCount] = useState(0);

  const handleAddToCart = (artwork) => {
    addToCart(artwork); // Add artwork to cart using context
    setCartItemCount(cartItemCount + 1);
  };

  const handleorders = (artwork) => {
    navigate("/orders");
  };

  // Kalman Filters for smoothing cursor movement
  const kalmanX = new KalmanFilter({ R: 0.01, Q: 0.1, x: 0, P: 1 });
  const kalmanY = new KalmanFilter({ R: 0.01, Q: 0.1, x: 0, P: 1 });

  useEffect(() => {
    const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(storedCartItems);
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Apply cursor visibility based on gestureMode
  useEffect(() => {
    if (gestureMode) {
      document.body.style.cursor = "auto"; // Show the cursor when gesture mode is enabled
    } else {
      document.body.style.cursor = "none"; // Hide the cursor when gesture mode is disabled
    }
  }, [gestureMode]);

  useEffect(() => {
    const fetchApprovedArtworks = async () => {
      try {
        const snapshot = await get(ref(database, "artworks"));
        const data = snapshot.val();
        console.log(data); // Log the data to inspect its structure

        if (data) {
          const artworksArray = Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          }));
          setApprovedArtworks(artworksArray);
        } else {
          setApprovedArtworks([]);
        }
      } catch (error) {
        console.error("Error fetching approved artworks:", error);
      }
    };

    fetchApprovedArtworks();
  }, []);

  useEffect(() => {
    // Fetch user data from Firebase Realtime Database
    const userId = auth.currentUser ? auth.currentUser.uid : null; // Get the current user's ID
    if (userId) {
      const userRef = ref(db, "users/" + userId); // Adjust the path as per your structure
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.username) {
          setUserName(data.username); // Set username from the database
        }
      });
    }
  }, [auth, db]);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const handposeModel = await handpose.load();
        setModel(handposeModel);
      } catch (error) {
        console.error("Error loading Handpose model:", error);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    const setupCamera = async () => {
      const video = videoRef.current;
      if (video && gestureMode) {
        video.width = 640;
        video.height = 480;

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play();
            detectHandGesture();
          };
        } catch (error) {
          console.error("Error accessing webcam:", error);
          setConfirmationMessage(
            "Error accessing webcam. Please check your camera permissions."
          );
        }
      } else if (video && !gestureMode) {
        const stream = video.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop()); // Stop webcam if gesture mode is disabled
        }
      }
    };

    const detectHandGesture = async () => {
      const video = videoRef.current;
      if (video) {
        const detect = async () => {
          if (video.readyState >= 2 && gestureMode && !isClicking) {
            try {
              const predictions = await model.estimateHands(video);

              if (predictions.length > 0) {
                const hand = predictions[0].landmarks;
                const indexTip = hand[8]; // Index finger tip
                const middleTip = hand[12]; // Middle finger tip
                const wrist = hand[0]; // Palm base or wrist

                const rawX = indexTip[0];
                const rawY = indexTip[1];

                // Apply Kalman filter for smoothing
                const smoothedX = kalmanX.filter(rawX);
                const smoothedY = kalmanY.filter(rawY);

                let newCursorX = (smoothedX / video.width) * window.innerWidth;
                let newCursorY =
                  (smoothedY / video.height) * window.innerHeight;

                setCursorX(newCursorX);
                setCursorY(newCursorY);

                const distanceBetweenFingers = Math.sqrt(
                  Math.pow(middleTip[0] - indexTip[0], 2) +
                    Math.pow(middleTip[1] - indexTip[1], 2)
                );

                const indexAngle =
                  Math.atan2(indexTip[1] - wrist[1], indexTip[0] - wrist[0]) *
                  (180 / Math.PI);
                const middleAngle =
                  Math.atan2(middleTip[1] - wrist[1], middleTip[0] - wrist[0]) *
                  (180 / Math.PI);

                // Check for V gesture
                if (
                  isVGesture(indexAngle, middleAngle, distanceBetweenFingers)
                ) {
                  setDetectionCount((prevCount) => prevCount + 1);

                  if (detectionCount + 1 >= detectionThreshold) {
                    handleVGesture(); // Trigger the V gesture handler
                    setDetectionCount(0); // Reset the count after gesture is recognized
                  }
                } else if (distanceBetweenFingers < 30) {
                  handleClickGesture(); // Handle click gesture
                } else {
                  setDetectionCount(0); // Reset count if gesture is not detected
                }
              }
            } catch (error) {
              console.error("Error during gesture detection:", error);
            }
          }
          requestAnimationFrame(detect);
        };
        detect();
      }
    };

    setupCamera();
  }, [model, gestureMode, isClicking, detectionCount]);

  useEffect(() => {
    const handleClick = () => {
      setIsClicking(true);
      // Reset isClicking after a short delay
      setTimeout(() => setIsClicking(false), 300);
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  const isVGesture = (indexAngle, middleAngle, distance) => {
    const indexAngleThreshold = [-110, -90]; // Example values
    const middleAngleThreshold = [-100, -80]; // Example values
    const distanceThreshold = [40, 100]; // Example values

    const isIndexAngleValid =
      indexAngle >= indexAngleThreshold[0] &&
      indexAngle <= indexAngleThreshold[1];
    const isMiddleAngleValid =
      middleAngle >= middleAngleThreshold[0] &&
      middleAngle <= middleAngleThreshold[1];
    const isDistanceValid =
      distance >= distanceThreshold[0] && distance <= distanceThreshold[1];

    return isIndexAngleValid && isMiddleAngleValid && isDistanceValid;
  };

  const handleVGesture = () => {
    const currentTime = new Date().getTime();
    if (currentTime - lastGestureTime > 300) {
      // Prevent rapid re-triggering
      setConfirmationMessage("V gesture detected! Navigating to settings...");
      setTimeout(() => {
        setConfirmationMessage("");
        navigate("/settings");
      }, 2000);
      setLastGestureTime(currentTime); // Update last gesture time
    }
  };

  const handleClickGesture = () => {
    // Functionality for click gesture
    setConfirmationMessage("Click gesture detected!");
    setTimeout(() => setConfirmationMessage(""), 2000); // Display message briefly
  };

  const toggleGestureMode = () => {
    setGestureMode((prevMode) => !prevMode);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/"); // Redirect to the home page after logging out
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  };

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="logo">GestEasy Art Gallery</div>

        <div className="navbar-buttons">
          <span className="welcome-message">Welcome, {userName}</span>
          <button onClick={toggleGestureMode} className="nav-button">
            {gestureMode ? "Disable Gesture Mode" : "Enable Gesture Mode"}
          </button>
          <button className="nav-button" onClick={handleLogout}>
            Logout
          </button>
          <button className="nav-button" onClick={handleorders}>
            Order
          </button>
          <button
            className="cart-button"
            onClick={() => {
              navigate("/cart"); // Navigate to the cart page
            }}
          >
            Cart ({cartItemCount})
          </button>
        </div>
      </nav>

      <div className="video-container ">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-feed hidden-video"
        />
      </div>
      {/* Conditionally render the cursor only when gesture mode is active */}
      {gestureMode && (
        <div
          className="cursor"
          style={{ left: `${cursorX}px`, top: `${cursorY}px` }}
        ></div>
      )}

      <Carousel
        className="carousel"
        showThumbs={false}
        showIndicators={true}
        infiniteLoop={true}
      >
        <div className="carousel-item">
          <img src={piece1} alt="Piece 1" />
          <div className="overlay">Art Piece 1 - $100</div>
        </div>
        <div className="carousel-item">
          <img src={piece2} alt="Piece 2" />
          <div className="overlay">Art Piece 2 - $150</div>
        </div>
        <div className="carousel-item">
          <img src={piece3} alt="Piece 3" />
          <div className="overlay">Art Piece 3 - $200</div>
        </div>
      </Carousel>

      <div className="product-card-container">
        {Array.isArray(approvedArtworks) && approvedArtworks.length > 0 ? (
          approvedArtworks.map((artwork, index) =>
            artwork && artwork.imageUrl ? (
              <div key={artwork.title || index} className="product-card">
                <img src={artwork.imageUrl} alt={artwork.title} />
                <h2>{artwork.title || "Untitled"}</h2>
                <p>{artwork.description || "No description available"}</p>
                <p className="price">Price: ${artwork.price || "N/A"}</p>
                <button
                  className="btn"
                  onClick={() => handleAddToCart(artwork)}
                >
                  Add to Cart
                </button>
              </div>
            ) : (
              <div key={index} className="product-card">
                <p>No image available for this artwork</p>
                <h2>{artwork?.title || "No title available"}</h2>
                <p>{artwork?.description || "No description available"}</p>
                <p className="price">Price: ${artwork?.price || "N/A"}</p>
                <button
                  className="btn"
                  onClick={() => handleAddToCart(artwork)}
                >
                  Add to Cart
                </button>
              </div>
            )
          )
        ) : (
          <p>No approved artworks found or loading...</p>
        )}
      </div>

      {confirmationMessage && (
        <div className="confirmation-message">{confirmationMessage}</div>
      )}
    </div>
  );
}

export default Landing;
