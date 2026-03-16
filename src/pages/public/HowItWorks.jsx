// frontend/src/pages/public/HowItWorks.jsx
import { useNavigate } from "react-router-dom";
 
const steps = [
  {
    number: "01",
    icon: "🔍",
    title: "Browse Services",
    desc: "Explore our wide range of professional home services — from plumbing and electrical work to cleaning and carpentry.",
    color: "from-blue-500 to-blue-700",
    badge: "Step 1",
  },
  {
    number: "02",
    icon: "🧑‍🔧",
    title: "Choose a Provider",
    desc: "Compare verified providers by ratings, experience, and price. Pick the one that fits your needs and budget.",
    color: "from-indigo-500 to-indigo-700",
    badge: "Step 2",
  },
  {
    number: "03",
    icon: "📅",
    title: "Book Appointment",
    desc: "Select your preferred date, time slot, and enter your service address. Confirmation is instant.",
    color: "from-cyan-500 to-cyan-700",
    badge: "Step 3",
  },
  {
    number: "04",
    icon: "✅",
    title: "Get It Done",
    desc: "Your provider arrives on time and completes the job professionally. Pay securely only after the work is done.",
    color: "from-teal-500 to-teal-700",
    badge: "Step 4",
  },
];
 
const faqs = [
  {
    q: "Are all providers verified?",
    a: "Yes. Every service provider on ConnectEase goes through a background check and identity verification before being listed on our platform.",
  },
  {
    q: "When do I pay?",
    a: "You only pay after the service is completed. Payment is processed securely through Razorpay — we support UPI, cards, and net banking.",
  },
  {
    q: "Can I reschedule or cancel?",
    a: "Absolutely. You can reschedule or cancel any pending booking from your dashboard with no hassle.",
  },
  {
    q: "What if I'm unhappy with the service?",
    a: "Contact our support team. We'll work with you and the provider to resolve the issue, and refunds are available where applicable.",
  },
];
 
export default function HowItWorks() {
  const navigate = useNavigate();
 
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes fadeUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .connector { position: relative; }
        .connector::after {
          content: '';
          position: absolute;
          top: 50%;
          right: -20px;
          width: 40px;
          height: 2px;
          background: linear-gradient(to right, #3b82f6, #818cf8);
          transform: translateY(-50%);
        }
        @media (max-width: 768px) { .connector::after { display: none; } }
        details summary { cursor: pointer; list-style: none; }
        details summary::-webkit-details-marker { display: none; }
        details[open] .arrow { transform: rotate(180deg); }
        .arrow { transition: transform 0.3s ease; }
      `}</style>
 
      {/* Navbar */}
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
            onClick={() => navigate("/signup")}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </button>
        </div>
      </nav>
 
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/30">
            ⚡ Simple 4-Step Process
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            How ConnectEase Works
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            From browsing to booking — get professional home services done in minutes. Here's how simple it is.
          </p>
        </div>
      </div>
 
      {/* Steps */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`connector bg-white rounded-2xl shadow-md p-6 border border-gray-100 fade-up text-center relative overflow-hidden`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Step number watermark */}
              <div className="absolute top-2 right-3 text-7xl font-black text-gray-50 select-none leading-none">
                {step.number}
              </div>
 
              <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-md`}>
                {step.icon}
              </div>
              <span className="inline-block text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">
                {step.badge}
              </span>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
 
        {/* Flow Diagram (visual) */}
        <div className="mt-16 bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-8">Your Journey on ConnectEase</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
            {[
              { icon: "🏠", label: "You", sub: "Need a service" },
              { icon: "→", label: "", sub: "", arrow: true },
              { icon: "📱", label: "ConnectEase", sub: "Matches you" },
              { icon: "→", label: "", sub: "", arrow: true },
              { icon: "👷", label: "Provider", sub: "Visits your home" },
              { icon: "→", label: "", sub: "", arrow: true },
              { icon: "💳", label: "Pay", sub: "After completion" },
              { icon: "→", label: "", sub: "", arrow: true },
              { icon: "⭐", label: "Review", sub: "Help others" },
            ].map((item, i) =>
              item.arrow ? (
                <div key={i} className="text-blue-300 text-2xl hidden md:block">→</div>
              ) : (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-2xl border-2 border-blue-100">
                    {item.icon}
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                  <p className="text-gray-400 text-xs">{item.sub}</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
 
      {/* Trust Features */}
      <div className="bg-blue-600 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white text-2xl font-bold text-center mb-10">Why Trust ConnectEase?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: "🛡️", title: "Verified Professionals", desc: "Every provider is background-checked and identity-verified." },
              { icon: "💳", title: "Pay After Service", desc: "Money only leaves your account once the job is done." },
              { icon: "⭐", title: "Real Reviews", desc: "Ratings from actual customers — no fake reviews." },
              { icon: "📞", title: "24/7 Support", desc: "We're here if anything goes wrong. Always." },
              { icon: "🔄", title: "Easy Rescheduling", desc: "Life happens. Change your appointment any time." },
              { icon: "⚡", title: "Quick Booking", desc: "From browsing to confirmed booking in under 2 minutes." },
            ].map((f, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20 text-white">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-blue-100 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 group">
              <summary className="flex items-center justify-between p-5 font-semibold text-gray-800">
                {faq.q}
                <span className="arrow text-blue-500 text-xl ml-4">▾</span>
              </summary>
              <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
 
      {/* CTA */}
      <div className="bg-gray-900 text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">Join thousands of happy customers who trust ConnectEase every day.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition active:scale-95"
            >
              Book a Service
            </button>
            <button
              onClick={() => navigate("/services")}
              className="border border-gray-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition active:scale-95"
            >
              Browse Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}