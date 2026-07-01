/**
 * CategoryPieChart — Donut chart visualizing expense distribution
 * across categories using Recharts. Includes a custom legend.
 */
import React from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { CATEGORY_COLORS } from '../../constants';

export default function CategoryPieChart({ data }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
      <h3 className="text-base font-semibold mb-4 text-white flex items-center">
        <PieIcon className="w-5 h-5 mr-2 text-indigo-400" />
        Category Distribution
      </h3>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
          No expense records to analyze
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                animationBegin={100}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS['Uncategorized']}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Custom legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center text-xs text-slate-400">
                <span
                  className="w-2.5 h-2.5 rounded-full mr-1.5"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[entry.name] || CATEGORY_COLORS['Uncategorized'],
                  }}
                />
                {entry.name}: ${entry.value.toFixed(0)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
