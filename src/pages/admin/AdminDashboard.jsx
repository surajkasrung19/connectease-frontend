// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { Spinner } from "flowbite-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell as PieCell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ── Recharts custom tooltip ───────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-4 py-3 text-xs">
      <p className="text-gray-500 font-semibold mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: p.color }}
          />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold text-gray-800">
            {p.name === "Bookings"
              ? p.value
              : `₹${Number(p.value).toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  );
};

// Pie chart colours
const PIE_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
  "#f97316",
];

// Growth badge
function GrowthBadge({ value }) {
  const isUp = Number(value) >= 0;
  const color = isUp
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-600";
  const arrow = isUp ? "▲" : "▼";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${color}`}
    >
      {arrow} {Math.abs(value)}%
    </span>
  );
}

// Format ₹ large numbers
function fmtINR(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const searchDebounceRef = useRef(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServices: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState("services");

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    charges: "",
  });
  const [savingService, setSavingService] = useState(false);

  const [viewUser, setViewUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("");

  const [revenue, setRevenue] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  // Revenue sub-views: "overview" | "monthly" | "services" | "table"
  const [revenueView, setRevenueView] = useState("overview");

  //Lifecycle
  useEffect(() => {
    if (activeTab === "services") fetchServices();
  }, [activeTab]);
  useEffect(() => {
    fetchDashboardStats();
  }, []);
  useEffect(() => {
    if (activeTab === "bookings") fetchBookings();
  }, [activeTab, bookingStatusFilter]);
  useEffect(() => {
    if (activeTab === "revenue") fetchRevenue();
  }, [activeTab]);
  useEffect(() => {
    if (activeTab === "users") fetchUsers(1, searchQuery, roleFilter);
  }, [activeTab]);
  useEffect(() => {
    if (activeTab === "users") fetchUsers(page, searchQuery, roleFilter);
  }, [page]);
  useEffect(() => {
    if (activeTab === "users") fetchUsers(1, searchQuery, roleFilter);
  }, [searchQuery, roleFilter]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // ── Search debounce ───────────────────────────────────────────
  const handleSearchInput = (val) => {
    setSearchInput(val);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      setSearchQuery(val.trim());
    }, 400);
  };
  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  // ── API calls ─────────────────────────────────────────────────
  const fetchUsers = useCallback(
    async (pageNumber = 1, search = "", role = "") => {
      try {
        setLoadingUsers(true);
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({ page: pageNumber, limit: 10 });
        if (search && !role) params.set("search", search);
        if (!search && role) params.set("search", role);
        if (search && role) params.set("search", search);
        const res = await API.get(`/admin/users?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let list = res.data.users;
        if (search && role) list = list.filter((u) => u.role === role);
        setUsers(list);
        setTotalPages(res.data.pagination.totalPages);
        setTotalUsers(res.data.pagination.totalUsers);
        setPage(res.data.pagination.currentPage);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoadingUsers(false);
      }
    },
    [],
  );

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data);
    } catch (err) {
      console.error("failed to fetch services", err);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const token = localStorage.getItem("token");
      const res = await API.get(
        `/admin/bookings${bookingStatusFilter ? `?status=${bookingStatusFilter}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      setLoadingRevenue(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/revenue", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRevenue(res.data);
    } catch (err) {
      console.error("Failed to fetch revenue:", err);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const openAddServiceModal = () => {
    setEditingService(null);
    setServiceForm({ name: "", description: "", charges: "" });
    setShowServiceModal(true);
  };
  const openEditServiceModal = (service) => {
    if (!service.isActive) {
      alert("Inactive service cannot be edited");
      return;
    }
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      charges: service.charges,
    });
    setShowServiceModal(true);
  };
  const handleChange = (e) =>
    setServiceForm({ ...serviceForm, [e.target.name]: e.target.value });

  const saveService = async () => {
    try {
      setSavingService(true);
      const token = localStorage.getItem("token");
      if (editingService) {
        await API.put(`/admin/services/${editingService._id}`, serviceForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await API.post("/admin/services", serviceForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowServiceModal(false);
      fetchServices();
      fetchDashboardStats();
    } catch (err) {
      alert(err.response?.data?.message || "failed to save service");
    } finally {
      setSavingService(false);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Deactivate this service?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/admin/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchServices();
      fetchDashboardStats();
    } catch {
      alert("failed to delete service");
    }
  };

  const activateService = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.patch(
        `/admin/services/${id}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchServices();
      fetchDashboardStats();
    } catch {
      alert("Failed to activate service");
    }
  };

  const suspendUser = async (id) => {
    if (!window.confirm("Suspend this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.patch(
        `/admin/users/${id}/suspend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchUsers(page, searchQuery, roleFilter);
    } catch {
      alert("Failed to suspend user");
    }
  };

  const activateUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.patch(
        `/admin/users/${id}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchUsers(page, searchQuery, roleFilter);
    } catch {
      alert("Failed to activate user");
    }
  };

  const updateBookingStatus = async (id, status) => {
    if (!window.confirm(`Mark booking as ${status}?`)) return;
    try {
      const token = localStorage.getItem("token");
      await API.patch(
        `/admin/bookings/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchBookings();
      fetchDashboardStats();
      fetchRevenue();
    } catch {
      alert("Failed to update booking");
    }
  };

  // Highlight matched text
  function Highlight({ text = "", query = "" }) {
    if (!query || !text) return <span>{text}</span>;
    const parts = text.split(
      new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
    );
    return (
      <span>
        {parts.map((p, i) =>
          p.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-100 text-yellow-800 rounded px-0.5"
            >
              {p}
            </mark>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </span>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Services",
      value: stats.totalServices,
      icon: "🛠️",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Bookings",
      value: stats.totalBookings,
      icon: "📋",
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "Revenue",
      value: `₹${stats.totalRevenue?.toLocaleString() ?? 0}`,
      icon: "💰",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  const tabs = [
    { key: "services", label: "Manage Services" },
    { key: "users", label: "Manage Users" },
    { key: "bookings", label: "Manage Bookings" },
    { key: "revenue", label: "Revenue Analytics" },
  ];

  // ── Derived revenue values ─────────────────────────────────────
  const r = revenue;
  const profitMargin =
    r?.totalRevenue > 0
      ? ((r.platformRevenue / r.totalRevenue) * 100).toFixed(1)
      : 0;

  const revenueSubTabs = [
    { key: "overview", label: "Overview" },
    { key: "monthly", label: "Monthly Trends" },
    { key: "services", label: "Service Breakdown" },
    { key: "table", label: "Transaction Log" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <style>{`
        .row-hover:hover { background: #f8faff; }
        .tab-active   { border-bottom: 2px solid #2563eb; color: #2563eb; }
        .tab-inactive { color: #6b7280; }
        .tab-inactive:hover { color: #2563eb; background: #f9fafb; }
        .sub-tab-active   { background: #2563eb; color: #fff; }
        .sub-tab-inactive { background: #f3f4f6; color: #6b7280; }
        .sub-tab-inactive:hover { background: #e5e7eb; }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              C
            </div>
            <h1 className="text-lg font-bold text-blue-600">
              ConnectEase Admin
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium active:scale-95"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Admin Dashboard
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {loadingStats ? (
            <div className="col-span-4 flex justify-center py-6">
              <Spinner size="lg" />
            </div>
          ) : (
            statCards.map((s, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"
              >
                <div
                  className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}
                >
                  {s.icon}
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${s.color}`}>{s.value}</h3>
                  <p className="text-gray-500 text-sm">{s.label}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 flex overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition ${activeTab === t.key ? "tab-active" : "tab-inactive"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ════ Services Tab ════ */}
            {activeTab === "services" && (
              <div>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Services
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {services.length} services registered
                    </p>
                  </div>
                  <button
                    onClick={openAddServiceModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition active:scale-95"
                  >
                    + Add Service
                  </button>
                </div>
                {loadingServices ? (
                  <div className="flex justify-center py-10">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {[
                            "Name",
                            "Description",
                            "Charges",
                            "Status",
                            "Actions",
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
                        {services.map((service) => (
                          <tr
                            key={service._id}
                            className="row-hover transition-colors"
                          >
                            <td className="px-4 py-3.5 text-sm font-medium text-gray-800">
                              {service.name}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-500 max-w-xs truncate">
                              {service.description}
                            </td>
                            <td className="px-4 py-3.5 text-sm font-semibold text-blue-600">
                              ₹{service.charges}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${service.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-600 border-red-200"}`}
                              >
                                {service.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex gap-3">
                                <button
                                  className="text-blue-600 hover:underline text-sm font-medium"
                                  onClick={() => openEditServiceModal(service)}
                                >
                                  Edit
                                </button>
                                {service.isActive ? (
                                  <button
                                    className="text-red-500 hover:underline text-sm font-medium"
                                    onClick={() => deleteService(service._id)}
                                  >
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    className="text-green-600 hover:underline text-sm font-medium"
                                    onClick={() => activateService(service._id)}
                                  >
                                    Activate
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {showServiceModal && (
                  <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                    onClick={() => setShowServiceModal(false)}
                  >
                    <div
                      className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-gray-800">
                          {editingService ? "Edit Service" : "Add Service"}
                        </h3>
                        <button
                          onClick={() => setShowServiceModal(false)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition"
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
                      {[
                        { label: "Name", name: "name", type: "text" },
                        {
                          label: "Description",
                          name: "description",
                          type: "text",
                        },
                        {
                          label: "Charges (₹)",
                          name: "charges",
                          type: "number",
                        },
                      ].map((f) => (
                        <div key={f.name} className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {f.label}
                          </label>
                          <input
                            type={f.type}
                            name={f.name}
                            value={serviceForm[f.name]}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
                          />
                        </div>
                      ))}
                      <button
                        onClick={saveService}
                        disabled={savingService}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                      >
                        {savingService ? "Saving..." : "Save Service"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════ Users Tab ════ */}
            {activeTab === "users" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Users</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {searchQuery || roleFilter ? (
                        <span>
                          <span className="font-semibold text-blue-600">
                            {totalUsers}
                          </span>{" "}
                          result{totalUsers !== 1 ? "s" : ""} found
                        </span>
                      ) : (
                        "All registered customers and providers"
                      )}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 flex flex-col sm:flex-row gap-3">
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
                      placeholder="Search by name, email or phone..."
                      value={searchInput}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 bg-white transition"
                    />
                    {searchInput && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
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
                    )}
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 transition min-w-[140px]"
                  >
                    <option value="">All Roles</option>
                    <option value="customer">Customer</option>
                    <option value="provider">Provider</option>
                  </select>
                  {(searchQuery || roleFilter) && (
                    <button
                      onClick={() => {
                        clearSearch();
                        setRoleFilter("");
                        setPage(1);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition whitespace-nowrap"
                    >
                      <svg
                        className="w-3.5 h-3.5"
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
                      Clear filters
                    </button>
                  )}
                </div>

                {loadingUsers ? (
                  <div className="flex justify-center py-10">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <>
                    {users.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-gray-400 border border-gray-100 rounded-xl">
                        <span className="text-5xl mb-3">🔍</span>
                        <p className="font-medium text-gray-500">
                          No users found
                        </p>
                        <p className="text-xs mt-1">
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : "Try adjusting filters"}
                        </p>
                        <button
                          onClick={() => {
                            clearSearch();
                            setRoleFilter("");
                          }}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                        >
                          Clear Search
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-gray-100">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              {[
                                "Name",
                                "Email",
                                "Phone",
                                "Role",
                                "Status",
                                "Actions",
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
                            {users.map((user) => (
                              <tr
                                key={user._id}
                                className="row-hover transition-colors"
                              >
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                                      {user.name?.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-800">
                                      <Highlight
                                        text={user.name}
                                        query={searchQuery}
                                      />
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-sm text-gray-500">
                                  <Highlight
                                    text={user.email}
                                    query={searchQuery}
                                  />
                                </td>
                                <td className="px-4 py-3.5 text-sm text-gray-500">
                                  <Highlight
                                    text={user.phone || "—"}
                                    query={searchQuery}
                                  />
                                </td>
                                <td className="px-4 py-3.5">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${user.role === "provider" ? "bg-blue-100 text-blue-700 border-blue-200" : user.role === "admin" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}
                                  >
                                    {user.role}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${user.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-600 border-red-200"}`}
                                  >
                                    {user.isActive ? "Active" : "Suspended"}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex gap-3">
                                    <button
                                      className="text-blue-600 hover:underline text-sm font-medium"
                                      onClick={() => setViewUser(user)}
                                    >
                                      View
                                    </button>
                                    {user.isActive ? (
                                      <button
                                        className="text-red-500 hover:underline text-sm font-medium"
                                        onClick={() => suspendUser(user._id)}
                                      >
                                        Suspend
                                      </button>
                                    ) : (
                                      <button
                                        className="text-green-600 hover:underline text-sm font-medium"
                                        onClick={() => activateUser(user._id)}
                                      >
                                        Activate
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {viewUser && (
                      <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                        onClick={() => setViewUser(null)}
                      >
                        <div
                          className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-800">
                              User Details
                            </h3>
                            <button
                              onClick={() => setViewUser(null)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition"
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
                          <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                              {viewUser.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">
                                {viewUser.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {viewUser.email}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2.5 text-sm">
                            {[
                              { label: "Phone", value: viewUser.phone || "—" },
                              { label: "Role", value: viewUser.role },
                              {
                                label: "Status",
                                value: viewUser.isActive
                                  ? "Active"
                                  : "Suspended",
                              },
                              {
                                label: "Joined",
                                value: new Date(
                                  viewUser.createdAt,
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }),
                              },
                            ].map((item, i) => (
                              <div
                                key={i}
                                className="flex justify-between py-2 border-b border-gray-50"
                              >
                                <span className="text-gray-400 font-medium">
                                  {item.label}
                                </span>
                                <span className="text-gray-800 font-semibold">
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                          <button
                            className="w-full mt-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                            onClick={() => setViewUser(null)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}

                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-50">
                        <button
                          disabled={page === 1}
                          onClick={() => setPage((p) => p - 1)}
                          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-200 transition"
                        >
                          ← Previous
                        </button>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>
                            Page{" "}
                            <span className="font-semibold text-gray-700">
                              {page}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-700">
                              {totalPages}
                            </span>
                          </span>
                          {(searchQuery || roleFilter) && (
                            <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                              {totalUsers} found
                            </span>
                          )}
                        </div>
                        <button
                          disabled={page === totalPages}
                          onClick={() => setPage((p) => p + 1)}
                          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-200 transition"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ════ Bookings Tab ════ */}
            {activeTab === "bookings" && (
              <div>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Bookings
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {bookings.length} bookings found
                    </p>
                  </div>
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="border border-gray-200 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-400 transition"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                {loadingBookings ? (
                  <div className="flex justify-center py-10">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {[
                            "Customer",
                            "Provider",
                            "Service",
                            "Schedule",
                            "Price",
                            "Status",
                            "Actions",
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
                        {bookings.map((b) => (
                          <tr
                            key={b._id}
                            className="row-hover transition-colors"
                          >
                            <td className="px-4 py-3.5 text-sm font-medium text-gray-800">
                              {b.customer?.name}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">
                              {b.provider?.name}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">
                              {b.service?.name}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-500">
                              {new Date(b.scheduledTime).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-sm font-semibold text-blue-600">
                              ₹{b.totalAmount}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${b.status === "completed" ? "bg-green-100 text-green-700 border-green-200" : b.status === "accepted" ? "bg-blue-100 text-blue-700 border-blue-200" : b.status === "cancelled" ? "bg-red-100 text-red-600 border-red-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {b.status !== "completed" &&
                                b.status !== "cancelled" && (
                                  <div className="flex gap-2">
                                    <button
                                      className="text-green-600 hover:underline text-sm font-medium"
                                      onClick={() =>
                                        updateBookingStatus(b._id, "completed")
                                      }
                                    >
                                      Complete
                                    </button>
                                    <button
                                      className="text-red-500 hover:underline text-sm font-medium"
                                      onClick={() =>
                                        updateBookingStatus(b._id, "cancelled")
                                      }
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ════ Revenue Analytics Tab ════ */}
            {activeTab === "revenue" && (
              <div>
                {/* Tab header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Revenue Analytics
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Financial performance, profit analysis and trends
                    </p>
                  </div>
                  <button
                    onClick={fetchRevenue}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </button>
                </div>

                {/* Sub-navigation */}
                <div className="flex gap-2 flex-wrap mb-6">
                  {revenueSubTabs.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setRevenueView(t.key)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${revenueView === t.key ? "sub-tab-active" : "sub-tab-inactive"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {loadingRevenue ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Spinner size="lg" />
                    <p className="mt-4 text-sm">Loading analytics...</p>
                  </div>
                ) : !r ? null : (
                  <>
                    {/* ── OVERVIEW ── */}
                    {revenueView === "overview" && (
                      <div className="space-y-6">
                        {/* KPI cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            {
                              label: "Total Revenue",
                              value: `₹${r.totalRevenue?.toLocaleString()}`,
                              sub: "All paid bookings",
                              icon: "💵",
                              color: "text-blue-600",
                              bg: "bg-blue-50",
                              border: "border-blue-100",
                            },
                            {
                              label: "Platform Profit",
                              value: `₹${r.platformRevenue?.toLocaleString()}`,
                              sub: `${profitMargin}% margin`,
                              icon: "🏦",
                              color: "text-green-600",
                              bg: "bg-green-50",
                              border: "border-green-100",
                            },
                            {
                              label: "Provider Payouts",
                              value: `₹${r.providerRevenue?.toLocaleString()}`,
                              sub: "Service fees paid out",
                              icon: "👷",
                              color: "text-indigo-600",
                              bg: "bg-indigo-50",
                              border: "border-indigo-100",
                            },
                            {
                              label: "Paid Bookings",
                              value: r.totalBookings,
                              sub: "Completed & paid",
                              icon: "✅",
                              color: "text-teal-600",
                              bg: "bg-teal-50",
                              border: "border-teal-100",
                            },
                          ].map((s, i) => (
                            <div
                              key={i}
                              className={`bg-white rounded-xl shadow-sm border ${s.border} p-5`}
                            >
                              <div
                                className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center text-xl mb-3`}
                              >
                                {s.icon}
                              </div>
                              <p
                                className={`text-2xl font-bold ${s.color} mb-0.5`}
                              >
                                {s.value}
                              </p>
                              <p className="text-xs font-semibold text-gray-600">
                                {s.label}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {s.sub}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Profit analysis card */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <p className="text-blue-200 text-sm font-medium mb-1">
                                Profit Margin (Platform Fee %)
                              </p>
                              <p className="text-4xl font-extrabold">
                                {profitMargin}%
                              </p>
                              <p className="text-blue-200 text-sm mt-1">
                                You keep ₹{r.platformRevenue?.toLocaleString()}{" "}
                                from ₹{r.totalRevenue?.toLocaleString()} total
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 text-sm">
                              <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                                <span className="text-2xl">📈</span>
                                <div>
                                  <p className="text-white font-semibold">
                                    Month-over-Month
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <GrowthBadge value={r.momGrowth} />
                                    <span className="text-blue-200 text-xs">
                                      vs last month
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                                <span className="text-2xl">💰</span>
                                <div>
                                  <p className="text-white font-semibold">
                                    Avg per Booking
                                  </p>
                                  <p className="text-blue-200 text-xs mt-0.5">
                                    ₹
                                    {r.totalBookings > 0
                                      ? Math.round(
                                          r.platformRevenue / r.totalBookings,
                                        )
                                      : 0}{" "}
                                    platform fee avg
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Booking funnel */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                          <h4 className="font-bold text-gray-800 mb-1">
                            Booking Funnel
                          </h4>
                          <p className="text-xs text-gray-400 mb-5">
                            How many bookings convert to revenue
                          </p>
                          <div className="space-y-3">
                            {[
                              {
                                label: "Total Bookings Created",
                                value: r.bookingFunnel?.created,
                                color: "bg-blue-500",
                                pct: 100,
                              },
                              {
                                label: "Completed (Service Done)",
                                value: r.bookingFunnel?.completed,
                                color: "bg-indigo-500",
                                pct:
                                  r.bookingFunnel?.created > 0
                                    ? Math.round(
                                        (r.bookingFunnel.completed /
                                          r.bookingFunnel.created) *
                                          100,
                                      )
                                    : 0,
                              },
                              {
                                label: "Paid (Revenue Generated)",
                                value: r.bookingFunnel?.paid,
                                color: "bg-green-500",
                                pct:
                                  r.bookingFunnel?.created > 0
                                    ? Math.round(
                                        (r.bookingFunnel.paid /
                                          r.bookingFunnel.created) *
                                          100,
                                      )
                                    : 0,
                              },
                            ].map((f, i) => (
                              <div key={i}>
                                <div className="flex justify-between text-sm mb-1.5">
                                  <span className="text-gray-600 font-medium">
                                    {f.label}
                                  </span>
                                  <span className="font-bold text-gray-800">
                                    {f.value?.toLocaleString()}{" "}
                                    <span className="text-gray-400 font-normal">
                                      ({f.pct}%)
                                    </span>
                                  </span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${f.color} rounded-full transition-all duration-700`}
                                    style={{ width: `${f.pct}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Revenue split donut + top providers side by side */}
                        <div className="grid md:grid-cols-2 gap-5">
                          {/* Revenue split pie */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h4 className="font-bold text-gray-800 mb-1">
                              Revenue Split
                            </h4>
                            <p className="text-xs text-gray-400 mb-4">
                              Platform profit vs provider payouts
                            </p>
                            <div className="flex items-center justify-center">
                              <PieChart width={220} height={200}>
                                <Pie
                                  data={[
                                    {
                                      name: "Platform Profit",
                                      value: r.platformRevenue,
                                    },
                                    {
                                      name: "Provider Payouts",
                                      value: r.providerRevenue,
                                    },
                                  ]}
                                  cx={110}
                                  cy={95}
                                  innerRadius={55}
                                  outerRadius={85}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  <PieCell fill="#2563eb" />
                                  <PieCell fill="#10b981" />
                                </Pie>
                                <Tooltip
                                  formatter={(v) => `₹${v.toLocaleString()}`}
                                />
                              </PieChart>
                            </div>
                            <div className="flex justify-center gap-6 text-xs mt-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                                <span className="text-gray-600">
                                  Platform{" "}
                                  <span className="font-bold text-gray-800">
                                    {profitMargin}%
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                                <span className="text-gray-600">
                                  Providers{" "}
                                  <span className="font-bold text-gray-800">
                                    {(100 - profitMargin).toFixed(1)}%
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Top providers */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h4 className="font-bold text-gray-800 mb-1">
                              Top Providers
                            </h4>
                            <p className="text-xs text-gray-400 mb-4">
                              By total earnings generated
                            </p>
                            <div className="space-y-3">
                              {r.topProviders?.map((p, i) => {
                                const maxE = r.topProviders[0]?.earnings || 1;
                                return (
                                  <div
                                    key={i}
                                    className="flex items-center gap-3"
                                  >
                                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                                      {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold text-gray-800 truncate">
                                          {p.name}
                                        </span>
                                        <span className="text-green-600 font-bold ml-2">
                                          ₹{p.earnings.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-blue-500 rounded-full"
                                          style={{
                                            width: `${Math.round((p.earnings / maxE) * 100)}%`,
                                          }}
                                        />
                                      </div>
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        {p.jobs} job{p.jobs !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── MONTHLY TRENDS ── */}
                    {revenueView === "monthly" && (
                      <div className="space-y-6">
                        {/* Area chart — total revenue trend */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                          <h4 className="font-bold text-gray-800 mb-1">
                            Total Revenue — Last 12 Months
                          </h4>
                          <p className="text-xs text-gray-400 mb-5">
                            Monthly gross revenue trend
                          </p>
                          <ResponsiveContainer width="100%" height={240}>
                            <AreaChart
                              data={r.monthlySeries}
                              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient
                                  id="areaTotal"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor="#2563eb"
                                    stopOpacity={0.15}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor="#2563eb"
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              </defs>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="month"
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                dy={6}
                                interval={1}
                              />
                              <YAxis
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={fmtINR}
                                width={52}
                              />
                              <Tooltip content={<ChartTooltip />} />
                              <Area
                                type="monotone"
                                dataKey="total"
                                name="Total Revenue"
                                stroke="#2563eb"
                                strokeWidth={2.5}
                                fill="url(#areaTotal)"
                                dot={{ r: 3, fill: "#2563eb" }}
                                activeDot={{ r: 5 }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Grouped bar — platform vs provider */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                          <h4 className="font-bold text-gray-800 mb-1">
                            Platform Profit vs Provider Payouts
                          </h4>
                          <p className="text-xs text-gray-400 mb-5">
                            Compare what you keep vs what you pay out each month
                          </p>
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart
                              data={r.monthlySeries}
                              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                              barCategoryGap={0.4}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="month"
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                dy={6}
                                interval={1}
                              />
                              <YAxis
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={fmtINR}
                                width={52}
                              />
                              <Tooltip content={<ChartTooltip />} />
                              <Legend
                                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                              />
                              <Bar
                                dataKey="platform"
                                name="Platform Profit"
                                fill="#2563eb"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={28}
                              />
                              <Bar
                                dataKey="provider"
                                name="Provider Payouts"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={28}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Line chart — bookings per month */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                          <h4 className="font-bold text-gray-800 mb-1">
                            Paid Bookings Per Month
                          </h4>
                          <p className="text-xs text-gray-400 mb-5">
                            Volume of completed and paid jobs
                          </p>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart
                              data={r.monthlySeries}
                              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="month"
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                dy={6}
                                interval={1}
                              />
                              <YAxis
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                                width={32}
                              />
                              <Tooltip content={<ChartTooltip />} />
                              <Line
                                type="monotone"
                                dataKey="bookings"
                                name="Bookings"
                                stroke="#6366f1"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#6366f1" }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Monthly summary table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                          <div className="px-6 py-4 border-b border-gray-50">
                            <h4 className="font-bold text-gray-800">
                              Monthly Summary Table
                            </h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                  {[
                                    "Month",
                                    "Jobs",
                                    "Total Revenue",
                                    "Platform Profit",
                                    "Provider Payouts",
                                    "Margin %",
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
                                {[...r.monthlySeries].reverse().map((m, i) => {
                                  const margin =
                                    m.total > 0
                                      ? ((m.platform / m.total) * 100).toFixed(
                                          1,
                                        )
                                      : "—";
                                  const isCurrentMonth = i === 0;
                                  return (
                                    <tr
                                      key={i}
                                      className={`row-hover transition-colors ${isCurrentMonth ? "bg-blue-50/50" : ""}`}
                                    >
                                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                                        {m.month}{" "}
                                        {isCurrentMonth && (
                                          <span className="text-xs text-blue-500 font-normal ml-1">
                                            (current)
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3.5 text-sm text-gray-600">
                                        {m.bookings}
                                      </td>
                                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                                        ₹{m.total.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3.5 text-sm font-semibold text-green-600">
                                        ₹{m.platform.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">
                                        ₹{m.provider.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3.5 text-sm">
                                        {margin !== "—" ? (
                                          <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${Number(margin) >= 3 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                                          >
                                            {margin}%
                                          </span>
                                        ) : (
                                          <span className="text-gray-300">
                                            —
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── SERVICE BREAKDOWN ── */}
                    {revenueView === "services" && (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-5">
                          {/* Bar chart by service */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                            <h4 className="font-bold text-gray-800 mb-1">
                              Platform Revenue by Service
                            </h4>
                            <p className="text-xs text-gray-400 mb-5">
                              Which services generate the most profit for you
                            </p>
                            <ResponsiveContainer width="100%" height={220}>
                              <BarChart
                                data={r.serviceBreakdown}
                                layout="vertical"
                                margin={{
                                  top: 0,
                                  right: 24,
                                  left: 80,
                                  bottom: 0,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#f0f0f0"
                                  horizontal={false}
                                />
                                <XAxis
                                  type="number"
                                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                                  axisLine={false}
                                  tickLine={false}
                                  tickFormatter={fmtINR}
                                />
                                <YAxis
                                  type="category"
                                  dataKey="name"
                                  tick={{
                                    fontSize: 11,
                                    fill: "#374151",
                                    fontWeight: 500,
                                  }}
                                  axisLine={false}
                                  tickLine={false}
                                  width={76}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar
                                  dataKey="platform"
                                  name="Platform Profit"
                                  fill="#2563eb"
                                  radius={[0, 4, 4, 0]}
                                  maxBarSize={26}
                                >
                                  {r.serviceBreakdown?.map((_, i) => (
                                    <PieCell
                                      key={i}
                                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Pie chart — service share */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h4 className="font-bold text-gray-800 mb-1">
                              Revenue Share by Service
                            </h4>
                            <p className="text-xs text-gray-400 mb-4">
                              Proportion of total revenue per service
                            </p>
                            <div className="flex justify-center">
                              <PieChart width={220} height={200}>
                                <Pie
                                  data={r.serviceBreakdown}
                                  cx={110}
                                  cy={95}
                                  outerRadius={85}
                                  dataKey="revenue"
                                  nameKey="name"
                                  paddingAngle={2}
                                >
                                  {r.serviceBreakdown?.map((_, i) => (
                                    <PieCell
                                      key={i}
                                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(v, n) => [
                                    `₹${v.toLocaleString()}`,
                                    n,
                                  ]}
                                />
                              </PieChart>
                            </div>
                            <div className="mt-3 space-y-1.5">
                              {r.serviceBreakdown?.map((s, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                      style={{
                                        background:
                                          PIE_COLORS[i % PIE_COLORS.length],
                                      }}
                                    />
                                    <span className="text-gray-600 truncate max-w-[120px]">
                                      {s.name}
                                    </span>
                                  </div>
                                  <span className="font-bold text-gray-700">
                                    ₹{s.platform.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Service table */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50">
                              <h4 className="font-bold text-gray-800 text-sm">
                                Service Performance Table
                              </h4>
                            </div>
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Service
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                                    Jobs
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                    Profit
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {r.serviceBreakdown?.map((s, i) => (
                                  <tr
                                    key={i}
                                    className="row-hover transition-colors"
                                  >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                          style={{
                                            background:
                                              PIE_COLORS[i % PIE_COLORS.length],
                                          }}
                                        />
                                        {s.name}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                      {s.bookings}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                                      ₹{s.platform.toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── TRANSACTION LOG ── */}
                    {revenueView === "table" && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-gray-800">
                              Transaction Log
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Most recent {r.revenueData?.length} paid
                              transactions
                            </p>
                          </div>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-gray-100">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                {[
                                  "Date",
                                  "Customer",
                                  "Provider",
                                  "Service",
                                  "Total",
                                  "Platform Fee",
                                  "Provider Payout",
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
                              {r.revenueData?.map((row) => (
                                <tr
                                  key={row.id}
                                  className="row-hover transition-colors"
                                >
                                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                                    {new Date(row.date).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}
                                  </td>
                                  <td className="px-4 py-3.5 text-sm text-gray-700">
                                    {row.customer}
                                  </td>
                                  <td className="px-4 py-3.5 text-sm text-gray-700">
                                    {row.provider}
                                  </td>
                                  <td className="px-4 py-3.5 text-sm text-gray-700">
                                    {row.service}
                                  </td>
                                  <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                                    ₹{row.totalAmount.toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3.5 text-sm font-semibold text-green-600">
                                    ₹{row.platformFee.toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">
                                    ₹{row.providerEarnings.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
