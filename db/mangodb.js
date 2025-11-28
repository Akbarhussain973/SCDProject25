require('dotenv').config(); // load .env variables
const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected (Using .env)");
    } catch (err) {
        console.error("DB Error:", err.message);
        process.exit(1);
    }
}

module.exports = connectDB;

