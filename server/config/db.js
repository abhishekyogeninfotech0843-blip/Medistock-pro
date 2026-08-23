const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/MediStock";
    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ MongoDB Connection Error");

    console.log(error.message);

    process.exit(1);
  }
};

module.exports = connectDB;

