const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =========================
// Register User
// =========================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,

        message: "Email already registered",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,

      email,

      password: hashedPassword,

      role: role || "staff",
    });

    res.status(201).json({
      success: true,

      message: "User Registered Successfully",

      data: {
        id: user._id,

        name: user.name,

        email: user.email,

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
// Login User
// =========================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check User
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,

        message: "User not found",
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

    // JWT Token
    const token = jwt.sign(
      {
        id: user._id,

        role: user.role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      success: true,

      message: "Login Successful",

      token,

      user: {
        id: user._id,

        name: user.name,

        email: user.email,

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
// Export
// =========================

module.exports = {
  registerUser,

  loginUser,
};
