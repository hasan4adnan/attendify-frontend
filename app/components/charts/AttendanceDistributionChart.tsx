'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const data = [
  { name: 'Present', value: 76, color: '#0046FF' },
  { name: 'Absent', value: 18, color: '#FF8040' },
  { name: 'Excused', value: 6, color: '#001BB7' },
];

const COLORS = ['#0046FF', '#FF8040', '#001BB7'];

export default function AttendanceDistributionChart() {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  const textColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(10, 10, 15, 0.9)';
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(10, 10, 15, 0.7)';
  const tooltipBg = isDark ? 'rgba(6, 1, 40, 0.95)' : 'rgba(245, 241, 220, 0.95)';
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <p
            style={{
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(10, 10, 15, 0.9)',
              marginBottom: '4px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {data.name}
          </p>
          <p
            style={{
              color: data.color,
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            {data.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full animate-in flex flex-col items-center justify-center">
      <div className="flex-1 flex items-center justify-center w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={70}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
              animationBegin={0}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={isDark ? 'rgba(6, 1, 40, 0.3)' : 'rgba(245, 241, 220, 0.3)'}
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Custom Legend */}
      <div className="flex flex-col gap-2.5 mt-3 w-full px-1">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: textColor }}
              >
                {entry.name}
              </span>
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: entry.color }}
            >
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

