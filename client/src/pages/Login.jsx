import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaHospitalSymbol,
  FaLock,
  FaEnvelope,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaBoxes,
  FaChartLine,
  FaPills,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { loginUser } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter both email address and password.");
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser(email.trim(), password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(`Welcome back, ${data.user?.name || "Admin"}!`);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid credentials. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />

      {/* Subtle Background Lighting Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Spacious Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-6xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-950/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px] relative z-10"
      >
        {/* Left Column: Premium Dark Hero Showcase (7 Columns) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-10 sm:p-14 lg:p-16 text-white flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="relative z-10 space-y-8">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white text-3xl shadow-lg shadow-blue-500/30">
                <FaHospitalSymbol />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-normal flex items-center gap-2.5">
                  MediStock <span className="text-xs px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 font-bold border border-blue-400/30">PRO</span>
                </h1>
                <p className="text-base text-slate-300 font-medium mt-1">
                  Enterprise Pharmacy Management System
                </p>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-4 pt-4">
              <h2 className="text-4xl lg:text-5xl font-black leading-tight text-white tracking-normal">
                Complete Pharmacy <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
                  Inventory & Billing Control
                </span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed font-normal max-w-xl">
                Real-time multi-batch stock tracking, automated reorder alerts, POS counter billing, and executive analytics in one cloud portal.
              </p>
            </div>

            {/* Feature Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                { icon: <FaBoxes className="text-blue-400 text-xl" />, title: "Reorder Alerts", desc: "Automated low stock warnings" },
                { icon: <FaChartLine className="text-emerald-400 text-xl" />, title: "Sales Analytics", desc: "Real-time revenue audits" },
                { icon: <FaPills className="text-sky-400 text-xl" />, title: "Batch Tracking", desc: "Expiry dates & SKU logs" },
                { icon: <FaCheckCircle className="text-indigo-400 text-xl" />, title: "POS Counter Billing", desc: "Print tax receipts instantly" },
              ].map((feat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3.5 hover:bg-white/10 transition duration-200">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex-shrink-0">
                    {feat.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white leading-tight">{feat.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Version Footer */}
          <div className="relative z-10 pt-8 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400 font-medium mt-8">
            <span className="flex items-center gap-2">
              <FaShieldAlt className="text-emerald-400 text-base" />
              256-Bit SSL Encrypted Enterprise Portal
            </span>
            <span>MediStock Pro &bull; v2.4</span>
          </div>
        </div>

        {/* Right Column: Clean White Form (5 Columns) */}
        <div className="lg:col-span-5 p-10 sm:p-14 bg-white flex flex-col justify-center">
          <div className="w-full space-y-8">
            {/* Title Header */}
            <div className="space-y-2">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-normal">
                Sign In
              </h3>
              <p className="text-base text-slate-600 font-medium">
                Enter your account credentials to access your pharmacy dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-base font-bold text-slate-800">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400 text-xl">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 rounded-2xl bg-slate-50 border-2 border-slate-300 pl-12 pr-4 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 font-semibold"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-base font-bold text-slate-800">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400 text-xl">
                    <FaLock />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 rounded-2xl bg-slate-50 border-2 border-slate-300 pl-12 pr-12 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4.5 flex items-center text-slate-400 hover:text-slate-700 text-xl transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-base pt-1">
                <label className="flex items-center gap-3 cursor-pointer font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    toast("Please contact your system administrator to reset password.");
                  }}
                  className="font-bold text-blue-600 hover:text-blue-700 transition hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-lg shadow-xl shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <FaSpinner className="animate-spin text-xl" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <FaArrowRight className="text-base" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Copyright Note */}
            <p className="text-center text-xs text-slate-400 font-medium pt-4 border-t border-slate-100">
              MediStock Pro &bull; Official Pharmacy Management System
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
