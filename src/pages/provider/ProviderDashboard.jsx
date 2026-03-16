// frontend/src/pages/provider/ProviderDashboard.jsx
import { useState, useEffect } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  completed: {
    label: "Completed",
    classes: "bg-green-100 text-green-700 border border-green-200",
  },
  accepted: {
    label: "Accepted",
    classes: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  pending: {
    label: "Pending",
    classes: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-red-100 text-red-600 border border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-gray-100 text-gray-500 border border-gray-200",
  },
};

export default function ProviderDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProviderJobs();
  }, []);

  const fetchProviderJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/appointments/provider-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Error loading jobs", err);
      setError("Failed to load jobs. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/appointments/${id}/status`,
        { status: newStatus.toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchProviderJobs();
    } catch (err) {
      console.error("Status Update failed", err);
      alert("Failed to update status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const completedCount = jobs.filter((j) => j.status === "completed").length;
  const totalEarnings = jobs
    .filter((j) => j.paymentStatus === "paid")
    .reduce((sum, j) => sum + (Number(j.providerEarnings) || 0), 0);

  const quickActions = [
    {
      icon: "📋",
      label: "Pending Jobs",
      value: pendingCount,
      path: "/provider/pending-jobs",
      color: "from-yellow-400 to-orange-500",
    },
    {
      icon: "✅",
      label: "Completed Jobs",
      value: completedCount,
      path: "/provider/completed-jobs",
      color: "from-green-400 to-teal-500",
    },
    {
      icon: "💰",
      label: "Total Earnings",
      value: `₹${totalEarnings.toLocaleString()}`,
      path: "/provider/earnings",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: "👤",
      label: "Profile",
      value: null,
      path: "/provider/profile",
      color: "from-purple-400 to-purple-600",
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      <style>{`
        .row-hover:hover { background: #f8faff; }
        .action-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .action-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(0,0,0,0.14); }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              C
            </div>
            <h1 className="text-lg font-bold text-blue-600">ConnectEase</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              Welcome, Provider 👋
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-gray-800">
            Provider Dashboard
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage your jobs and track your earnings
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className={`action-card bg-gradient-to-br ${action.color} text-white p-5 rounded-xl shadow-sm text-left`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              {action.value !== null && (
                <p className="text-2xl font-bold leading-none mb-1">
                  {action.value}
                </p>
              )}
              <h3 className="font-semibold text-sm opacity-90">
                {action.label}
              </h3>
            </button>
          ))}
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-800">My Jobs</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                All assigned service appointments
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full font-semibold">
                {pendingCount} pending
              </span>
              <span className="bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-semibold">
                {completedCount} done
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                <span className="text-5xl mb-3">📭</span>
                <p className="font-medium text-gray-500">
                  No jobs assigned yet
                </p>
                <p className="text-xs mt-1">New bookings will appear here</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {[
                      "Customer",
                      "Service",
                      "Date",
                      "Status",
                      "Amount",
                      "Actions",
                      "Payment",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jobs.map((job) => {
                    const cfg =
                      statusConfig[job.status] || statusConfig.pending;
                    return (
                      <tr key={job._id} className="row-hover transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                              {job.customer?.name?.charAt(0) || "?"}
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                              {job.customer?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">
                          {job.service?.name || "—"}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-500">
                          {new Date(job.scheduledTime).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}
                          >
                            {cfg.label}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-700">
                          <span className="text-green-600">
                            ₹{job.providerEarnings}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          {job.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleStatusUpdate(job._id, "accepted")
                                }
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition active:scale-95"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(job._id, "rejected")
                                }
                                className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-50 transition active:scale-95"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {job.status === "accepted" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(job._id, "completed")
                              }
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition active:scale-95"
                            >
                              Mark Complete
                            </button>
                          )}
                          {job.status === "completed" && (
                            <span className="text-gray-400 text-xs">
                              Finished
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {job.paymentStatus === "paid" ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                              <span>✓</span> Paid
                            </span>
                          ) : (
                            <span className="text-yellow-600 text-xs font-semibold">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
