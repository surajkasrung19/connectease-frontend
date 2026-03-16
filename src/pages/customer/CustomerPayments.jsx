// frontend/src/pages/customer/CustomerPayment.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

const statusStyles = {
  paid: "bg-green-100 text-green-700 border border-green-200",
  refunded: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  failed: "bg-red-100 text-red-700 border border-red-200",
  pending: "bg-gray-100 text-gray-600 border border-gray-200",
};
const statusIcons = { paid: "✓", refunded: "↩", failed: "✕", pending: "⏳" };


function generateReceiptHTML(p) {
  const date = new Date(p.paidAt || p.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const receiptNo = `CE-${p._id?.slice(-8).toUpperCase()}`;
  const platformFee = p.platformFee ?? 0; // real 3% value from DB
  const serviceCharge = (p.servicePrice || p.totalAmount - platformFee) ?? 0;
  const feePercent = p.servicePrice
    ? ((platformFee / p.servicePrice) * 100).toFixed(1)
    : "3.0";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Receipt ${receiptNo} — ConnectEase</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1f2937}
    .page{max-width:600px;margin:0 auto;padding:40px 36px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}
    .brand{display:flex;align-items:center;gap:10px}
    .brand-icon{width:40px;height:40px;background:#2563eb;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:900}
    .brand-name{font-size:22px;font-weight:800;color:#2563eb}
    .brand-sub{font-size:11px;color:#9ca3af;margin-top:2px}
    .receipt-meta{text-align:right}
    .receipt-meta h2{font-size:20px;font-weight:700;color:#1f2937}
    .receipt-meta p{font-size:12px;color:#6b7280;margin-top:3px}
    .paid-banner{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:10px;margin-bottom:24px}
    .paid-dot{width:10px;height:10px;background:#16a34a;border-radius:50%;flex-shrink:0}
    .paid-text{font-size:13px;font-weight:600;color:#15803d}
    .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:12px;margin-top:24px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .info-item label{font-size:11px;color:#9ca3af;display:block;margin-bottom:2px}
    .info-item p{font-size:13px;font-weight:600;color:#1f2937}
    hr{border:none;border-top:1px solid #f3f4f6;margin:20px 0}
    .price-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f9fafb;font-size:13px}
    .price-row:last-child{border-bottom:none}
    .price-row .lbl{color:#6b7280}
    .price-row .val{font-weight:600;color:#1f2937}
    .fee-badge{display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;margin-left:5px}
    .total-row{display:flex;justify-content:space-between;padding:14px 16px;background:#eff6ff;border-radius:10px;margin-top:10px}
    .total-row .lbl{font-size:14px;font-weight:700;color:#1e40af}
    .total-row .val{font-size:18px;font-weight:800;color:#2563eb}
    .footer{margin-top:32px;padding-top:18px;border-top:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center}
    .footer-note{font-size:11px;color:#9ca3af;line-height:1.6}
    .footer-brand{font-size:12px;font-weight:700;color:#2563eb}
    .watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;font-weight:900;color:rgba(22,163,74,0.05);pointer-events:none;white-space:nowrap;z-index:0}
    @media print{.watermark{position:fixed}}
  </style>
</head>
<body>
  <div class="watermark">PAID</div>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div class="brand-icon">C</div>
        <div>
          <div class="brand-name">ConnectEase</div>
          <div class="brand-sub">Local Service Marketplace</div>
        </div>
      </div>
      <div class="receipt-meta">
        <h2>Payment Receipt</h2>
        <p>${receiptNo}</p>
        <p>${date}</p>
      </div>
    </div>

    <div class="paid-banner">
      <div class="paid-dot"></div>
      <div class="paid-text">Payment Successful — Thank you for using ConnectEase!</div>
    </div>

    <div class="section-title">Service Details</div>
    <div class="info-grid">
      <div class="info-item"><label>Service</label><p>${p.service?.name || "—"}</p></div>
      <div class="info-item"><label>Provider</label><p>${p.provider?.name || "—"}</p></div>
      <div class="info-item"><label>Payment Method</label><p>${p.paymentMethod || "Razorpay"}</p></div>
      <div class="info-item"><label>Payment Date</label><p>${date}</p></div>
    </div>

    <hr/>

    <div class="section-title">Price Breakdown</div>
    <div class="price-row">
      <span class="lbl">Service Charge</span>
      <span class="val">₹${serviceCharge}</span>
    </div>
    <div class="price-row">
      <span class="lbl">Platform Fee <span class="fee-badge">${feePercent}%</span></span>
      <span class="val">₹${platformFee}</span>
    </div>
    <div class="total-row">
      <span class="lbl">Total Paid</span>
      <span class="val">₹${p.totalAmount}</span>
    </div>

    <div class="footer">
      <div class="footer-note">
        Receipt ID: ${receiptNo}<br/>
        For support: supportconnectease@gmail.com
      </div>
      <div class="footer-brand">ConnectEase ©${new Date().getFullYear()}</div>
    </div>
  </div>
</body>
</html>`;
}

function downloadReceipt(p) {
  const html = generateReceiptHTML(p);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onload = () => {
      win.focus();
      win.print();
      URL.revokeObjectURL(url);
    };
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt_${p._id?.slice(-8).toUpperCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default function CustomerPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/payments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch payments", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter((p) => {
    const matchSearch =
      p.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.provider?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.paymentStatus === filter;
    return matchSearch && matchFilter;
  });

  const totalPaid = payments
    .filter((p) => p.paymentStatus === "paid")
    .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`.row-hover:hover { background: #f8faff; }`}</style>

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/customer/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Payment History</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              All your transactions in one place
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Total Spent",
              value: `₹${totalPaid.toLocaleString()}`,
              icon: "💳",
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Total Payments",
              value: payments.length,
              icon: "📋",
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Successful",
              value: payments.filter((p) => p.paymentStatus === "paid").length,
              icon: "✅",
              color: "text-green-600",
              bg: "bg-green-50",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
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
              placeholder="Search by service or provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "paid", "refunded", "failed"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition ${filter === s ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="text-5xl mb-3">💳</span>
              <p className="font-medium text-gray-500">No payments found</p>
              <p className="text-xs mt-1">
                Try adjusting your search or filter
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {[
                      "Service",
                      "Provider",
                      "Date",
                      "Method",
                      "Amount",
                      "Fee",
                      "Status",
                      "Receipt",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 4 ? "text-center" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((p) => {
                    const fee = p.platformFee ?? 0;
                    return (
                      <tr key={p._id} className="row-hover transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-semibold text-gray-800">
                            {p.service?.name || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                              {p.provider?.name?.charAt(0) || "P"}
                            </div>
                            <span className="text-sm text-gray-700">
                              {p.provider?.name || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-500">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-500">
                          {p.paymentMethod || "—"}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-bold text-gray-800">
                            ₹{p.totalAmount?.toLocaleString()}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-xs text-gray-500">₹{fee}</span>
                          <span className="block text-xs text-blue-400 font-semibold">
                            3%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[p.paymentStatus] || statusStyles.pending}`}
                          >
                            <span>{statusIcons[p.paymentStatus] || "•"}</span>
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {p.paymentStatus === "paid" ? (
                            <button
                              onClick={() => downloadReceipt(p)}
                              title="Download Receipt"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 active:scale-95 transition"
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
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                              Receipt
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <p className="text-xs text-gray-400">
                  Showing{" "}
                  <span className="font-semibold text-gray-600">
                    {filtered.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-600">
                    {payments.length}
                  </span>{" "}
                  payments
                </p>
                {filtered.some((p) => p.paymentStatus === "paid") && (
                  <p className="text-xs text-gray-400">
                    💡 Click{" "}
                    <span className="font-semibold text-blue-600">Receipt</span>{" "}
                    on any paid row to download your invoice
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
