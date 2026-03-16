// frontend/src/pages/provider/CompletedJobs.jsx
import { useState, useEffect } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CompletedJobs() {
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadCompletedJobs();
  }, []);

  const loadCompletedJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/appointments/provider-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const completed = res.data.filter((job) => job.status === "completed");
      setCompletedJobs(completed);
    } catch (err) {
      console.log("Error loading completed jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = completedJobs.filter(
    (j) =>
      j.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      j.service?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  // Summary
  const totalEarned = completedJobs
    .filter((j) => j.paymentStatus === "paid")
    .reduce((sum, j) => sum + (Number(j.providerEarnings) || 0), 0);

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
            <h1 className="text-xl font-bold text-gray-800">Completed Jobs</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Your successfully delivered services
            </p>
          </div>
          {completedJobs.length > 0 && (
            <span className="ml-auto bg-green-100 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-full">
              {completedJobs.length} completed
            </span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Summary Cards */}
        {completedJobs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Jobs Done",
                value: completedJobs.length,
                icon: "✅",
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                label: "Total Earned",
                value: `₹${totalEarned.toLocaleString()}`,
                icon: "💰",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Avg. Earning",
                value: completedJobs.length
                  ? `₹${Math.round(totalEarned / completedJobs.length).toLocaleString()}`
                  : "₹0",
                icon: "📊",
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3"
              >
                <div
                  className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center text-xl flex-shrink-0`}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        {completedJobs.length > 0 && (
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
            <span className="text-5xl mb-3">🏁</span>
            <p className="font-medium text-gray-500">
              {search ? "No jobs match your search" : "No completed jobs yet"}
            </p>
            <p className="text-xs mt-1">
              {search
                ? "Try a different search term"
                : "Accepted jobs will appear here once marked complete"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-green-100 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-sm">
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
                      {/* Payment badge */}
                      <span
                        className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          job.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {job.paymentStatus === "paid"
                          ? "✓ Paid"
                          : "⏳ Payment Pending"}
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
                        <span className="font-semibold text-green-600">
                          ₹{job.providerEarnings || 0} earned
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-base">📅</span>
                        <span>
                          {new Date(job.updatedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {job.paymentStatus === "paid" && job.paidAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-base">🧾</span>
                          <span>
                            Paid on{" "}
                            {new Date(job.paidAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom divider line with total */}
                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Total booking value
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        ₹{job.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && completedJobs.length > 0 && (
          <p className="text-xs text-gray-400 text-center">
            Showing {filtered.length} of {completedJobs.length} completed jobs
          </p>
        )}
      </div>
    </div>
  );
}
