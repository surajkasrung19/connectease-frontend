// frontend/src/pages/customer/CustomerBookings.jsx
import { useState, useEffect } from "react";
import API from "../../api/axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  pending: {
    label: "Pending",
    classes: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  accepted: {
    label: "Accepted",
    classes: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  completed: {
    label: "Completed",
    classes: "bg-green-100 text-green-700 border border-green-200",
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

export default function CustomerBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newTime, setNewTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

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
      console.log("Error Loading Bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.provider?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await API.patch(
        `/appointments/cancel/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)),
      );
    } catch (err) {
      console.log("Error cancelling booking:", err);
      alert("Failed to cancel booking. Please try again");
    }
  };

  const openRescheduleModal = (booking) => {
    setSelectedBooking(booking);
    setNewTime(booking.scheduledTime.substring(0, 16));
    setShowModal(true);
  };

  const handleReschedule = async () => {
    try {
      setRescheduling(true);
      const token = localStorage.getItem("token");
      await API.patch(
        `/appointments/reschedule/${selectedBooking._id}`,
        { newTime },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBookings((prev) =>
        prev.map((b) =>
          b._id === selectedBooking._id
            ? { ...b, scheduledTime: newTime, status: "pending" }
            : b,
        ),
      );
      setShowModal(false);
      alert("Booking rescheduled");
    } catch (err) {
      console.log("Reschedule error:", err);
      alert("Failed to reschedule booking. Try again");
    } finally {
      setRescheduling(false);
    }
  };

  // Summary counts
  const counts = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/customer/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Bookings</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Track and manage your appointments
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total",
              value: counts.total,
              color: "border-gray-200  text-gray-700",
              bg: "bg-white",
            },
            {
              label: "Pending",
              value: counts.pending,
              color: "border-yellow-200 text-yellow-700",
              bg: "bg-yellow-50",
            },
            {
              label: "Completed",
              value: counts.completed,
              color: "border-green-200 text-green-700",
              bg: "bg-green-50",
            },
            {
              label: "Cancelled",
              value: counts.cancelled,
              color: "border-red-200   text-red-600",
              bg: "bg-red-50",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`${s.bg} border ${s.color} rounded-xl px-4 py-3 flex items-center justify-between shadow-sm`}
            >
              <span className="text-xs font-medium text-gray-500">
                {s.label}
              </span>
              <span className={`text-xl font-bold ${s.color.split(" ")[1]}`}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
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
              placeholder="Search service or provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
            />
          </div>
          {/* Status filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "accepted", "completed", "cancelled"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    statusFilter === s
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="text-5xl mb-3">📋</span>
              <p className="font-medium text-gray-500">No bookings found</p>
              <p className="text-xs mt-1">
                Try adjusting your search or filter
              </p>
              <button
                onClick={() => navigate("/customer/book-service")}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                Book a Service
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Service
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Provider
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Date & Time
                    </th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBookings.map((b) => {
                    const cfg = statusConfig[b.status] || statusConfig.pending;
                    return (
                      <tr
                        key={b._id}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        {/* Service */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-800">
                            {b.service.name}
                          </p>
                        </td>

                        {/* Provider */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                              {b.provider.name.charAt(0)}
                            </div>
                            <span className="text-sm text-gray-700">
                              {b.provider.name}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-700 font-medium">
                            {new Date(b.scheduledTime).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(b.scheduledTime).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}
                          >
                            {cfg.label}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-bold text-gray-800">
                            ₹{b.totalAmount}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              disabled={b.status !== "pending"}
                              onClick={() => handleCancel(b._id)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition
                                disabled:opacity-30 disabled:cursor-not-allowed
                                enabled:bg-red-50 enabled:text-red-600 enabled:hover:bg-red-100 enabled:border enabled:border-red-200"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={
                                b.status === "cancelled" ||
                                b.status === "completed" ||
                                b.status === "rejected"
                              }
                              onClick={() => openRescheduleModal(b)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition
                                disabled:opacity-30 disabled:cursor-not-allowed
                                enabled:bg-blue-50 enabled:text-blue-600 enabled:hover:bg-blue-100 enabled:border enabled:border-blue-200"
                            >
                              Reschedule
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50">
                <p className="text-xs text-gray-400">
                  Showing{" "}
                  <span className="font-semibold text-gray-600">
                    {filteredBookings.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-600">
                    {bookings.length}
                  </span>{" "}
                  bookings
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">
                Reschedule Booking
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {selectedBooking && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <p className="text-gray-500 text-xs mb-0.5">Rescheduling</p>
                <p className="font-semibold text-gray-800">
                  {selectedBooking.service?.name}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  with {selectedBooking.provider?.name}
                </p>
              </div>
            )}

            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              New Date & Time
            </label>
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={rescheduling}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {rescheduling ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
