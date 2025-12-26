import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface AreaChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface AreaChartProps {
  data: AreaChartDataPoint[];
  areas: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  xAxisKey?: string;
  yAxisLabel?: string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number) => string;
  stacked?: boolean;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  areas,
  xAxisKey = 'name',
  yAxisLabel,
  formatYAxis,
  formatTooltip,
  stacked = false,
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {payload[0].payload[xAxisKey]}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-700 dark:text-slate-300">
                {entry.name}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatTooltip ? formatTooltip(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          {areas.map((area) => (
            <linearGradient key={area.dataKey} id={`color${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis
          dataKey={xAxisKey}
          className="text-xs text-slate-600 dark:text-slate-400"
          stroke="currentColor"
        />
        <YAxis
          className="text-xs text-slate-600 dark:text-slate-400"
          stroke="currentColor"
          tickFormatter={formatYAxis}
          label={
            yAxisLabel
              ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: 'insideLeft',
                  className: 'text-slate-600 dark:text-slate-400',
                }
              : undefined
          }
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          className="text-sm text-slate-700 dark:text-slate-300"
        />
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={area.color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#color${area.dataKey})`}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};
