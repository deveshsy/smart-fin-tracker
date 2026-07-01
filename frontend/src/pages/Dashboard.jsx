/**
 * Dashboard — Main authenticated view for Smart FinTracker.
 * Orchestrates KPI cards, transaction form, filters, charts,
 * and the transaction ledger. All API calls go through the service layer.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { transactionsAPI, healthAPI } from '../services/api';
import Header from '../components/Header';
import KpiCards from '../components/KpiCards';
import TransactionForm from '../components/TransactionForm';
import Filters from '../components/Filters';
import TransactionList from '../components/TransactionList';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import FlowBarChart from '../components/charts/FlowBarChart';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('connecting');
  const [mlStatus, setMlStatus] = useState('connecting');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  // ─── Data Fetching ────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);

    // Fetch transactions
    try {
      const res = await transactionsAPI.getAll();
      setTransactions(res.data);
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
    }

    // Check ML health
    try {
      const mlRes = await healthAPI.ml();
      setMlStatus(mlRes.data?.status === 'OK' ? 'online' : 'offline');
    } catch {
      setMlStatus('offline');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Transaction Handlers ────────────────────────────
  const handleTransactionAdded = (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await transactionsAPI.delete(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch {
      alert('Failed to delete. Check if backend is running.');
    }
  };

  // ─── Filtered Transactions ────────────────────────────
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search
      if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Type
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }
      // Category
      if (categoryFilter && t.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter]);

  // ─── Computed Metrics (always from ALL transactions) ──
  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // ─── Chart Data (from ALL expenses, not filtered) ─────
  const pieChartData = useMemo(() => {
    const catMap = {};
    expenseTransactions.forEach((t) => {
      const cat = t.category || 'Uncategorized';
      catMap[cat] = (catMap[cat] || 0) + t.amount;
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Background glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <Header backendStatus={backendStatus} mlStatus={mlStatus} onRefresh={fetchData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <KpiCards
          balance={balance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          incomeCount={incomeTransactions.length}
          expenseCount={expenseTransactions.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Form + Pie Chart */}
          <div className="lg:col-span-1 space-y-8">
            <TransactionForm onTransactionAdded={handleTransactionAdded} />
            <CategoryPieChart data={pieChartData} />
          </div>

          {/* Right column: Bar Chart + Ledger */}
          <div className="lg:col-span-2 space-y-8">
            <FlowBarChart totalIncome={totalIncome} totalExpense={totalExpense} />

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Transaction Ledger</h3>
                <span className="text-xs text-slate-400">
                  {filteredTransactions.length} of {transactions.length} entries
                </span>
              </div>

              <Filters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
              />

              <TransactionList
                transactions={filteredTransactions}
                loading={loading}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
