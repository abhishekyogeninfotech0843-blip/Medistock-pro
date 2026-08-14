const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtpLogin,
} = require("../controllers/authController");

// OTP routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp-login", verifyOtpLogin);

// Register with OTP
router.post("/register", registerUser);

// Login (Password or Phone)
router.post("/login", loginUser);

module.exports = router;
