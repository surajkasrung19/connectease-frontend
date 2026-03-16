// frontend/src/pages/public/Services.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
 
const serviceIcons = {
  plumbing: "🔧",
  carpentry: "🪚",
  painting: "🎨",
  electrician: "⚡",
  cleaning: "🧹",
  gardening: "🌿",
  default: "🛠️",
};
 
const serviceColors = [
  { bg: "from-blue-500 to-blue-700", light: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
  { bg: "from-indigo-500 to-indigo-700", light: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700" },
  { bg: "from-cyan-500 to-cyan-700", light: "bg-cyan-50", border: "border-cyan-200", badge: "bg-cyan-100 text-cyan-700" },
  { bg: "from-sky-500 to-sky-700", light: "bg-sky-50", border: "border-sky-200", badge: "bg-sky-100 text-sky-700" },
  { bg: "from-violet-500 to-violet-700", light: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-700" },
  { bg: "from-teal-500 to-teal-700", light: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-100 text-teal-700" },
];
 
export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
 
  useEffect(() => {
    API.get("/services")
      .then((res) => setServices(res.data))
      .catch((err) => console.error("Failed to fetch services", err))
      .finally(() => setLoading(false));
  }, []);
 
  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes fadeUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-btn {
          background-size: 200% auto;
          transition: background-position 0.5s;
        }
        .shimmer-btn:hover { background-position: right center; }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
      `}</style>
 
      {/* Navbar strip */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/homepage")}
            className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <span className="text-2xl font-bold text-blue-600">ConnectEase</span>
          <button
            onClick={() => navigate("/login")}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Book Now
          </button>
        </div>
      </nav>
 
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-6 left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-6 right-10 w-56 h-56 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/30">
            🏠 Professional Home Services
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Find the Right Service,<br />
            <span className="text-yellow-300">Right at Your Door</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Browse our trusted professionals across home service categories. Transparent pricing, verified experts.
          </p>
          {/* Search bar */}
          <div className="max-w-md mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
            />
          </div>
        </div>
      </div>
 
      {/* Stats Strip */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-3 divide-x divide-gray-100 text-center">
          {[
            { label: "Services Available", value: services.length },
            { label: "Verified Providers", value: "10k+" },
            { label: "Jobs Completed", value: "50k+" },
          ].map((stat, i) => (
            <div key={i} className="px-4">
              <p className="text-xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
 
      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow animate-pulse h-64" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700">No services found</h3>
            <p className="text-gray-500 mt-2">Try a different search term</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {search ? `Results for "${search}"` : "All Services"}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filtered.length} service{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
 
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((service, index) => {
                const color = serviceColors[index % serviceColors.length];
                const icon = serviceIcons[service.name.toLowerCase()] || serviceIcons.default;
                return (
                  <div
                    key={service._id}
                    className={`bg-white rounded-2xl shadow-md card-hover border ${color.border} overflow-hidden fade-up`}
                    style={{ animationDelay: `${index * 0.07}s` }}
                  >
                    {/* Card Header */}
                    <div className={`bg-gradient-to-r ${color.bg} p-6 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                      <div className="text-4xl mb-3">{icon}</div>
                      <h3 className="text-xl font-bold">{service.name}</h3>
                      <span className="inline-block bg-white/20 text-white text-xs px-2 py-0.5 rounded-full mt-1 border border-white/30">
                        Available Now
                      </span>
                    </div>
 
                    {/* Card Body */}
                    <div className="p-5">
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                        {service.description}
                      </p>
 
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Starting from</p>
                          <p className="text-2xl font-extrabold text-blue-600">₹{service.charges}</p>
                        </div>
                        <div className={`${color.badge} text-xs font-semibold px-3 py-1.5 rounded-full`}>
                          ⭐ Top Rated
                        </div>
                      </div>
 
                      <button
                        onClick={() => {
                          const token = localStorage.getItem("token");
                          const role = localStorage.getItem("role");
                          if (!token) {
                            navigate("/login", { state: { redirectTo: `/services/${service._id}/providers` } });
                            return;
                          }
                          if (role === "provider") {
                            alert("You are already a provider");
                            navigate("/provider/dashboard");
                            return;
                          }
                          navigate(`/services/${service._id}/providers`);
                        }}
                        className={`w-full bg-gradient-to-r ${color.bg} text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all active:scale-95 shadow-sm`}
                      >
                        View Providers →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
 
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-4 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Can't find what you need?</h2>
          <p className="text-blue-100 mb-6">
            Our support team is ready to help you connect with the right professional.
          </p>
          <button
            onClick={() => navigate("/support")}
            className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition active:scale-95"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}