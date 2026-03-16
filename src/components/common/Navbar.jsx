// frontend/src/components/common/Navbar.jsx
import { useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDashboard = () => {
    if (role === "customer") navigate("/customer/dashboard");
    else if (role === "provider") navigate("/provider/dashboard");
    else if (role === "admin") navigate("/admin/dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur shadow-sm"
          : "bg-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          ConnectEase
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink
            to="/services"
            className={({ isActive }) => 
            isActive 
            ? "text-blue-600"
            : "text-gray-700 hover:text-blue-600 transition"
            }
          >
            Services
          </NavLink>

          <NavLink
            to="/how-it-works"
            className={({ isActive }) => 
            isActive 
            ? "text-blue-600"
            : "text-gray-700 hover:text-blue-600 transition"
            }
          >
            How it works
          </NavLink>

          <NavLink
            to="/provider/register"
            className={({ isActive }) => 
            isActive 
            ? "text-blue-600"
            : "text-gray-700 hover:text-blue-600 transition"
            }
          >
            Become a Provider
          </NavLink>

          <NavLink
            to="/support"
            className={({ isActive }) => 
            isActive 
            ? "text-blue-600"
            : "text-gray-700 hover:text-blue-600 transition"
            }
          >
            Support
          </NavLink>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {token ? (
            <>
              <button
                onClick={handleDashboard}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
              >
                Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-gray-700 hover:text-blue-600 transition"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition active:scale-95"
              >
                Book Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
