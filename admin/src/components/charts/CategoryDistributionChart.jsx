import React from 'react';
import { BookOpen, PieChart } from 'lucide-react';

const COLORS = [
  { stroke: '#cb9f54', bg: 'bg-gold-500', text: 'text-gold-400' }, // Champagne Gold
  { stroke: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-400' }, // Emerald
  { stroke: '#dbb97c', bg: 'bg-gold-400', text: 'text-gold-300' }, // Light Gold
  { stroke: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-400' }, // Blue
  { stroke: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-400' }, // Purple
  { stroke: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-400' }, // Amber
];

export default function CategoryDistributionChart({ categories = [] }) {
  const total = categories.reduce((sum, c) => sum + c.count, 0) || 1;

  // SVG Donut calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const slices = categories.map((cat, idx) => {
    const ratio = cat.count / total;
    const strokeDasharray = `${ratio * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += ratio * circumference;
    const color = COLORS[idx % COLORS.length];

    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
      color,
    };
  });

  return (
    <div className="p-6 rounded-3xl bg-mocha-900/70 border border-mocha-800/80 shadow-mocha-deep space-y-4 flex flex-col justify-between">
      <div className="flex items-center space-x-2.5">
        <span className="p-2 rounded-xl bg-gold-500/10 border border-gold-400/30 text-gold-400">
          <PieChart className="w-4 h-4" />
        </span>
        <div>
          <h3 className="font-serif text-base font-bold text-mocha-100">
            Literary Category Breakdown
          </h3>
          <p className="text-[11px] text-mocha-400">
            Genre & document classification distribution
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* SVG Donut Chart */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#231610"
              strokeWidth="18"
            />

            {/* Slices */}
            {slices.map((slice, i) => (
              <circle
                key={i}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={slice.color.stroke}
                strokeWidth="18"
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 hover:opacity-90 cursor-pointer"
              />
            ))}
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-serif text-2xl font-bold text-gold-300">
              {total}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-mocha-400">
              Total Works
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2.5 w-full sm:w-auto flex-1 max-w-xs">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2 truncate">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color.stroke }}
                />
                <span className="text-mocha-200 font-sans truncate">{slice.name}</span>
              </div>
              <div className="flex items-center space-x-2 font-bold shrink-0">
                <span className="text-mocha-400">{slice.count}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${slice.color.text} bg-mocha-950 border border-mocha-800`}>
                  {slice.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

