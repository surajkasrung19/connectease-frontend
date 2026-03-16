// frontend/src/pages/public/Support.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

const faqs = [
  {
    category: "Bookings",
    icon: "📅",
    questions: [
      { q: "How do I cancel a booking?", a: "Go to My Bookings in your dashboard and click Cancel on any pending booking. Cancellations are only allowed before the provider accepts the request." },
      { q: "Can I reschedule my appointment?", a: "Yes! Open My Bookings, select your booking, and click Reschedule to pick a new date and time." },
      { q: "How long does it take to confirm a booking?", a: "Most bookings are confirmed by the provider within 1–2 hours of placing the request." },
    ],
  },
  {
    category: "Payments",
    icon: "💳",
    questions: [
      { q: "When do I need to pay?", a: "Payment is only required after the service is marked as completed by your provider." },
      { q: "What payment methods are accepted?", a: "We accept all major UPI apps, credit/debit cards, and net banking through our Razorpay integration." },
      { q: "Can I get a refund?", a: "Refunds are processed within 5–7 business days for eligible cases. Contact us to raise a refund request." },
    ],
  },
  {
    category: "Account",
    icon: "👤",
    questions: [
      { q: "How do I update my profile?", a: "Visit your Profile page from the dashboard and click Edit to update your name, phone, or address." },
      { q: "I forgot my password. What should I do?", a: "Click the 'Forgot password?' link on the Login page and we will send a reset link to your email." },
      { q: "How do I become a service provider?", a: "Click on 'Become a Provider' in the navigation bar and complete the registration form." },
    ],
  },
];

const contactMethods = [
  {
    icon: "📧",
    title: "Email Support",
    detail: "supportconnectease@gmail.com",
    sub: "We reply within 24 hours",
    bg: "from-blue-500 to-blue-700",
  },
  {
    icon: "📞",
    title: "Phone Support",
    detail: "+91 98765 43210",
    sub: "Mon–Sat, 9 AM – 6 PM IST",
    bg: "from-indigo-500 to-indigo-700",
  },
  {
    icon: "🕒",
    title: "Working Hours",
    detail: "Mon – Sat",
    sub: "9:00 AM – 6:00 PM IST",
    bg: "from-teal-500 to-teal-700",
  },
];

const subjectOptions = [
  "Select a topic",
  "Booking Issue",
  "Payment Problem",
  "Provider Complaint",
  "Account Help",
  "Refund Request",
  "Other",
];

export default function Support() {
  const navigate = useNavigate();

  // Form state
  const [form, setForm]         = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState("");

  // FAQ accordion
  const [openFaq, setOpenFaq]   = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSending(true);
      await API.post("/support/contact", {
        name:    form.name.trim(),
        email:   form.email.trim(),
        subject: form.subject !== "Select a topic" ? form.subject : "",
        message: form.message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to send your message. Please try again or email us directly."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        details summary { cursor: pointer; list-style: none; }
        details summary::-webkit-details-marker { display: none; }
        .faq-arrow { transition: transform 0.25s ease; }
        details[open] .faq-arrow { transform: rotate(180deg); }
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.12); }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/homepage")}
            className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </button>
          <span className="text-xl font-bold text-blue-600">ConnectEase</span>
          <button
            onClick={() => navigate("/login")}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            My Account
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-white blur-3xl"/>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white blur-3xl"/>
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🎧</div>
          <h1 className="text-4xl font-extrabold mb-3">Support Center</h1>
          <p className="text-blue-100 text-base max-w-xl mx-auto">
            Have a question or issue? Send us a message and our team will get back to you within 24 hours.
          </p>
        </div>
      </div>

      {/* Contact Method Cards */}
      <div className="max-w-5xl mx-auto px-4 -mt-7 relative z-10">
        <div className="grid md:grid-cols-3 gap-4">
          {contactMethods.map((m, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${m.bg} text-white rounded-2xl p-5 shadow-lg card-hover`}
            >
              <div className="text-3xl mb-2">{m.icon}</div>
              <h3 className="font-bold text-base mb-1">{m.title}</h3>
              <p className="font-semibold text-sm text-white/90">{m.detail}</p>
              <p className="text-white/70 text-xs mt-1">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-2 gap-10">

        {/* ── Contact Form ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">

          {submitted ? (
            /* Success state */
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h2>
              <p className="text-sm text-gray-500 mb-1">
                Thanks for reaching out, <span className="font-semibold text-gray-700">{form.name}</span>.
              </p>
              <p className="text-sm text-gray-500 mb-1">
                We've sent a confirmation to <span className="font-semibold text-blue-600">{form.email}</span>.
              </p>
              <p className="text-xs text-gray-400 mt-3 mb-7">
                Our team will reply within <span className="font-semibold text-gray-500">24 hours</span> on working days.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", subject: "", message: "" });
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition active:scale-95"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Send Us a Message</h2>
              <p className="text-sm text-gray-400 mb-6">
                Fill in the form below and we'll get back to you as soon as possible.
              </p>

              {/* Error banner */}
              {error && (
                <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm transition"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white transition"
                  >
                    {subjectOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe your issue in detail — the more information you give, the faster we can help you."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none transition"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {form.message.length} characters
                  </p>
                </div>

                {/* Note about email */}
                <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <span className="text-base mt-0.5">📧</span>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    Your message will be sent directly to our support team at{" "}
                    <span className="font-semibold">supportconnectease@gmail.com</span>.
                    You will also receive a confirmation email.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Sending...
                    </span>
                  ) : "Send Message →"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* ── FAQ ── */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {faqs.map((cat, ci) => (
              <div key={ci} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Category header */}
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-bold text-sm text-gray-700">{cat.category}</span>
                </div>

                {/* Questions */}
                <div className="divide-y divide-gray-50">
                  {cat.questions.map((qa, qi) => {
                    const key = `${ci}-${qi}`;
                    return (
                      <details key={qi}>
                        <summary className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
                          <span className="text-sm font-semibold text-gray-800 pr-4">{qa.q}</span>
                          <span className="faq-arrow text-blue-500 text-lg flex-shrink-0">▾</span>
                        </summary>
                        <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed bg-blue-50/30 border-t border-gray-50">
                          {qa.a}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Support hours card */}
          <div className="mt-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <span>🕒</span> Support Hours
            </h3>
            <div className="space-y-2.5 text-sm">
              {[
                { day: "Monday – Friday", hours: "9:00 AM – 7:00 PM IST" },
                { day: "Saturday",        hours: "9:00 AM – 5:00 PM IST" },
                { day: "Sunday",          hours: "Email support only"     },
              ].map((h, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-blue-100">{h.day}</span>
                  <span className="font-semibold text-white">{h.hours}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/20">
              <p className="text-xs text-blue-200">
                For urgent issues, email us directly at{" "}
                <span className="font-semibold text-white">supportconnectease@gmail.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}