/**
 * TransactionList — Scrollable ledger of financial transactions.
 * Displays category badges (with AI-predicted indicators),
 * amounts, dates, and a delete button on hover.
 */
import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Brain, Trash2, RefreshCw } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';

export default function TransactionList({ transactions, loading, onDelete }) {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="animate-spin w-8 h-8 text-indigo-500" />
        <span className="text-sm text-slate-400">Loading your ledger...</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl">
        <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-300 font-semibold">No transactions found</p>
        <p className="text-xs text-slate-500 mt-1">
          Try adjusting your filters or add a new transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1 scrollbar-thin">
      {transactions.map((t) => (
        <div
          key={t._id}
          className="flex items-center justify-between p-4 bg-slate-950/60 hover:bg-slate-950 border border-slate-900 hover:border-slate-800/60 rounded-xl transition-all duration-150 group"
        >
          {/* Left: Icon + Description + Badges */}
          <div className="flex items-center space-x-3 min-w-0">
            <div
              className={`p-2.5 rounded-lg shrink-0 ${
                t.type === 'income'
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : 'bg-rose-500/10 border border-rose-500/20'
              }`}
            >
              {t.type === 'income' ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{t.description}</h4>
              <div className="flex items-center flex-wrap gap-2 mt-1.5">
                {/* Category badge */}
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[t.category] || CATEGORY_COLORS['Uncategorized']}15`,
                    color: CATEGORY_COLORS[t.category] || CATEGORY_COLORS['Uncategorized'],
                    border: `1px solid ${CATEGORY_COLORS[t.category] || CATEGORY_COLORS['Uncategorized']}30`,
                  }}
                >
                  {t.category}
                </span>

                {/* AI Predicted badge */}
                {t.predicted && (
                  <span className="flex items-center text-[9px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50 font-semibold uppercase tracking-wider whitespace-nowrap">
                    <Brain className="w-2.5 h-2.5 mr-0.5 text-purple-400" />
                    AI Predicted
                  </span>
                )}

                {/* Date */}
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(t.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Amount + Delete */}
          <div className="flex items-center space-x-4 shrink-0 ml-3">
            <span
              className={`text-sm font-bold ${
                t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
              }`}
            >
              {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
            </span>
            <button
              onClick={() => onDelete(t._id)}
              className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-900 transition-all duration-150"
              title="Delete transaction"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
