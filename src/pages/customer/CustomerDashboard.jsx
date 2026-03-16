// frontend/src/pages/customer/CustomerDashboard.jsx
import { useState, useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

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
  cancelled: {
    label: "Cancelled",
    classes: "bg-red-100 text-red-600 border border-red-200",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-gray-100 text-gray-500 border border-gray-200",
  },
};

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/appointments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      console.log("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Quick stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    unpaid: bookings.filter(
      (b) => b.status === "completed" && b.paymentStatus === "pending",
    ).length,
  };

  const quickActions = [
    {
      icon: "📅",
      label: "Book Service",
      path: "/customer/book-service",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: "📋",
      label: "My Bookings",
      path: "/customer/bookings",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: "💳",
      label: "Payments",
      path: "/customer/payments",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: "👤",
      label: "Profile",
      path: "/customer/profile",
      color: "from-teal-500 to-teal-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <style>{`
        .row-hover:hover { background: #f8faff; }
        .action-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .action-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(0,0,0,0.12); }
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
              Welcome back! 👋
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
        {/* Page title */}
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-gray-800">
            Customer Dashboard
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage your bookings and services
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          {[
            {
              label: "Total Bookings",
              value: stats.total,
              icon: "📋",
              color: "text-gray-700",
              bg: "bg-white",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: "⏳",
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: "✅",
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Unpaid",
              value: stats.unpaid,
              icon: "💳",
              color: "text-red-500",
              bg: "bg-red-50",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`${s.bg} border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3`}
            >
              <div className="text-2xl">{s.icon}</div>
              <div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className={`action-card bg-gradient-to-br ${action.color} text-white p-5 rounded-xl shadow-sm text-left`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <h3 className="font-semibold text-sm">{action.label}</h3>
            </button>
          ))}
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                Recent Bookings
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Your latest service appointments
              </p>
            </div>
            <button
              onClick={() => navigate("/customer/bookings")}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                <span className="text-5xl mb-3">📋</span>
                <p className="font-medium text-gray-500">No bookings yet</p>
                <p className="text-xs mt-1 mb-4">
                  Start by booking your first service
                </p>
                <button
                  onClick={() => navigate("/customer/book-service")}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Book a Service
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {[
                      "Service",
                      "Provider",
                      "Date",
                      "Status",
                      "Amount",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((booking) => {
                    const cfg =
                      statusConfig[booking.status] || statusConfig.pending;
                    return (
                      <tr
                        key={booking._id}
                        className="row-hover transition-colors"
                      >
                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">
                          {booking.service?.name || "Deleted Service"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                              {booking.provider?.name?.charAt(0) || "?"}
                            </div>
                            <span className="text-sm text-gray-600">
                              {booking.provider?.name || "Deleted Provider"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">
                          {new Date(booking.scheduledTime).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-bold text-gray-800">
                          ₹{booking.totalAmount}
                        </td>
                        <td className="px-5 py-3.5">
                          {booking.status === "completed" ? (
                            booking.paymentStatus === "pending" ? (
                              <button
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition active:scale-95 shadow-sm"
                                onClick={() =>
                                  navigate(`/customer/pay/${booking._id}`)
                                }
                              >
                                Pay Now
                              </button>
                            ) : (
                              <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                                <span>✓</span> Paid
                              </span>
                            )
                          ) : (
                            <button
                              className="text-blue-600 hover:underline text-xs font-medium"
                              onClick={() => navigate("/customer/bookings")}
                            >
                              View Details
                            </button>
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
