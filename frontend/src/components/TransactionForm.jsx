/**
 * TransactionForm — Form for adding new transactions.
 * Supports optional AI-powered category classification
 * when the category field is left blank.
 */
import React, { useState } from 'react';
import { PlusCircle, Brain, RefreshCw } from 'lucide-react';
import { transactionsAPI } from '../services/api';

export default function TransactionForm({ onTransactionAdded }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        description: description.trim(),
        amount: parseFloat(amount),
        type,
      };

      // Only send explicit category if user typed one
      if (category.trim()) {
        payload.category = category.trim();
      }

      const res = await transactionsAPI.create(payload);
      onTransactionAdded(res.data);

      // Reset form
      setDescription('');
      setAmount('');
      setCategory('');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to add transaction';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
      <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
        <PlusCircle className="w-5 h-5 mr-2 text-indigo-400" />
        Add Transaction
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/50 rounded-xl text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Description
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Starbucks, Gas, Salary"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Category <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-purple-400 flex items-center">
              <Brain className="w-3.5 h-3.5 mr-0.5" />
              Leave blank for AI classification
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g. Food & Dining, Utilities"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <RefreshCw className="animate-spin w-4 h-4 mr-2" />
              Classifying & saving...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Save Transaction
            </>
          )}
        </button>
      </form>
    </div>
  );
}
