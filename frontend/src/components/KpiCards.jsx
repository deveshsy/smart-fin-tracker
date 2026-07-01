/**
 * KpiCards — Three metric cards showing Net Balance, Total Income,
 * and Total Expenses with animated hover effects and live counts.
 */
import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Sparkles, PlusCircle } from 'lucide-react';

function formatCurrency(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function KpiCards({ balance, totalIncome, totalExpense, incomeCount, expenseCount }) {
  const cards = [
    {
      label: 'Net Portfolio Balance',
      value: `$${formatCurrency(balance)}`,
      valueColor: balance >= 0 ? 'text-emerald-400' : 'text-rose-400',
      icon: Wallet,
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      iconColor: 'text-indigo-400',
      footer: (
        <><Sparkles className="w-3.5 h-3.5 text-indigo-400 mr-1" /> Live balance automatically updating</>
      ),
      footerColor: 'text-slate-400',
    },
    {
      label: 'Total Income',
      value: `+$${formatCurrency(totalIncome)}`,
      valueColor: 'text-emerald-400',
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      iconColor: 'text-emerald-400',
      footer: (
        <><PlusCircle className="w-3.5 h-3.5 mr-1" /> {incomeCount} inflows tracked</>
      ),
      footerColor: 'text-emerald-400',
    },
    {
      label: 'Total Expenses',
      value: `-$${formatCurrency(totalExpense)}`,
      valueColor: 'text-rose-400',
      icon: TrendingDown,
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      iconColor: 'text-rose-400',
      footer: (
        <><TrendingDown className="w-3.5 h-3.5 mr-1" /> {expenseCount} outflows tracked</>
      ),
      footerColor: 'text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/50"
          >
            {/* Faint background icon */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.04]">
              <Icon className="w-24 h-24" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">{card.label}</p>
                <h3 className={`text-3xl font-bold mt-2 ${card.valueColor}`}>{card.value}</h3>
              </div>
              <div className={`${card.iconBg} p-3 rounded-xl border`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            <div className={`mt-4 text-xs ${card.footerColor} flex items-center`}>
              {card.footer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
