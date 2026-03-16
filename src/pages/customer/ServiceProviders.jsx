// frontend/src/pages/customer/ServiceProviders.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { ArrowLeft, Star, Clock, Phone } from "lucide-react";

export default function ServiceProviders() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [sortBy, setSortBy] = useState("rating");
  const [loading, setLoading] = useState(true);
  const [serviceName, setServiceName] = useState("");

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await API.get(`/provider?serviceId=${serviceId}`);
      setProviders(res.data);
      if (res.data.length > 0) setServiceName(res.data[0]?.service?.name || "");
    } catch (err) {
      console.error("Error fetching providers", err);
    } finally {
      setLoading(false);
    }
  };

  const sortedProviders = [...providers].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "priceLow") return a.price - b.price;
    if (sortBy === "priceHigh") return b.price - a.price;
    return 0;
  });

  const availabilityConfig = {
    "Available Today": {
      classes: "bg-green-100 text-green-700 border-green-200",
      dot: "bg-green-500",
    },
    "Available Tomorrow": {
      classes: "bg-yellow-100 text-yellow-700 border-yellow-200",
      dot: "bg-yellow-500",
    },
    "Not Available": {
      classes: "bg-gray-100 text-gray-500 border-gray-200",
      dot: "bg-gray-400",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes fadeUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .fade-up { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,0.1); border-color: #bfdbfe; }
      `}</style>

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Available Providers
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading
                ? "Loading..."
                : `${providers.length} provider${providers.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          /* Skeleton */
          <div className="grid md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-9 bg-gray-100 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-6xl mb-4">👷</span>
            <p className="text-lg font-semibold text-gray-500">
              No providers available
            </p>
            <p className="text-sm mt-1 mb-6">
              No one is currently offering this service
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Browse Other Services
            </button>
          </div>
        ) : (
          <>
            {/* Sort controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Choose Your Provider
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 hidden sm:block">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-400 transition cursor-pointer"
                >
                  <option value="rating">Top Rated</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Provider Cards */}
            <div className="grid md:grid-cols-2 gap-5">
              {sortedProviders.map((p, i) => {
                const avail =
                  availabilityConfig[p.availability] ||
                  availabilityConfig["Not Available"];
                return (
                  <div
                    key={p._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 card-hover fade-up"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-sm relative">
                        {p.name.charAt(0)}
                        {/* Online dot */}
                        {p.availability === "Available Today" && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h3 className="text-base font-bold text-gray-800">
                              {p.name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Professional Service Provider
                            </p>
                          </div>
                          <span
                            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${avail.classes}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${avail.dot}`}
                            />
                            {p.availability}
                          </span>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2.5">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-semibold text-gray-700">
                              {p.rating ?? "N/A"}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({p.reviews ?? 0} reviews)
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs">
                              {p.experience ?? "N/A"} yrs exp
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Phone className="w-3.5 h-3.5" />
                            <span className="text-xs">{p.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price + Book row */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400">Service charge</p>
                        <p className="text-xl font-extrabold text-blue-600">
                          ₹{p.price}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const role = localStorage.getItem("role");
                          if (role !== "customer") {
                            alert("Only customers can book services");
                            return;
                          }
                          navigate(`/customer/book-service?provider=${p._id}`);
                        }}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition active:scale-95 shadow-sm"
                      >
                        Book Now →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
