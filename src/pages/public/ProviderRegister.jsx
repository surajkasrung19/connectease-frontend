// frontend/src/pages/public/ProviderRegister.jsx
import { useNavigate } from "react-router-dom";

const perks = [
  { icon: "🚀", title: "Grow Your Reach",    desc: "Get discovered by hundreds of customers in your area looking for exactly your skills.",         color: "from-blue-500 to-blue-700"   },
  { icon: "🗓️", title: "Flexible Schedule",  desc: "You decide when you're available. Accept only the jobs that fit your calendar.",                color: "from-indigo-500 to-indigo-700"},
  { icon: "💰", title: "Earn More",           desc: "Set your own pricing. Our low platform fee ensures you keep most of what you earn.",             color: "from-cyan-500 to-cyan-700"   },
  { icon: "🔒", title: "Secure Payments",     desc: "Get paid directly and on time via Razorpay. No chasing customers for money.",                   color: "from-teal-500 to-teal-700"   },
  { icon: "📊", title: "Track Earnings",      desc: "Your dashboard gives you a clear view of bookings, completed jobs, and total income.",           color: "from-violet-500 to-violet-700"},
  { icon: "⭐", title: "Build Reputation",    desc: "Earn verified reviews from real customers to attract even more business over time.",             color: "from-sky-500 to-sky-700"     },
];

const steps = [
  { step: "1", title: "Create Account",  desc: "Register with your details and select your service category." },
  { step: "2", title: "Get Verified",    desc: "Our team verifies your identity and service credentials."     },
  { step: "3", title: "Accept Jobs",     desc: "Browse incoming bookings and accept ones that suit you."       },
  { step: "4", title: "Earn & Grow",     desc: "Complete jobs, collect reviews, and grow your business."       },
];

const testimonials = [
  { name: "Rajesh K.",  role: "Electrician, Mumbai",       quote: "ConnectEase helped me double my monthly income in just 3 months.", rating: 5, avatar: "R" },
  { name: "Priya M.",   role: "Cleaning Expert, Pune",     quote: "I love setting my own schedule. Payments are always on time.",     rating: 5, avatar: "P" },
  { name: "Suresh T.",  role: "Plumber, Bangalore",        quote: "I get 8-10 new bookings every week. Best platform for my career.", rating: 5, avatar: "S" },
];

export default function ProviderRegister() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        @keyframes fadeUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,0.1); }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/homepage")}
            className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </button>
          <span className="text-xl font-bold text-blue-600">ConnectEase</span>
          <button onClick={() => navigate("/login")}
            className="text-sm text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition">
            Login
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl"/>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl"/>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wide">
              🔥 Join 10,000+ Providers
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
              Turn Your Skills Into a <span className="text-yellow-300">Thriving Business</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Join ConnectEase and start earning from your expertise. Connect with customers, manage bookings, and grow on your own terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* ✅ FIX BUG 14 — Pass defaultRole: "provider" so Signup pre-selects provider */}
              <button
                onClick={() => navigate("/signup", { state: { defaultRole: "provider" } })}
                className="bg-white text-blue-700 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition active:scale-95 shadow-lg text-base"
              >
                Register as Provider →
              </button>
              <button
                onClick={() => navigate("/how-it-works")}
                className="border border-white/50 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition active:scale-95 text-base"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "₹25,000+", label: "Avg Monthly Earnings", icon: "💰" },
              { value: "10k+",     label: "Active Providers",     icon: "👷" },
              { value: "4.8★",     label: "Platform Rating",      icon: "⭐" },
              { value: "50k+",     label: "Jobs Completed",       icon: "✅" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20 fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-2xl font-extrabold text-yellow-300">{stat.value}</p>
                <p className="text-blue-100 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Perks */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Why Join ConnectEase?</h2>
          <p className="text-gray-500 max-w-xl mx-auto">We give you the tools, the customers, and the support to build a successful service business.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map((perk, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={`w-12 h-12 bg-gradient-to-br ${perk.color} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm`}>
                {perk.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{perk.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to Join */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-12">How to Become a Provider</h2>
          <div className="relative">
            <div className="hidden md:block absolute top-10 left-12 right-12 h-0.5 bg-gradient-to-r from-blue-200 to-indigo-200" />
            <div className="grid md:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <div key={i} className="text-center relative">
                  <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center mx-auto mb-4 shadow-md border-2 border-blue-100 relative z-10">
                    <span className="text-2xl font-extrabold text-blue-600">{s.step}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">What Our Providers Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 card-hover">
              <div className="flex gap-0.5 text-yellow-400 mb-4">{"★".repeat(t.rating)}</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">Start Earning Today</h2>
          <p className="text-blue-100 mb-8 text-lg">Registration is free and takes less than 5 minutes.</p>
          {/* ✅ FIX BUG 14 — Also on this CTA button */}
          <button
            onClick={() => navigate("/signup", { state: { defaultRole: "provider" } })}
            className="bg-white text-blue-700 font-bold px-10 py-4 rounded-xl text-lg hover:bg-blue-50 transition active:scale-95 shadow-xl"
          >
            Register as Provider — It's Free →
          </button>
          <p className="mt-4 text-blue-200 text-sm">No hidden fees · No setup cost · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}