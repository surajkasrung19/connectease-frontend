// frontend/src/pages/customer/PayNow.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";
import { ArrowLeft } from "lucide-react";

export default function PayNow() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, []);

  const fetchAppointment = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointment(res.data);
    } catch (err) {
      console.error("Error fetching appointment:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem("token");

      const loaded = await loadRazorpay();
      if (!loaded) {
        alert("Razorpay SDK failed to load");
        setProcessing(false);
        return;
      }

      const orderRes = await API.post(
        "/payments/create-order",
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const { orderId, amount, currency } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "ConnectEase",
        description: "Service Payment",
        order_id: orderId,
        handler: async function (response) {
          try {
            await API.post(
              "/payments/verify",
              {
                appointmentId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            alert("Payment Successful!");
            await fetchAppointment();
            navigate(`/customer/feedback/${appointmentId}`);
          } catch (err) {
            console.error("Verification failed:", err);
            alert("Payment verification failed");
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
        theme: { color: "#2563eb" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-3">⚠️</span>
          <p className="text-gray-600 font-medium">Appointment not found</p>
          <button
            onClick={() => navigate("/customer/dashboard")}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isPaid = appointment.paymentStatus === "paid";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => navigate("/customer/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Payment</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Complete your service payment
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {/* Booking Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
            Booking Details
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: "🛠️",
                label: "Service",
                value: appointment.service?.name,
              },
              {
                icon: "👷",
                label: "Provider",
                value: appointment.provider?.name,
              },
              {
                icon: "📅",
                label: "Date",
                value: new Date(appointment.scheduledTime).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "long", year: "numeric" },
                ),
              },
              {
                icon: "🕐",
                label: "Time",
                value: new Date(appointment.scheduledTime).toLocaleTimeString(
                  "en-IN",
                  { hour: "2-digit", minute: "2-digit" },
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm text-gray-500">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
            Price Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Service Charge</span>
              <span className="text-sm font-semibold text-gray-800">
                ₹{appointment.servicePrice}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Platform Fee</span>
              <span className="text-sm font-semibold text-gray-800">
                ₹{appointment.platformFee}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-800">Total Amount</span>
              <span className="text-xl font-extrabold text-blue-600">
                ₹{appointment.totalAmount}
              </span>
            </div>
          </div>

          {/* Payment Status Badge */}
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">Payment Status</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isPaid
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
              }`}
            >
              {isPaid ? "✓ Paid" : "⏳ Unpaid"}
            </span>
          </div>
        </div>

        {/* Security note */}
        {!isPaid && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-lg">🔒</span>
            <p className="text-xs text-blue-600 font-medium">
              Your payment is secured by Razorpay. We support UPI, cards & net
              banking.
            </p>
          </div>
        )}

        {/* Action Button */}
        {!isPaid ? (
          <button
            onClick={handlePayment}
            disabled={processing}
            className={`w-full py-3.5 rounded-xl text-base font-bold transition shadow-sm active:scale-95 ${
              processing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            }`}
          >
            {processing ? (
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
                Processing...
              </span>
            ) : (
              "🔒  Pay Securely  ₹" + appointment.totalAmount
            )}
          </button>
        ) : (
          <div className="space-y-3">
            {/* Success banner */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="text-sm font-bold text-green-700">
                  Payment Successful!
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  Thank you for using ConnectEase
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/customer/dashboard")}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
