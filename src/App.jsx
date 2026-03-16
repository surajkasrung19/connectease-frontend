//frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import HomePage from "./pages/HomePage";
import Signup from "./pages/auth/Signup";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ServiceBooking from "./pages/customer/ServiceBooking";
import CustomerBookings from "./pages/customer/CustomerBookings";
import CustomerProfile from "./pages/customer/CustomerProfile";
import PendingJobs from "./pages/provider/PendingJobs";
import CompletedJobs from "./pages/provider/CompletedJobs";
import ProviderProfile from "./pages/provider/ProviderProfile";
import ProviderEarnings from "./pages/provider/ProviderEarnings";
import PayNow from "./pages/customer/PayNow";
import CustomerPayments from "./pages/customer/CustomerPayments";
import ProtectedRoute from "./routes/ProtectedRoute";
import Feedback from "./pages/customer/Feedback";
import ServiceProviders from "./pages/customer/ServiceProviders";
import Services from "./pages/public/Services";
import HowItWorks from "./pages/public/HowItWorks";
import ProviderRegister from "./pages/public/ProviderRegister";
import Support from "./pages/public/Support";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/book-service"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <ServiceBooking />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/bookings"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerBookings />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerProfile />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/pending-jobs"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <PendingJobs />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/completed-jobs"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <CompletedJobs />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/profile"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <ProviderProfile />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/earnings"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <ProviderEarnings />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/pay/:appointmentId"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <PayNow />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/payments"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerPayments />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/feedback/:appointmentId"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Feedback />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/:serviceId/providers"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <ServiceProviders />
            </ProtectedRoute>
          }
        />
        <Route path="/services" element={<Services />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/provider/register" element={<ProviderRegister />} />
        <Route path="/support" element={<Support />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
