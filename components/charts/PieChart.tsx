import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartDataPoint[];
  formatValue?: (value: number) => string;
  showPercentage?: boolean;
  innerRadius?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  formatValue,
  showPercentage = true,
  innerRadius = 0,
}) => {
  const COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
  ];

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const percentage = ((value / total) * 100).toFixed(1);
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {payload[0].name}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {formatValue ? formatValue(value) : value}
            {showPercentage && (
              <span className="text-slate-500 dark:text-slate-400 ml-1">
                ({percentage}%)
              </span>
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry: any) => {
    const percentage = ((entry.value / total) * 100).toFixed(1);
    return `${percentage}%`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showPercentage ? renderLabel : false}
          outerRadius={80}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ paddingTop: '20px' }}
          className="text-sm text-slate-700 dark:text-slate-300"
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
