// frontend/src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import API from "../api/axios";

export default function HomePage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);

  const visibleTestimonials = [...testimonials, ...testimonials];

  const serviceImages = {
    plumbing: "/services/plumbing.png",
    carpentry: "/services/carpentry.png",
    painting: "/services/painting.png",
    electrician: "/services/electrician.png",
    cleaning: "/services/cleaning.png",
    gardening: "/services/gardening.png",
  };

  // Small colored emoji icons per service as fallback decoration
  const serviceIcons = {
    plumbing: "🔧",
    carpentry: "🪚",
    painting: "🎨",
    electrician: "⚡",
    cleaning: "🧹",
    gardening: "🌿",
  };

  const features = [
    {
      icon: "🛡️",
      title: "Verified Professionals",
      desc: "All service providers are background-checked and verified",
    },
    {
      icon: "💳",
      title: "Secure Payments",
      desc: "Pay only after service completion with Razorpay Protection",
    },
    {
      icon: "⚡",
      title: "Quick Booking",
      desc: "Book services in under 60 seconds with real-time availability",
    },
    {
      icon: "📞",
      title: "24/7 Support",
      desc: "Dedicated customer support whenever you need help",
    },
  ];

  // Redirect admin directly
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "admin") {
      navigate("/admin/dashboard");
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await API.get("/services");
      setServices(res.data);
    } catch (err) {
      console.error("Error loading services", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await API.get("/feedback/latest");
      setTestimonials(res.data);
    } catch (err) {
      console.error("Error loading testimonials", err);
    }
  };

  const checkLogin = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      navigate("/login");
      return;
    }
    if (role === "customer") navigate("/customer/dashboard");
    else if (role === "provider") navigate("/provider/dashboard");
  };

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= testimonials.length) {
          return 0;
        }
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gray-100 pt-5">
      <style>{`
        @keyframes fadeUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease forwards; }
        .card-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.14);
        }
        .feature-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.09);
          border-color: #bfdbfe;
        }
        .btn-primary {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-primary:hover {
          transform: scale(1.04);
          box-shadow: 0 8px 20px rgba(255,255,255,0.25);
        }
        .btn-primary:active { transform: scale(0.97); }
        .testimonial-card {
          transition: box-shadow 0.25s ease;
        }
        .testimonial-card:hover {
          box-shadow: 0 12px 28px rgba(0,0,0,0.1);
        }
        /* Scrollbar hide for testimonials */
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Navbar />
        </div>
      </nav>

      {/* Hero Section*/}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white pt-28 pb-24">
        {/* Background blobs — slightly more visible */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 text-center">
         
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" />
            Trusted by 50,000+ customers across India
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 animate-fadeIn">
            Trusted Home Services,
            <br className="hidden md:block" />
            <span className="text-yellow-300">Done Right</span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Book verified professionals for plumbing, electrical, cleaning &
            more. Pay only after the job is done.
          </p>

          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-14">
            <button
              onClick={checkLogin}
              className="btn-primary bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-300"
            >
              Book a Service
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="border border-white/70 px-8 py-3 rounded-lg font-semibold text-white hover:bg-white/10 transition-all duration-300 active:scale-95"
            >
              Become a Provider
            </button>
          </div>

       
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: "10k+", label: "Verified Professionals" },
              { value: "50k+", label: "Jobs Completed" },
              { value: "4.8★", label: "Average Rating" },
              { value: "100%", label: "Secure Payments" },
            ].map((stat, i) => (
              <div key={i} className="relative">
                {i > 0 && (
                  <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-white/20" />
                )}
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-blue-100 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Explore Our Services
            </h2>
           
            <div className="w-16 h-1 bg-blue-600 rounded-full mx-auto mb-4" />
            <p className="text-gray-600 max-w-xl mx-auto">
              Choose from trusted professionals across multiple home service
              categories.
            </p>
          </div>
        </div>

        {loading ? (
        
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                  <div className="h-9 bg-gray-200 rounded-lg mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-500">
            No services available right now
          </p>
        ) : (
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {services.map((service, idx) => (
              <div
                key={service._id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-md card-lift"
                style={{
                  animation: `fadeUp 0.6s ease forwards`,
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0,
                }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={
                      serviceImages[service.name.toLowerCase()] ||
                      "/services/default.png"
                    }
                    alt={service.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  {/* Fallback icon if image missing */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center text-6xl"
                    style={{ display: "none" }}
                  >
                    {serviceIcons[service.name.toLowerCase()] || "🛠️"}
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                  {/* Badge */}
                  <span className="absolute top-4 left-4 bg-white text-blue-600 text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Popular
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition">
                    {service.name}
                  </h4>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                        Starting from
                      </p>
                      <span className="text-blue-600 font-bold text-lg">
                        ₹{service.charges}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">per service</span>
                  </div>

                  <button
                    onClick={() => {
                      const token = localStorage.getItem("token");
                      const role = localStorage.getItem("role");
                      if (!token) {
                        navigate("/login", {
                          state: {
                            redirectTo: `/services/${service._id}/providers`,
                          },
                        });
                        return;
                      }
                      if (role === "provider") {
                        alert("You are already a provider");
                        navigate("/provider/dashboard");
                        return;
                      }
                      navigate(`/services/${service._id}/providers`);
                    }}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium transition-all duration-300 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 shadow-sm"
                  >
                    View Providers →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      
      <div className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-3">
            What Our Customers Say
          </h3>
          <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mb-12" />

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${index * 33.33}%)`,
              }}
            >
              {visibleTestimonials.map((t, i) => (
                <div key={i} className="min-w-[33.33%] px-3">
                  <div className="bg-white p-6 rounded-xl testimonial-card border border-gray-100 shadow-sm h-full">
                    {/* Star rating — styled slightly better */}
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(t.rating)].map((_, si) => (
                        <span key={si} className="text-yellow-400 text-lg">
                          ★
                        </span>
                      ))}
                    </div>
                    {/* Quote mark */}
                    <p className="text-gray-600 mb-5 text-sm leading-relaxed">
                      <span className="text-blue-200 text-3xl font-serif leading-none mr-1">
                        "
                      </span>
                      {t.comment}
                      <span className="text-blue-200 text-3xl font-serif leading-none ml-1">
                        "
                      </span>
                    </p>
                    <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
                      {/* Avatar circle */}
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {t.customer?.name?.charAt(0) || "C"}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-800">
                          {t.customer?.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          Verified Customer
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          {testimonials.length > 0 && (
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === i ? "w-6 bg-blue-600" : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Why Choose Us ── same grid, refined cards */}
      <div className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-3">
            Why Choose ConnectEase
          </h3>
          <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mb-10" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-gray-50 p-6 rounded-xl shadow-sm feature-card text-center border border-transparent"
              >
                {/* Icon with subtle bg circle */}
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  {f.icon}
                </div>
                <h4 className="font-bold text-lg mb-2 text-gray-800">
                  {f.title}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── slightly improved */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-blue-400">ConnectEase</p>
              <p className="text-gray-400 text-sm">Local Service Marketplace</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <button
                onClick={() => navigate("/services")}
                className="hover:text-white transition"
              >
                Services
              </button>
              <button
                onClick={() => navigate("/how-it-works")}
                className="hover:text-white transition"
              >
                How It Works
              </button>
              <button
                onClick={() => navigate("/support")}
                className="hover:text-white transition"
              >
                Support
              </button>
            </div>
            <p className="text-gray-500 text-sm">© 2025 ConnectEase</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
