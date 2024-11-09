// Feedback.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, push } from "firebase/database";

const Feedback = () => {
  const [feedbackText, setFeedbackText] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getDatabase();
    const feedbackRef = ref(db, "feedbacks");
    await push(feedbackRef, { text: feedbackText });
    navigate("/products"); // Redirect to Products page after submission
  };

  return (
    <div className="feedback-container">
      <h2>Leave Your Feedback</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Enter your feedback here..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          required
        />
        <button type="submit">Submit Feedback</button>
      </form>
    </div>
  );
};

export default Feedback;
