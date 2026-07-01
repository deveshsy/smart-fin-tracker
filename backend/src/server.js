/**
 * Smart FinTech Tracker — Backend Server
 * =======================================
 * Slim entry point that wires up configuration, middleware, routes,
 * and error handling. Business logic lives in routes/ and models/.
 *
 * Architecture:
 *   src/config/     — Database and environment configuration
 *   src/models/     — Mongoose schemas and models
 *   src/middleware/  — Auth, validation, and error handling
 *   src/routes/     — Express route handlers
 *   src/utils/      — Shared helper functions
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// ---------- Global Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- API Routes ----------
// Health check endpoint (public, no auth required)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend service is running smoothly'
  });
});

// Authentication routes (register, login, profile)
app.use('/api/auth', authRoutes);

// Transaction CRUD routes (protected)
app.use('/api/transactions', transactionRoutes);

// ---------- Error Handler ----------
// Must be registered AFTER all routes
app.use(errorHandler);

// ---------- Start Server ----------
const server = app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// Export app and server for testing
module.exports = { app, server };
