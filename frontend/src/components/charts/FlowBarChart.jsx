/**
 * FlowBarChart — Bar chart comparing total Income vs total Expenses
 * using Recharts. Styled to match the dark dashboard theme.
 */
import React from 'react';
import { DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

export default function FlowBarChart({ totalIncome, totalExpense }) {
  const data = [
    { name: 'Income', value: totalIncome, fill: '#10b981' },
    { name: 'Expenses', value: totalExpense, fill: '#f43f5e' },
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
      <h3 className="text-base font-semibold mb-4 text-white flex items-center">
        <DollarSign className="w-5 h-5 mr-1 text-indigo-400" />
        Capital Flow Summary
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="30%">
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#f1f5f9' }}
              formatter={(value) => `$${value.toFixed(2)}`}
              cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={800}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
