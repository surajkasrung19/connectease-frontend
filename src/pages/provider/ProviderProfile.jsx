// frontend/src/pages/provider/ProviderProfile.jsx
import { useState, useEffect } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function ProviderProfile() {
  const [provider, setProvider] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/provider/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProvider(res.data.user);
      setForm(res.data.user);
    } catch (err) {
      console.log("Profile load failed", err);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await API.patch("/provider/update", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProvider(res.data.user);
      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.log("update failed", err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      alert("Please fill in both password fields.");
      return;
    }
    try {
      setChangingPass(true);
      const token = localStorage.getItem("token");
      await API.patch(
        "/provider/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Password changed successfully!");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      console.log("Password change error:", err);
      alert("Failed to change password.");
    } finally {
      setChangingPass(false);
    }
  };

  if (!provider || Object.keys(provider).length === 0)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">
          Loading profile...
        </div>
      </div>
    );

  const initials = provider.name
    ? provider.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "P";

  const availabilityColor = {
    "Available Today": "bg-green-100 text-green-700 border-green-200",
    "Available Tomorrow": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Not Available": "bg-red-100 text-red-600 border-red-200",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/provider/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage your provider details
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Avatar / Identity Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-800 truncate">
                {provider.name}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{provider.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-block text-xs bg-blue-100 text-blue-600 font-semibold px-2.5 py-0.5 rounded-full">
                  Provider
                </span>
                <span
                  className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${availabilityColor[provider.availability] || "bg-gray-100 text-gray-500 border-gray-200"}`}
                >
                  {provider.availability || "Unknown"}
                </span>
              </div>
            </div>
            {/* Edit / Save buttons inline */}
            <div className="flex-shrink-0 flex gap-2">
              {editMode ? (
                <>
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 shadow-sm"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setForm(provider);
                    }}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition flex items-center gap-1.5"
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
                      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z"
                    />
                  </svg>
                  Edit
                </button>
              )}
            </div>
          </div>
          {saveSuccess && (
            <div className="mt-3 flex items-center gap-1.5 text-green-600 text-sm font-medium">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Profile updated successfully!
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {"★".repeat(Math.round(provider.rating || 0))}
              <span className="text-gray-800 text-xl ml-1">
                {provider.rating ?? "—"}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Rating</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {provider.reviews ?? 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total Reviews</p>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-5">
            Professional Details
          </h3>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Full Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
                />
              ) : (
                <p className="text-sm text-gray-800 py-2.5 px-4 bg-gray-50 rounded-lg">
                  {provider.name}
                </p>
              )}
            </div>

            {/* Email — always read only */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Email
                <span className="ml-2 text-xs text-gray-400 font-normal">
                  (cannot be changed)
                </span>
              </label>
              <p className="text-sm text-gray-400 py-2.5 px-4 bg-gray-50 rounded-lg border border-gray-100">
                {provider.email}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Phone Number
              </label>
              {editMode ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength="10"
                    value={form.phone || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,10}$/.test(value))
                        setForm({ ...form, phone: value });
                    }}
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-800 py-2.5 px-4 bg-gray-50 rounded-lg">
                  {provider.phone || "Not added"}
                </p>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Experience
              </label>
              {editMode ? (
                <input
                  type="text"
                  placeholder="e.g. 5 years"
                  value={form.experience || ""}
                  onChange={(e) =>
                    setForm({ ...form, experience: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
                />
              ) : (
                <p className="text-sm text-gray-800 py-2.5 px-4 bg-gray-50 rounded-lg">
                  {provider.experience || "Not added"}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Service Price (₹)
              </label>
              {editMode ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={form.price || ""}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-800 py-2.5 px-4 bg-gray-50 rounded-lg font-semibold">
                  ₹{provider.price}
                </p>
              )}
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Availability
              </label>
              {editMode ? (
                <select
                  value={form.availability || ""}
                  onChange={(e) =>
                    setForm({ ...form, availability: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
                >
                  <option>Available Today</option>
                  <option>Available Tomorrow</option>
                  <option>Not Available</option>
                </select>
              ) : (
                <div className="py-2.5 px-4 bg-gray-50 rounded-lg">
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${availabilityColor[provider.availability] || "bg-gray-100 text-gray-500 border-gray-200"}`}
                  >
                    {provider.availability}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">
            Security
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Keep your account safe with a strong password
          </p>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 border border-blue-200 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition active:scale-95"
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            Change Password
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword("");
                  setNewPassword("");
                }}
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword("");
                  setNewPassword("");
                }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={changingPass}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {changingPass ? "Saving..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
