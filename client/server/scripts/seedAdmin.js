const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Admin@123";

const seedAdmin = async ({ disconnectAfter = false } = {}) => {
    try {
        await connectDB();

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

        if (existingAdmin) {
            console.log("ℹ️ Admin user already exists.");
            return existingAdmin;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        const admin = await User.create({
            name: "Admin",
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: "admin",
        });

        console.log("✅ Admin user created successfully.");
        console.log(`Email: ${admin.email}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);

        return admin;
    } catch (error) {
        console.error("❌ Admin seeding failed:", error.message);
        throw error;
    } finally {
        if (disconnectAfter) {
            await mongoose.disconnect();
        }
    }
};

if (require.main === module) {
    seedAdmin({ disconnectAfter: true })
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = seedAdmin;
