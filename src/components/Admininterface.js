import React, { useState, useEffect } from "react";
import { database, auth } from "../firebase"; // Ensure correct path to firebase.js
import { ref, get, update, remove } from "firebase/database"; // Removed unused 'set' import
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Admininterface.css";

const AdminInterface = () => {
  const [artists, setArtists] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtistsAndArtworks = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch artists
        const usersRef = ref(database, "users");
        const userSnapshot = await get(usersRef);
        if (userSnapshot.exists()) {
          const users = userSnapshot.val();
          const artistList = Object.keys(users)
            .filter((userId) => users[userId].role === "artist")
            .map((userId) => ({ id: userId, ...users[userId] }));
          setArtists(artistList);
        } else {
          setError("No artists found.");
        }

        // Fetch artworks
        const artworksRef = ref(database, "artworks");
        const artworkSnapshot = await get(artworksRef);
        if (artworkSnapshot.exists()) {
          const artworksData = artworkSnapshot.val();
          const artworkList = Object.keys(artworksData).map((artworkId) => ({
            id: artworkId,
            ...artworksData[artworkId],
          }));
          setArtworks(artworkList);
        } else {
          setError("No artworks found.");
        }
      } catch (err) {
        setError("Error fetching data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistsAndArtworks();
  }, []);

  // Handle approving an artist
  const handleApproveArtist = async (userId) => {
    try {
      setLoading(true);
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, { isApproved: true });
      setArtists((prevArtists) =>
        prevArtists.map((artist) =>
          artist.id === userId ? { ...artist, isApproved: true } : artist
        )
      );
      alert("Artist approved successfully!");
    } catch (err) {
      setError("Error approving artist. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting an artist
  const handleDeleteArtist = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this artist?"
    );
    if (!confirmDelete) return;

    try {
      const userRef = ref(database, `users/${userId}`);
      await remove(userRef);
      setArtists((prevArtists) =>
        prevArtists.filter((artist) => artist.id !== userId)
      );
      alert("Artist deleted successfully!");
    } catch (err) {
      setError("Error deleting artist. Please try again.");
      console.error(err);
    }
  };

  // Handle approving an artwork
  const handleApproveArtwork = async (artworkId) => {
    try {
      setLoading(true);
      const artworkRef = ref(database, `artworks/${artworkId}`);
      await update(artworkRef, { isApproved: true });
      setArtworks((prevArtworks) =>
        prevArtworks.map((artwork) =>
          artwork.id === artworkId ? { ...artwork, isApproved: true } : artwork
        )
      );
      alert("Artwork approved successfully!");
    } catch (err) {
      setError("Error approving artwork. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle rejecting an artwork
  const handleRejectArtwork = async (artworkId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to reject this artwork?"
    );
    if (!confirmDelete) return;

    try {
      const artworkRef = ref(database, `artworks/${artworkId}`);
      await remove(artworkRef);
      setArtworks((prevArtworks) =>
        prevArtworks.filter((artwork) => artwork.id !== artworkId)
      );
      alert("Artwork rejected successfully!");
    } catch (err) {
      setError("Error rejecting artwork. Please try again.");
      console.error(err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      setError("An error occurred while logging out.");
    }
  };

  return (
    <div className="admin-interface">
      <h2>Admin Dashboard</h2>

      {error && <p className="error-message">{error}</p>}

      <h3>Manage Artists</h3>
      {loading ? (
        <p>Loading artists...</p>
      ) : (
        <div className="artist-list">
          {artists.length === 0 ? (
            <p>No artists found.</p>
          ) : (
            artists.map((artist) => (
              <div key={artist.id} className="artist-card">
                <p>{artist.email}</p>
                <p>Role: {artist.role}</p>
                <p>Status: {artist.isApproved ? "Approved" : "Pending"}</p>
                <div className="artist-actions">
                  {!artist.isApproved && (
                    <button onClick={() => handleApproveArtist(artist.id)}>
                      Approve
                    </button>
                  )}
                  <button onClick={() => handleDeleteArtist(artist.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <h3>Manage Artworks</h3>
      {loading ? (
        <p>Loading artworks...</p>
      ) : (
        <div className="artwork-list">
          {artworks.length === 0 ? (
            <p>No artworks found.</p>
          ) : (
            artworks.map((artwork) => (
              <div key={artwork.id} className="artwork-card">
                <h4>{artwork.title}</h4>
                <p>Description: {artwork.description}</p>
                <p>Price: ${artwork.price}</p>
                <p>Status: {artwork.isApproved ? "Approved" : "Pending"}</p>
                <div className="artwork-actions">
                  {!artwork.isApproved && (
                    <button onClick={() => handleApproveArtwork(artwork.id)}>
                      Approve
                    </button>
                  )}
                  <button onClick={() => handleRejectArtwork(artwork.id)}>
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminInterface;
