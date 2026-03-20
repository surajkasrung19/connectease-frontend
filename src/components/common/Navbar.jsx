// frontend/src/components/common/Navbar.jsx
import { useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate  = useNavigate();
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  // Close menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (window.scrollY > 20) setMenuOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleDashboard = () => {
    setMenuOpen(false);
    if (role === "customer") navigate("/customer/dashboard");
    else if (role === "provider") navigate("/provider/dashboard");
    else if (role === "admin") navigate("/admin/dashboard");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.clear();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-600 transition";

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive
        ? "bg-blue-50 text-blue-600"
        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
    }`;

  return (
    <>
      {/* ── Main navbar bar ── */}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur shadow-sm" : "bg-white"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* Logo */}
          <div
            className="text-2xl font-bold text-blue-600 cursor-pointer flex-shrink-0"
            onClick={() => { setMenuOpen(false); navigate("/"); }}
          >
            ConnectEase
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <NavLink to="/services"          className={navLinkClass}>Services</NavLink>
            <NavLink to="/how-it-works"      className={navLinkClass}>How it works</NavLink>
            <NavLink to="/provider/register" className={navLinkClass}>Become a Provider</NavLink>
            <NavLink to="/support"           className={navLinkClass}>Support</NavLink>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-3">
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

          {/* Mobile right side — action + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {/* Show Book Now / Dashboard as compact button on mobile */}
            {token ? (
              <button
                onClick={handleDashboard}
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate("/signup")}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition active:scale-95"
              >
                Book Now
              </button>
            )}

            {/* Hamburger button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                /* X icon */
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              ) : (
                /* Hamburger icon */
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer — slides down below navbar ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white border-t border-gray-100 px-4 py-4 space-y-1 shadow-lg">

            {/* Nav links */}
            <NavLink to="/services"          className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
              🛠️ Services
            </NavLink>
            <NavLink to="/how-it-works"      className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
              💡 How it works
            </NavLink>
            <NavLink to="/provider/register" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
              👷 Become a Provider
            </NavLink>
            <NavLink to="/support"           className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
              🎧 Support
            </NavLink>

            {/* Divider */}
            <div className="border-t border-gray-100 my-2" />

            {/* Auth actions */}
            {token ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Logout
              </button>
            ) : (
              <button
                onClick={() => { setMenuOpen(false); navigate("/login"); }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop overlay when menu is open */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
