import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
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
  FaUser,
  FaUserShield,
  FaPhone,
  FaKey,
  FaPaperPlane,
  FaMobileAlt,
} from "react-icons/fa";
import {
  loginUser,
  registerUser,
  sendOtp,
  verifyOtpLogin,
} from "../services/authService";

const Login = () => {
  const navigate = useNavigate();

  // Mode States
  const [isRegister, setIsRegister] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email"); // "email" | "phone"

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [otp, setOtp] = useState("");

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");

  // Visual / UI States
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clean phone helper
  const getCleanPhone = (val) => String(val || "").replace(/\D/g, "").slice(-10);

  // Send OTP Action
  const handleSendOtp = async (type = isRegister ? "register" : "login") => {
    const cleanNum = getCleanPhone(phone);
    if (!cleanNum || cleanNum.length < 10) {
      toast.error("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    try {
      setSendingOtp(true);
      const res = await sendOtp(cleanNum, type);
      setOtpSent(true);
      if (res.otp) {
        setDemoOtp(res.otp);
      }
      toast.success(
        res.otp
          ? `OTP sent to +91 ${cleanNum}! Demo Code: ${res.otp}`
          : res.message || `OTP sent to +91 ${cleanNum}`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to send OTP. Please check your phone number."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  // Standard Login (Email & Password)
  const handleEmailLogin = async (e) => {
    e?.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter both Email/Phone and Password.");
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser(email.trim(), password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(`Welcome back, ${data.user?.name || "User"}!`);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Sign In
  const handlePhoneOtpLogin = async (e) => {
    e?.preventDefault();

    const cleanNum = getCleanPhone(phone);
    if (!cleanNum || cleanNum.length < 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!otpSent) {
      toast.error("Please click 'Send OTP' first.");
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      toast.error("Please enter the 6-digit OTP code sent to your phone.");
      return;
    }

    try {
      setLoading(true);
      const data = await verifyOtpLogin(cleanNum, otp.trim());

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(`Welcome back, ${data.user?.name || "User"}!`);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "OTP Verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // Register User (Requires Name, Email, Phone, Password, Role, OTP)
  const handleRegister = async (e) => {
    e?.preventDefault();

    const cleanNum = getCleanPhone(phone);

    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in Name, Email address, and Password.");
      return;
    }

    if (!cleanNum || cleanNum.length < 10) {
      toast.error("Please enter a valid 10-digit Mobile Phone Number.");
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long.");
      return;
    }

    if (!otpSent) {
      toast.error("Please click 'Send OTP' to verify your phone number before creating an account.");
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      toast.error("Please enter the 6-digit OTP code sent to your mobile number.");
      return;
    }

    try {
      setLoading(true);
      const data = await registerUser(
        name.trim(),
        email.trim(),
        cleanNum,
        password,
        role,
        otp.trim()
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Phone verified & Account created successfully!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Registration failed. Please check your inputs and OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (registerTab) => {
    setIsRegister(registerTab);
    setOtpSent(false);
    setOtp("");
    setDemoOtp("");
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* Subtle Background Lighting Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Spacious Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-6xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-950/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px] relative z-10"
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
                Real-time multi-batch stock tracking, automated reorder alerts, POS counter billing, and phone number OTP verified authentication.
              </p>
            </div>

            {/* Feature Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                { icon: <FaBoxes className="text-blue-400 text-xl" />, title: "Reorder Alerts", desc: "Automated low stock warnings" },
                { icon: <FaChartLine className="text-emerald-400 text-xl" />, title: "Sales Analytics", desc: "Real-time revenue audits" },
                { icon: <FaMobileAlt className="text-sky-400 text-xl" />, title: "Phone OTP Security", desc: "Mobile OTP user login & sign up" },
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

        {/* Right Column: Dynamic Auth Form (5 Columns) */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-white flex flex-col justify-center overflow-y-auto">
          <div className="w-full space-y-5">

            {/* Main Tabs: Sign In / Create Account */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleTabChange(false)}
                className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition ${
                  !isRegister
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange(true)}
                className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition ${
                  isRegister
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Title Header */}
            <div className="space-y-1">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-normal">
                {isRegister ? "Create Account" : "Sign In"}
              </h3>
              <p className="text-sm text-slate-600 font-medium">
                {isRegister
                  ? "Register with your phone number & verify via 6-digit OTP."
                  : "Sign in with your phone number OTP or account credentials."}
              </p>
            </div>

            {/* Sign In Method Selector (Login Only) */}
            {!isRegister && (
              <div className="flex border-b border-slate-200 pb-1 gap-4 text-sm font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("email");
                    setOtpSent(false);
                  }}
                  className={`pb-2 transition border-b-2 ${
                    loginMethod === "email"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Email / Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("phone");
                    setOtpSent(false);
                  }}
                  className={`pb-2 transition border-b-2 flex items-center gap-1.5 ${
                    loginMethod === "phone"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <FaPhone className="text-xs" /> Phone OTP Sign In
                </button>
              </div>
            )}

            {/* FORM SECTION */}
            <AnimatePresence mode="wait">
              {/* ======================================================== */}
              {/* REGISTER FORM */}
              {/* ======================================================== */}
              {isRegister ? (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleRegister}
                  className="space-y-3.5"
                >
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-base">
                        <FaUser />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Abhishek Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full h-11 rounded-xl bg-slate-50 border border-slate-300 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-base">
                        <FaEnvelope />
                      </div>
                      <input
                        type="email"
                        placeholder="admin@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-11 rounded-xl bg-slate-50 border border-slate-300 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Phone Number & Send OTP Button */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>Phone Number (for OTP)</span>
                      {otpSent && (
                        <span className="text-emerald-600 text-xs font-extrabold flex items-center gap-1">
                          <FaCheckCircle /> OTP Sent
                        </span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-base">
                          <FaPhone />
                        </div>
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (otpSent) setOtpSent(false);
                          }}
                          required
                          className="w-full h-11 rounded-xl bg-slate-50 border border-slate-300 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 font-semibold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSendOtp("register")}
                        disabled={sendingOtp || !getCleanPhone(phone)}
                        className="px-4 h-11 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      >
                        {sendingOtp ? (
                          <FaSpinner className="animate-spin text-sm" />
                        ) : (
                          <>
                            <FaPaperPlane className="text-xs" />
                            <span>{otpSent ? "Resend OTP" : "Send OTP"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 6-Digit OTP Field (Visible when OTP is requested or typed) */}
                  {otpSent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-1 pt-1"
                    >
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider">
                          Enter 6-Digit OTP Code
                        </label>
                        {demoOtp && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-extrabold">
                            Demo Code: {demoOtp}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600 text-base">
                          <FaKey />
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 584920"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          className="w-full h-11 rounded-xl bg-blue-50/60 border-2 border-blue-400 pl-10 pr-4 text-base tracking-widest text-slate-900 placeholder-slate-400 outline-none font-bold"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Password Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-base">
                        <FaLock />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-11 rounded-xl bg-slate-50 border border-slate-300 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 text-base cursor-pointer"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Account Role */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Account Role
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-base">
                        <FaUserShield />
                      </div>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full h-11 rounded-xl bg-slate-50 border border-slate-300 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 font-semibold"
                      >
                        <option value="staff">Staff / Pharmacist</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 cursor-pointer mt-3"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <FaSpinner className="animate-spin text-base" />
                        <span>Verifying OTP & Creating Account...</span>
                      </div>
                    ) : (
                      <>
                        <span>Verify OTP & Create Account</span>
                        <FaArrowRight className="text-xs" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                /* ======================================================== */
                /* LOGIN FORM (EMAIL OR PHONE OTP) */
                /* ======================================================== */
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={loginMethod === "phone" ? handlePhoneOtpLogin : handleEmailLogin}
                  className="space-y-4"
                >
                  {loginMethod === "phone" ? (
                    /* PHONE OTP LOGIN FLOW */
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-800">
                          Registered Phone Number
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-lg">
                              <FaPhone />
                            </div>
                            <input
                              type="tel"
                              placeholder="9876543210"
                              value={phone}
                              onChange={(e) => {
                                setPhone(e.target.value);
                                if (otpSent) setOtpSent(false);
                              }}
                              required
                              className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-300 pl-11 pr-4 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 font-semibold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSendOtp("login")}
                            disabled={sendingOtp || !getCleanPhone(phone)}
                            className="px-4 h-12 bg-slate-900 hover:bg-black disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                          >
                            {sendingOtp ? (
                              <FaSpinner className="animate-spin text-sm" />
                            ) : (
                              <>
                                <FaPaperPlane className="text-xs" />
                                <span>{otpSent ? "Resend OTP" : "Send OTP"}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* OTP Input for Phone Login */}
                      {otpSent && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-blue-700">
                              Enter 6-Digit OTP
                            </label>
                            {demoOtp && (
                              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-extrabold">
                                Demo OTP: {demoOtp}
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-600 text-lg">
                              <FaKey />
                            </div>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="e.g. 584920"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              required
                              className="w-full h-12 rounded-2xl bg-blue-50/70 border-2 border-blue-400 pl-11 pr-4 text-lg tracking-widest text-slate-900 placeholder-slate-400 outline-none font-bold"
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Phone OTP Login Submit */}
                      <button
                        type="submit"
                        disabled={loading || !otpSent}
                        className="w-full h-13 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base shadow-xl shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <FaSpinner className="animate-spin text-lg" />
                            <span>Signing In with OTP...</span>
                          </div>
                        ) : (
                          <>
                            <span>Verify OTP & Sign In</span>
                            <FaArrowRight className="text-sm" />
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    /* EMAIL / PASSWORD LOGIN FLOW */
                    <>
                      {/* Email Input */}
                      <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-800">
                          Email Address or Phone
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-lg">
                            <FaEnvelope />
                          </div>
                          <input
                            type="text"
                            placeholder="admin@gmail.com or 9876543210"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-300 pl-11 pr-4 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 font-semibold"
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-800">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-lg">
                            <FaLock />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-300 pl-11 pr-11 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 text-lg transition-colors cursor-pointer"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me & Forgot Password */}
                      <div className="flex items-center justify-between text-sm pt-1">
                        <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-slate-700 select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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

                      {/* Standard Login Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-13 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base shadow-xl shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-70 cursor-pointer mt-2"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <FaSpinner className="animate-spin text-lg" />
                            <span>Signing In...</span>
                          </div>
                        ) : (
                          <>
                            <span>Sign In to Dashboard</span>
                            <FaArrowRight className="text-sm" />
                          </>
                        )}
                      </button>
                    </>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            {/* Toggle Link */}
            <div className="text-center text-sm font-semibold text-slate-600 pt-2 border-t border-slate-100">
              {isRegister ? (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange(false)}
                    className="font-extrabold text-blue-600 hover:text-blue-700 transition hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  New to MediStock Pro?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange(true)}
                    className="font-extrabold text-blue-600 hover:text-blue-700 transition hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              )}
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-slate-400 font-medium pt-1">
              MediStock Pro &bull; Official Pharmacy Management System
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
