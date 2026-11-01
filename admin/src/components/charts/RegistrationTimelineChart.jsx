import React, { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

export default function RegistrationTimelineChart({ timeline = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Fallback or pad if timeline has only 1-2 points
  const points = timeline.length > 0 ? timeline : [
    { date: '2026-10-31', count: 1 },
    { date: '2026-11-01', count: 3 }
  ];

  const maxCount = Math.max(...points.map((p) => p.count), 4);
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate coordinates
  const coords = points.map((p, index) => {
    const x = paddingX + (index / Math.max(points.length - 1, 1)) * chartWidth;
    const y = height - paddingY - (p.count / maxCount) * chartHeight;
    return { x, y, ...p };
  });

  // Build SVG Path
  const linePath = coords.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = coords.length > 0
    ? `${linePath} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="p-6 rounded-3xl bg-mocha-900/70 border border-mocha-800/80 shadow-mocha-deep space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-gold-500/10 border border-gold-400/30 text-gold-400">
            <TrendingUp className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-serif text-base font-bold text-mocha-100">
              Registration Activity Timeline
            </h3>
            <p className="text-[11px] text-mocha-400">
              Chronological cadence of literary manuscript submissions & version commits
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-gold-300 bg-mocha-950 px-3 py-1 rounded-xl border border-mocha-800">
          <Calendar className="w-3.5 h-3.5 text-gold-400" />
          <span>Active Registry Period</span>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 overflow-visible"
        >
          <defs>
            {/* Champagne Gold Gradient for Area Fill */}
            <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cb9f54" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#cb9f54" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#cb9f54" stopOpacity="0" />
            </linearGradient>

            {/* Glowing Line Filter */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#cb9f54" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = height - paddingY - ratio * chartHeight;
            const val = Math.round(ratio * maxCount);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#38261b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  fill="#7c573d"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#goldAreaGrad)"
            />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#dbb97c"
              strokeWidth="2.5"
              filter="url(#goldGlow)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {coords.map((pt, i) => (
            <g
              key={i}
              className="cursor-pointer transition-transform"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill="#140c08"
                stroke="#cb9f54"
                strokeWidth="2.5"
                className="hover:scale-125 transition-all"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="9"
                fill="#cb9f54"
                opacity={hoveredPoint?.date === pt.date ? "0.2" : "0"}
                className="transition-opacity"
              />
              {/* Date label at bottom */}
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                fill="#a88567"
                fontSize="10"
                fontFamily="JetBrains Mono"
              >
                {pt.date.slice(5)}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredPoint && (
          <div
            className="absolute top-2 right-4 p-2.5 rounded-xl bg-mocha-950/95 border border-gold-400/50 shadow-xl text-xs font-mono animate-fade-in pointer-events-none"
          >
            <div className="text-gold-300 font-bold">{hoveredPoint.date}</div>
            <div className="text-mocha-300">
              Registrations: <strong className="text-emerald-400">{hoveredPoint.count} manuscripts</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

