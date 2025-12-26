import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface BarChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  bars: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  xAxisKey?: string;
  yAxisLabel?: string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number) => string;
  stacked?: boolean;
  horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  bars,
  xAxisKey = 'name',
  yAxisLabel,
  formatYAxis,
  formatTooltip,
  stacked = false,
  horizontal = false,
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
                className="w-3 h-3 rounded"
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

  const ChartComponent = horizontal ? RechartsBarChart : RechartsBarChart;
  const layout = horizontal ? 'horizontal' : 'vertical';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartComponent
        data={data}
        layout={layout}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        {horizontal ? (
          <>
            <XAxis
              type="number"
              className="text-xs text-slate-600 dark:text-slate-400"
              stroke="currentColor"
              tickFormatter={formatYAxis}
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              className="text-xs text-slate-600 dark:text-slate-400"
              stroke="currentColor"
            />
          </>
        ) : (
          <>
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
          </>
        )}
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          className="text-sm text-slate-700 dark:text-slate-300"
        />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.color}
            stackId={stacked ? 'stack' : undefined}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </ChartComponent>
    </ResponsiveContainer>
  );
};
