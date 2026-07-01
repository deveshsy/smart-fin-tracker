/**
 * Database Configuration
 * ----------------------
 * Handles MongoDB connection using Mongoose.
 * Encapsulates connection logic so it can be imported and called
 * from the main server entry point or test setup.
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-fin-tracker');
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
