const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// In-memory OTP Store for quick lookup (Phone -> { code, expiresAt })
const otpStore = new Map();

// Helper to generate JWT Token
const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET || "medistock_jwt_secret_key_2026";
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "7d",
    }
  );
};

// Helper function to send Real Mobile SMS via Gateway (Fast2SMS / Twilio)
const sendRealSms = async (phone, otpCode) => {
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  // Option A: Fast2SMS Gateway (popular in India)
  if (fast2smsKey) {
    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables_values: otpCode,
          route: "otp",
          numbers: phone,
        }),
      });
      const data = await response.json();
      if (response.ok && data.return) {
        console.log(`✅ [REAL SMS SENT via Fast2SMS] to +91${phone}`);
        return true;
      }
      console.error("❌ Fast2SMS delivery error:", data);
    } catch (err) {
      console.error("❌ Fast2SMS error:", err.message);
    }
  }

  // Option B: Twilio SMS Gateway
  if (twilioSid && twilioAuthToken && twilioPhone) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString("base64");
      const params = new URLSearchParams();
      params.append("To", `+91${phone}`);
      params.append("From", twilioPhone);
      params.append("Body", `Your MediStock Pro verification OTP is: ${otpCode}`);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );
      const data = await response.json();
      if (response.ok && !data.error_code) {
        console.log(`✅ [REAL SMS SENT via Twilio] to +91${phone}`);
        return true;
      }
      console.error("❌ Twilio error response:", data);
    } catch (err) {
      console.error("❌ Twilio SMS delivery error:", err.message);
    }
  }

  return false;
};

// =========================
// Send OTP Controller
// =========================
const sendOtp = async (req, res) => {
  try {
    const { phone, type = "register" } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);

    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ phone: cleanPhone }, { phone: `+91${cleanPhone}` }],
    });

    if (type === "login" && !existingUser) {
      return res.status(404).json({
        success: false,
        message: "No registered account found with this phone number. Please register first.",
      });
    }

    if (type === "register" && existingUser) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already registered. Please sign in instead.",
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in-memory
    otpStore.set(cleanPhone, { code: otpCode, expiresAt });

    // Also store on User model if user exists
    if (existingUser) {
      existingUser.otp = { code: otpCode, expiresAt: new Date(expiresAt) };
      await existingUser.save();
    }

    // Attempt real SMS send if API key is provided
    const realSmsSent = await sendRealSms(cleanPhone, otpCode);

    console.log(`📱 [OTP GENERATED] To: ${cleanPhone} | Code: ${otpCode} | Real SMS Sent: ${realSmsSent}`);

    res.status(200).json({
      success: true,
      message: realSmsSent
        ? `OTP SMS sent successfully to +91 ${cleanPhone}`
        : `OTP sent to +91 ${cleanPhone}`,
      realSmsSent,
      otp: otpCode, // Included for development/testing demonstration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// Verify OTP Login Controller
// =========================
const verifyOtpLogin = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP code are required",
      });
    }

    const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
    const cleanOtp = String(otp).trim();

    // Check store
    const storedOtpData = otpStore.get(cleanPhone);

    const user = await User.findOne({
      $or: [{ phone: cleanPhone }, { phone: `+91${cleanPhone}` }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this phone number",
      });
    }

    const isValidInStore = storedOtpData && storedOtpData.code === cleanOtp && storedOtpData.expiresAt > Date.now();
    const isValidInUser = user.otp && user.otp.code === cleanOtp && new Date(user.otp.expiresAt).getTime() > Date.now();

    if (!isValidInStore && !isValidInUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP code. Please request a new OTP.",
      });
    }

    // Clear OTP
    otpStore.delete(cleanPhone);
    user.otp = { code: null, expiresAt: null };
    user.isPhoneVerified = true;
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful via OTP",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// Register User with OTP
// =========================
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, otp } = req.body;
    const cleanEmail = email ? String(email).toLowerCase().trim() : "";
    const cleanPhone = phone ? String(phone).replace(/\D/g, "").slice(-10) : "";

    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Valid 10-digit Phone Number is required for registration",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP code is required to complete registration",
      });
    }

    // Verify OTP
    const cleanOtp = String(otp).trim();
    const storedOtpData = otpStore.get(cleanPhone);

    if (!storedOtpData || storedOtpData.code !== cleanOtp || storedOtpData.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please click 'Send OTP' again.",
      });
    }

    // Check if email or phone already exists
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === cleanEmail ? "Email already registered" : "Phone number already registered",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role: role || "staff",
      isPhoneVerified: true,
    });

    // Clear stored OTP
    otpStore.delete(cleanPhone);

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered and phone verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// Login User (Email / Password or Phone / Password)
// =========================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanInput = email ? String(email).trim() : "";

    let query = {};
    if (cleanInput.includes("@")) {
      query = { email: cleanInput.toLowerCase() };
    } else {
      const cleanPhone = cleanInput.replace(/\D/g, "").slice(-10);
      query = { $or: [{ email: cleanInput.toLowerCase() }, { phone: cleanPhone }] };
    }

    // Check User
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// Exports
// =========================
module.exports = {
  sendOtp,
  verifyOtpLogin,
  registerUser,
  loginUser,
};
