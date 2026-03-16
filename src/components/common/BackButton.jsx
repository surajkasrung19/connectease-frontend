//frontend/src/components/common/BackButton.jsx
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
    >
      ← Back
    </button>
  );
}