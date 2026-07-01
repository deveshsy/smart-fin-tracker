/**
 * Transaction Model
 * -----------------
 * Mongoose schema and model for financial transactions.
 * Each transaction belongs to a user (referenced by ObjectId).
 * Supports ML-predicted categories via the `predicted` flag.
 */
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Reference to the user who owns this transaction
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Flag indicating whether the category was auto-predicted by the ML service
  predicted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
