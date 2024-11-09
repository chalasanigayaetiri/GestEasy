import React, { useState } from "react";
import { database } from "../firebase"; // Ensure correct path to firebase.js
import { push, ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "./Artistinterface.css";

const ArtistInterface = () => {
  const [artworkDetails, setArtworkDetails] = useState({
    title: "",
    description: "",
    price: "",
    imageUrl: "", // Now it's a URL instead of file input
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArtworkDetails({
      ...artworkDetails,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, price, imageUrl } = artworkDetails;

    if (!title || !description || !price || !imageUrl) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      // Save artwork details in Firebase Realtime Database with 'isApproved: false'
      const artworkRef = push(ref(database, "artworks"));
      set(artworkRef, {
        title,
        description,
        price,
        imageUrl,
        isApproved: false, // This will be false until the admin approves
      }).then(() => {
        alert("Artwork submitted for approval!");
        navigate("/landing"); // Redirect to landing page after submission
      });
    } catch (err) {
      console.error("Error submitting artwork:", err);
      setError("Error submitting artwork. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="artist-interface">
      <h2>Submit Artwork for Approval</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={artworkDetails.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={artworkDetails.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={artworkDetails.price}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Image URL:</label>
          <input
            type="text"
            name="imageUrl"
            value={artworkDetails.imageUrl}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Artwork"}
        </button>
      </form>
    </div>
  );
};

export default ArtistInterface;
