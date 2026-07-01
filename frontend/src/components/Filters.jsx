/**
 * Filters — Search bar, type filter (All/Income/Expense),
 * and category dropdown for filtering the transaction ledger.
 */
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CATEGORY_LIST } from '../constants';

export default function Filters({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
}) {
  const hasActiveFilters = searchQuery || typeFilter !== 'all' || categoryFilter;

  const clearAll = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
        />
      </div>

      {/* Type filter */}
      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        {['all', 'income', 'expense'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3.5 py-2 text-xs font-medium capitalize transition-all duration-150 ${
              typeFilter === t
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="relative">
        <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 appearance-none"
        >
          <option value="">All Categories</option>
          {CATEGORY_LIST.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Clear all filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center px-3 py-2 text-xs text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800 hover:border-rose-800/50 rounded-xl transition-all duration-200"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Clear
        </button>
      )}
    </div>
  );
}
