// frontend/src/pages/customer/ServiceBooking.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import {
  Calendar,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  ArrowLeft,
  Phone,
} from "lucide-react";


function previewPlatformFee(price) {
  if (!price) return 0;
  return Math.max(Math.round((price * 3) / 100), 10);
}


function to24Hour(time12) {
  const [time, mod] = time12.split(" ");
  let [h, m] = time.split(":");
  if (mod === "PM" && h !== "12") h = String(Number(h) + 12);
  if (mod === "AM" && h === "12") h = "00";
  return `${String(h).padStart(2, "0")}:${m}`;
}

export default function ServiceBookingPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  useEffect(() => {
    API.get("/services")
      .then((res) => setServices(res.data))
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedProvider(null);
    setLoadingProviders(true);
    API.get(`/provider?serviceId=${service._id}`)
      .then((res) => setProviders(res.data))
      .catch((err) => console.error("Error fetching providers:", err))
      .finally(() => setLoadingProviders(false));
  };

  const handleProviderSelect = (provider) => setSelectedProvider(provider);

  
  const providerPrice = selectedProvider?.price ?? 0;
  const platformFeePreview = previewPlatformFee(providerPrice);
  const totalPreview = providerPrice + platformFeePreview;

  const handleBooking = async () => {
    if (!isFormValid) return;
    try {
      setBooking(true);
      const token = localStorage.getItem("token");

      
      const scheduledTimeISO = new Date(
        `${bookingDate}T${to24Hour(bookingTime)}:00`,
      ).toISOString();

      
      const res = await API.post(
        "/appointments",
        {
          serviceId: selectedService._id,
          providerId: selectedProvider._id,
          address,
          details: description || "N/A",
          scheduledTime: scheduledTimeISO,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      
      setConfirmedAppointment(res.data.appointment);
      setShowConfirmation(true);
    } catch (err) {
      console.log("Booking Error:", err);
      alert("Error placing booking. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const handleReset = () => {
    setSelectedService(null);
    setSelectedProvider(null);
    setBookingDate("");
    setBookingTime("");
    setAddress("");
    setDescription("");
    setShowConfirmation(false);
    setConfirmedAppointment(null);
    navigate("/customer/book-service");
  };

  const isFormValid =
    selectedService &&
    selectedProvider &&
    bookingDate &&
    bookingTime &&
    address;

  //Confirmation Screen
  if (showConfirmation) {
   
    const realFee = confirmedAppointment?.platformFee ?? platformFeePreview;
    const realTotal = confirmedAppointment?.totalAmount ?? totalPreview;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-11 h-11 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-500 text-sm mb-7">
              Your service booking has been successfully placed.
            </p>

            <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-3 border border-gray-100">
              <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide mb-3">
                Booking Summary
              </h3>
              {[
                { label: "Service", value: selectedService.name },
                { label: "Provider", value: selectedProvider.name },
                { label: "Date", value: bookingDate },
                { label: "Time", value: bookingTime },
                { label: "Service Charge", value: `₹${providerPrice}` },
                { label: "Platform Fee", value: `₹${realFee} (3%)` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {item.value}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">
                  Total Amount
                </span>
                <span className="text-sm font-bold text-green-600">
                  ₹{realTotal}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full text-xs font-semibold">
                  Pending
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition active:scale-95"
              >
                Book Another
              </button>
              <button
                onClick={() => navigate("/customer/dashboard")}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition active:scale-95 shadow-sm"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Booking Page 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <style>{`
        .service-card  { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .service-card:hover  { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        .provider-card { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .provider-card:hover { box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
        input:focus, textarea:focus, select:focus {
          outline: none; border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
      `}</style>

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Book a Service</h1>
            <p className="text-xs text-gray-400">
              Find and book trusted local service providers
            </p>
          </div>

          {/* Progress Steps */}
          <div className="ml-auto hidden sm:flex items-center gap-2 text-xs">
            {["Service", "Provider", "Details"].map((step, i) => {
              const done =
                (i === 0 && selectedService) ||
                (i === 1 && selectedProvider) ||
                (i === 2 && isFormValid);
              const active =
                (i === 0 && !selectedService) ||
                (i === 1 && selectedService && !selectedProvider) ||
                (i === 2 && selectedProvider);
              return (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div
                      className={`w-8 h-px ${done || active ? "bg-blue-300" : "bg-gray-200"}`}
                    />
                  )}
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
                      done
                        ? "bg-green-100 text-green-700"
                        : active
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <span>{done ? "✓" : i + 1}</span>
                    <span>{step}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Step 1 — Service */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedService ? "bg-green-500 text-white" : "bg-blue-600 text-white"}`}
                >
                  {selectedService ? "✓" : "1"}
                </div>
                <h2 className="text-base font-bold text-gray-800">
                  Select a Service
                </h2>
                {selectedService && (
                  <span className="ml-auto text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    {selectedService.name}
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {services.map((service) => (
                  <button
                    key={service._id}
                    onClick={() => handleServiceSelect(service)}
                    className={`service-card p-4 rounded-xl border-2 text-left ${
                      selectedService?._id === service._id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 bg-white"
                    }`}
                  >
                    <h3
                      className={`font-semibold text-sm mb-1 ${selectedService?._id === service._id ? "text-blue-700" : "text-gray-800"}`}
                    >
                      {service.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {service.description}
                    </p>
                    <p className="text-xs font-bold text-blue-600">
                      From ₹{service.charges}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 — Provider */}
            {selectedService && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedProvider ? "bg-green-500 text-white" : "bg-blue-600 text-white"}`}
                  >
                    {selectedProvider ? "✓" : "2"}
                  </div>
                  <h2 className="text-base font-bold text-gray-800">
                    Available {selectedService.name} Providers
                  </h2>
                </div>

                {loadingProviders ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="h-24 bg-gray-100 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : providers.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <span className="text-4xl block mb-2">👷</span>
                    <p className="text-sm font-medium text-gray-500">
                      No providers available
                    </p>
                    <p className="text-xs mt-1">
                      Try a different service or check back later
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {providers.map((provider) => (
                      <div
                        key={provider._id}
                        className={`provider-card p-4 rounded-xl border-2 cursor-pointer transition ${
                          selectedProvider?._id === provider._id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300 bg-white"
                        }`}
                        onClick={() => handleProviderSelect(provider)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-sm">
                            {provider.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <h3 className="font-bold text-gray-800 text-sm">
                                  {provider.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {selectedService.name} Specialist
                                </p>
                              </div>
                              <span
                                className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                  provider.availability === "Available Today"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : provider.availability ===
                                        "Available Tomorrow"
                                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                      : "bg-gray-100 text-gray-500 border-gray-200"
                                }`}
                              >
                                {provider.availability}
                              </span>
                            </div>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-semibold text-gray-700">
                                  {provider.rating}
                                </span>
                                <span className="text-xs text-gray-400">
                                  ({provider.reviews} reviews)
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-xs">
                                  {provider.experience} yrs exp
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Phone className="w-3.5 h-3.5" />
                                <span className="text-xs">
                                  {provider.phone}
                                </span>
                              </div>
                              <div className="ml-auto text-blue-600 font-bold text-sm">
                                ₹{provider.price}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

         
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
              <div className="flex items-center gap-2 mb-5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isFormValid ? "bg-green-500 text-white" : "bg-blue-600 text-white"}`}
                >
                  {isFormValid ? "✓" : "3"}
                </div>
                <h2 className="text-base font-bold text-gray-800">
                  Booking Details
                </h2>
              </div>

              {!selectedService ? (
                <div className="text-center py-10 text-gray-400">
                  <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm font-medium text-gray-400">
                    Select a service to continue
                  </p>
                </div>
              ) : !selectedProvider ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-4xl mb-3">👷</div>
                  <p className="text-sm font-medium text-gray-400">
                    Choose a provider to continue
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Provider mini-card */}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {selectedProvider.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {selectedProvider.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {selectedService.name}
                      </p>
                    </div>
                    <div className="ml-auto text-blue-600 font-bold text-sm flex-shrink-0">
                      ₹{selectedProvider.price}
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" /> Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm transition"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      <Clock className="w-3.5 h-3.5 inline mr-1" /> Time Slot
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white transition"
                    >
                      <option value="">Choose time slot</option>
                      {[
                        "09:00 AM",
                        "10:00 AM",
                        "11:00 AM",
                        "12:00 PM",
                        "02:00 PM",
                        "03:00 PM",
                        "04:00 PM",
                        "05:00 PM",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5 inline mr-1" /> Service
                      Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your complete address"
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none transition"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Problem Description
                      <span className="text-gray-400 font-normal normal-case ml-1">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your issue in detail..."
                      rows={2}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none transition"
                    />
                  </div>

                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Service Charge</span>
                      <span className="font-semibold text-gray-800">
                        ₹{providerPrice}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        Platform Fee
                        <span className="text-xs bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                          3%
                        </span>
                      </span>
                      <span className="font-semibold text-gray-800">
                        ₹{platformFeePreview}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="font-bold text-gray-800">Total</span>
                      <span className="font-bold text-blue-600 text-base">
                        ₹{totalPreview}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 text-center pt-0.5">
                      Exact amount confirmed on booking
                    </p>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleBooking}
                    disabled={!isFormValid || booking}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition shadow-sm active:scale-95 ${
                      isFormValid && !booking
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {booking ? (
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
                        Confirming...
                      </span>
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    🔒 Pay only after service is completed
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
