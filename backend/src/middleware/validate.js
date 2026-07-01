/**
 * Input Validation Middleware
 * --------------------------
 * Uses express-validator to define reusable validation chains
 * for request body fields. Each exported array is intended to be
 * spread into a route's middleware stack. A shared `handleValidationErrors`
 * middleware checks for validation results and returns 400 on failure.
 */
const { body, validationResult } = require('express-validator');

/**
 * Checks for validation errors and sends a 400 response if any exist.
 * This should be placed AFTER the validation chains in the middleware stack.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array().map((e) => e.msg).join(', ')));
  }
  next();
};

/**
 * Validation rules for creating/updating a transaction.
 */
const validateTransaction = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  handleValidationErrors
];

/**
 * Validation rules for user registration.
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

/**
 * Validation rules for user login.
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

module.exports = {
  validateTransaction,
  validateRegister,
  validateLogin
};
