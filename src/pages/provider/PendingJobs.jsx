// frontend/src/pages/provider/PendingJobs.jsx
import { useState, useEffect } from "react";
import API from "../../api/axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PendingJobs() {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingJobs();
  }, []);

  const loadPendingJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/appointments/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingJobs(res.data);
    } catch (err) {
      console.log("Error loading pending jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem("token");
      await API.put(
        `/appointments/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      loadPendingJobs();
    } catch (err) {
      console.error("Status Update failed", err);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = pendingJobs.filter(
    (j) =>
      j.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      j.service?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/provider/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Pending Jobs</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Review and respond to new booking requests
            </p>
          </div>
          {/* Count badge */}
          {pendingJobs.length > 0 && (
            <span className="ml-auto bg-yellow-100 text-yellow-700 border border-yellow-200 text-xs font-bold px-2.5 py-1 rounded-full">
              {pendingJobs.length} pending
            </span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Search */}
        {pendingJobs.length > 0 && (
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by customer or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition shadow-sm"
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-5xl mb-3">📭</span>
            <p className="font-medium text-gray-500">
              {search
                ? "No jobs match your search"
                : "No pending jobs right now"}
            </p>
            <p className="text-xs mt-1">
              New booking requests will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-blue-100 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-sm">
                    {job.customer?.name?.charAt(0) || "C"}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="text-base font-bold text-gray-800">
                          {job.customer?.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {job.customer?.phone}
                        </p>
                      </div>
                      <span className="inline-block bg-yellow-100 text-yellow-700 border border-yellow-200 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0">
                        New Request
                      </span>
                    </div>

                    {/* Info grid */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-base">🛠️</span>
                        <span className="font-medium">{job.service?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-base">💰</span>
                        <span className="font-semibold text-blue-600">
                          ₹{job.price || job.servicePrice}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-base">📅</span>
                        <span>
                          {new Date(job.scheduledTime).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-base mt-0.5">📍</span>
                        <span className="line-clamp-2">{job.address}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                      <button
                        onClick={() => handleStatusUpdate(job._id, "accepted")}
                        disabled={updatingId === job._id}
                        className="flex-1 sm:flex-none sm:px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition active:scale-95 disabled:opacity-60 shadow-sm"
                      >
                        {updatingId === job._id ? "..." : "✓ Accept"}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(job._id, "rejected")}
                        disabled={updatingId === job._id}
                        className="flex-1 sm:flex-none sm:px-6 py-2 bg-white text-red-600 border border-red-200 text-sm font-semibold rounded-lg hover:bg-red-50 transition active:scale-95 disabled:opacity-60"
                      >
                        {updatingId === job._id ? "..." : "✕ Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && pendingJobs.length > 0 && (
          <p className="text-xs text-gray-400 text-center">
            Showing {filtered.length} of {pendingJobs.length} pending jobs
          </p>
        )}
      </div>
    </div>
  );
}
