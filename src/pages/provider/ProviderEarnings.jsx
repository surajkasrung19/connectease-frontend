// frontend/src/pages/provider/ProviderEarnings.jsx
import { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

// Range options 
const RANGE_OPTIONS = [
  { label: "1 Month", months: 1 },
  { label: "2 Months", months: 2 },
  { label: "3 Months", months: 3 },
  { label: "6 Months", months: 6 },
  { label: "9 Months", months: 9 },
  { label: "1 Year", months: 12 },
  { label: "18 Months", months: 18 },
  { label: "2 Years", months: 24 },
];

// Bar colors — defined as constants so they never change reference
const COLOR_BEST = "#2563eb"; // best month — dark blue
const COLOR_HOVER = "#60a5fa"; // hovered bar — medium blue
const COLOR_DEFAULT = "#93c5fd"; // all other bars — soft blue

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-4 py-3 text-sm">
        <p className="text-gray-500 font-medium mb-1">{label}</p>
        <p className="text-blue-600 font-bold text-base">
          ₹{payload[0].value.toLocaleString()}
        </p>
        {payload[0].value === 0 && (
          <p className="text-gray-400 text-xs mt-0.5">No earnings this month</p>
        )}
      </div>
    );
  }
  return null;
};

// Shorten "Jan 2025" → "Jan '25" for ranges > 6 months
function shortLabel(month, totalMonths) {
  if (totalMonths <= 6) return month;
  const [mon, yr] = month.split(" ");
  return yr ? `${mon} '${yr.slice(2)}` : month;
}


function getBarSettings(months) {
  if (months === 1) return { gap: 0.7, maxBar: 80 };
  if (months === 2) return { gap: 0.65, maxBar: 70 };
  if (months === 3) return { gap: 0.6, maxBar: 60 };
  if (months <= 6) return { gap: 0.5, maxBar: 44 };
  if (months <= 9) return { gap: 0.45, maxBar: 36 };
  if (months <= 12) return { gap: 0.4, maxBar: 30 };
  if (months <= 18) return { gap: 0.35, maxBar: 22 };
  return { gap: 0.3, maxBar: 18 };
}

export default function ProviderEarnings() {
  const [data, setData] = useState(null);
  const [selectedRange, setSelectedRange] = useState(6);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();

  const loadEarnings = useCallback(async (months) => {
    setLoading(true);
    setHoveredIndex(null);
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(
        `/appointments/provider-earnings?months=${months}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setData(res.data);
    } catch (err) {
      console.error("error loading earnings", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEarnings(selectedRange);
  }, [selectedRange, loadEarnings]);

  // Build chart data — keep `month` as the XAxis key, not `label`
  // to avoid key collision issues in Recharts internals
  const rawSeries = data?.monthlySeries ?? [];
  const maxEarnings = rawSeries.length
    ? Math.max(...rawSeries.map((m) => m.earnings))
    : 0;
  const bestMonth =
    maxEarnings > 0 ? rawSeries.find((m) => m.earnings === maxEarnings) : null;

  
  const chartData = rawSeries.map((m) => ({
    month: m.month,
    earnings: m.earnings,
    display: shortLabel(m.month, selectedRange),
  }));

  const { gap, maxBar } = getBarSettings(selectedRange);
  const selectedLabel =
    RANGE_OPTIONS.find((o) => o.months === selectedRange)?.label ??
    `${selectedRange} Months`;
  const needsRotation = selectedRange > 12;
  const xAxisFontSize = selectedRange > 12 ? 9 : selectedRange > 6 ? 10 : 11;

  return (
    <div className="min-h-screen bg-gray-100">
      <style>{`
        .range-btn { transition: all 0.15s ease; }
        .range-btn:hover { transform: translateY(-1px); }
        .range-btn.active { box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
      `}</style>

      {/* ── Header ── */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/provider/dashboard")}
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
            <h1 className="text-xl font-bold text-gray-800">
              Earnings Overview
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Track your income and performance over time
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-7 space-y-6">
        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Earnings",
              icon: "💰",
              color: "text-green-600",
              bg: "bg-green-50",
              value: `₹${(data?.totalEarnings ?? 0).toLocaleString()}`,
              sub: "All time",
            },
            {
              label: "Today",
              icon: "📅",
              color: "text-blue-600",
              bg: "bg-blue-50",
              value: `₹${(data?.todayEarnings ?? 0).toLocaleString()}`,
              sub: new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              }),
            },
            {
              label: "This Month",
              icon: "📆",
              color: "text-indigo-600",
              bg: "bg-indigo-50",
              value: `₹${(data?.monthEarnings ?? 0).toLocaleString()}`,
              sub: new Date().toLocaleString("en-US", { month: "long" }),
            },
            {
              label: "Completed Jobs",
              icon: "✅",
              color: "text-teal-600",
              bg: "bg-teal-50",
              value: data?.completedCount ?? 0,
              sub: "Paid & done",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="stat-card bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div
                className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center text-xl mb-3`}
              >
                {s.icon}
              </div>
              <p className={`text-2xl font-bold ${s.color} mb-0.5`}>
                {s.value}
              </p>
              <p className="text-xs font-semibold text-gray-600">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Chart Card ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Chart header + range selector */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-gray-800 text-base">
                Monthly Earnings
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedLabel}
                {data && !loading && (
                  <span className="ml-1 text-blue-600 font-semibold">
                    — ₹{(data.rangeEarnings ?? 0).toLocaleString()} earned
                  </span>
                )}
              </p>
            </div>

            {/* Range buttons */}
            <div className="flex flex-wrap gap-1.5">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.months}
                  onClick={() => setSelectedRange(opt.months)}
                  className={`range-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    selectedRange === opt.months
                      ? "active bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-56 gap-3 text-gray-400">
              <svg
                className="w-8 h-8 animate-spin text-blue-400"
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
              <p className="text-sm">Loading chart...</p>
            </div>
          ) : chartData.every((m) => m.earnings === 0) ? (
            <div className="flex flex-col items-center justify-center h-56 text-gray-400">
              <span className="text-4xl mb-3">📊</span>
              <p className="text-sm font-medium text-gray-500">
                No earnings in this period
              </p>
              <p className="text-xs mt-1">
                Try a wider range or complete more jobs
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                margin={{
                  top: 8,
                  right: 8,
                  left: 0,
                  bottom: needsRotation ? 16 : 0,
                }}
                barCategoryGap={gap} 
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />

                <XAxis
                  dataKey="display" 
                  tick={{
                    fontSize: xAxisFontSize,
                    fill: "#9ca3af",
                    fontWeight: 500,
                  }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                  interval={0}
                  angle={needsRotation ? -35 : 0}
                  textAnchor={needsRotation ? "end" : "middle"}
                  height={needsRotation ? 44 : 20}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v === 0
                      ? "₹0"
                      : `₹${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`
                  }
                  width={46}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f0f9ff", radius: 6 }}
                />

               
                <Bar
                  dataKey="earnings"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={maxBar}
                  fill={COLOR_DEFAULT} 
                  isAnimationActive={true}
                >
                  {chartData.map((entry, index) => {
                    const isBest =
                      entry.earnings === maxEarnings && entry.earnings > 0;
                    const isHovered = hoveredIndex === index;
                    return (
                      <Cell
                        key={`cell-${index}`}
                      
                        fill={
                          isBest
                            ? COLOR_BEST
                            : isHovered
                              ? COLOR_HOVER
                              : COLOR_DEFAULT
                        }
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{
                          cursor: "pointer",
                          transition: "fill 0.2s ease",
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Best month callout */}
          {!loading && bestMonth && (
            <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block flex-shrink-0" />
                <span>
                  Best month:{" "}
                  <span className="font-semibold text-blue-600">
                    {bestMonth.month}
                  </span>{" "}
                  — ₹{maxEarnings.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
                <span>Best</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-300 inline-block ml-2" />
                <span>Others</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Recent Completed Jobs ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-800 text-base">
                Recent Completed Jobs
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Latest 50 paid jobs
              </p>
            </div>
            {!!data?.jobs?.length && (
              <span className="bg-green-100 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-full">
                {data.jobs.length} jobs
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : !data?.jobs?.length ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-3">📋</span>
              <p className="text-sm font-medium text-gray-500">
                No completed jobs yet
              </p>
              <p className="text-xs mt-1">
                Accepted jobs will appear here once paid
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {["Date", "Customer", "Service", "Earned"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${
                          i === 3 ? "text-right rounded-r-lg" : "text-left"
                        } ${i === 0 ? "rounded-l-lg" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.jobs.map((j) => (
                    <tr
                      key={j._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(
                          j.paidAt || j.completedAt || j.updatedAt,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                            {j.customer?.name?.charAt(0) || "C"}
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {j.customer?.name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {j.service?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-green-600">
                          ₹{(j.providerEarnings || 0).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-xs font-semibold text-gray-500 rounded-l-lg"
                    >
                      Total (shown jobs)
                    </td>
                    <td className="px-4 py-3 text-right rounded-r-lg">
                      <span className="text-sm font-bold text-gray-800">
                        ₹
                        {data.jobs
                          .reduce((s, j) => s + (j.providerEarnings || 0), 0)
                          .toLocaleString()}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
