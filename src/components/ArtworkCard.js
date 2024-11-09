// ArtworkCard.js
import React from "react";
import "./ArtworkCard.css";

function ArtworkCard({ artwork, onAddToCart }) {
  return (
    <div className="artwork-card">
      <img src={artwork.image} alt={artwork.title} className="artwork-image" />
      <h2>{artwork.title}</h2>
      <p>{artwork.description}</p>
      <p>Price: ${artwork.price}</p>
      <button onClick={onAddToCart}>Add to Cart</button>
    </div>
  );
}

export default ArtworkCard;
