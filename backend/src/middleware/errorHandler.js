/**
 * Error Handling Middleware
 * ------------------------
 * Centralized error handler for the Express application.
 * Catches all errors thrown in route handlers and returns a
 * consistent JSON error response. Prevents stack traces from
 * leaking to clients in production.
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code was set on the error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    // Only include stack trace in development for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
