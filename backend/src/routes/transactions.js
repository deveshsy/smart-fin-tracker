/**
 * Transaction Routes
 * ------------------
 * CRUD operations for financial transactions.
 * All routes are protected by JWT authentication.
 * Transactions are scoped to the authenticated user.
 *
 * GET    /api/transactions     - List all transactions for the user
 * POST   /api/transactions     - Create a new transaction (with optional ML categorization)
 * PUT    /api/transactions/:id - Update an existing transaction
 * DELETE /api/transactions/:id - Delete a transaction
 */
const express = require('express');
const axios = require('axios');
const router = express.Router();

const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validate');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// All transaction routes require authentication
router.use(auth);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions for the authenticated user, sorted newest first
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction. If no category is provided, the ML service
 *          is queried to predict one automatically.
 * @access  Private
 */
router.post('/', validateTransaction, async (req, res, next) => {
  try {
    const { description, amount, type } = req.body;
    let { category } = req.body;
    let predicted = false;

    // If category is not provided, try to predict it using the ML service
    if (!category && description) {
      try {
        const mlResponse = await axios.post(
          `${ML_SERVICE_URL}/predict`,
          { description },
          { timeout: 2000 } // 2s timeout — don't block if ML service is down
        );

        if (mlResponse.data && mlResponse.data.category) {
          category = mlResponse.data.category;
          predicted = true;
        }
      } catch (mlErr) {
        // ML service is optional — gracefully fall back to Uncategorized
        category = 'Uncategorized';
      }
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      description,
      amount,
      type,
      category: category || 'Uncategorized',
      predicted
    });

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update a transaction by ID (only if owned by the authenticated user)
 * @access  Private
 */
router.put('/:id', validateTransaction, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      res.status(404);
      return next(new Error('Transaction not found'));
    }

    // Update allowed fields
    transaction.description = req.body.description || transaction.description;
    transaction.amount = req.body.amount || transaction.amount;
    transaction.type = req.body.type || transaction.type;
    transaction.category = req.body.category || transaction.category;

    const updated = await transaction.save();
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a transaction by ID (only if owned by the authenticated user)
 * @access  Private
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      res.status(404);
      return next(new Error('Transaction not found'));
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
