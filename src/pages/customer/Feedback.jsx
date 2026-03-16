// frontend/src/pages/customer/Feedback.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";

const ratingLabels = {
  0: "",
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent!",
};

const ratingColors = {
  1: "text-red-500",
  2: "text-orange-400",
  3: "text-yellow-500",
  4: "text-blue-500",
  5: "text-green-500",
};

export default function Feedback() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const activeRating = hover || rating;

  const submitFeedback = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/feedback",
        { appointmentId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSubmitted(true);
      setTimeout(() => navigate("/customer/dashboard"), 2000);
    } catch (err) {
      console.error("Feedback error:", err);
      alert("Failed to submit feedback");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Success state */}
        {submitted ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h2>
            <p className="text-sm text-gray-500">
              Your feedback helps us improve our service.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="p-7">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">⭐</div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  Rate Your Experience
                </h2>
                <p className="text-sm text-gray-400">
                  How was the service? Your feedback matters.
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex flex-col items-center mb-6">
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill={activeRating >= star ? "#facc15" : "none"}
                        viewBox="0 0 24 24"
                        stroke={activeRating >= star ? "#facc15" : "#d1d5db"}
                        className="w-10 h-10 transition-all duration-150"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.11a.563.563 0 00.475.345l5.518.442c.5.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.43a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.286a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                    </button>
                  ))}
                </div>

                {/* Rating label */}
                <div className="h-5">
                  {activeRating > 0 && (
                    <span
                      className={`text-sm font-bold transition-all ${ratingColors[activeRating]}`}
                    >
                      {ratingLabels[activeRating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating indicator dots */}
              <div className="flex justify-center gap-1.5 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      activeRating >= s
                        ? "w-6 bg-yellow-400"
                        : "w-1.5 bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Leave a comment
                  <span className="text-gray-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="What went well? What could be improved?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/customer/dashboard")}
                  className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition active:scale-95"
                >
                  Skip
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={submitting || rating === 0}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition active:scale-95 ${
                    rating === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : submitting
                        ? "bg-green-400 text-white cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Feedback"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
