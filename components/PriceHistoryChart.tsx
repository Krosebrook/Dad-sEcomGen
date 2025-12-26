import React from 'react';
import { PriceHistoryPoint } from '../types';
import { LineChart } from './charts';
import { visualizationService } from '../services/visualizationService';

interface PriceHistoryChartProps {
    data: PriceHistoryPoint[];
    currency: string;
    height?: number;
    showMiniVersion?: boolean;
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
    data,
    currency,
    height = 200,
    showMiniVersion = false
}) => {
    if (!data || data.length < 2) {
        return (
            <div
                className="flex items-center justify-center text-xs text-slate-400"
                style={{ height: showMiniVersion ? '50px' : `${height}px` }}
            >
                Not enough price data.
            </div>
        );
    }

    const chartData = visualizationService.preparePriceHistoryData(data);
    const prices = data.map(d => d.priceCents / 100);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const priceChange = prices[prices.length - 1] - prices[0];
    const priceChangePercent = (priceChange / prices[0]) * 100;

    if (showMiniVersion) {
        return (
            <div className="relative">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Price History (30d)
                    </h4>
                    <span className={`text-xs font-semibold ${
                        priceChange >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                    }`}>
                        {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
                    </span>
                </div>
                <div style={{ height: '100px' }}>
                    <LineChart
                        data={chartData}
                        lines={[
                            { dataKey: 'value', name: 'Price', color: '#3b82f6' },
                        ]}
                        formatYAxis={visualizationService.formatCompactCurrency}
                        formatTooltip={visualizationService.formatCurrency}
                    />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Low: {visualizationService.formatCurrency(minPrice)}</span>
                    <span>High: {visualizationService.formatCurrency(maxPrice)}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Current Price</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {visualizationService.formatCurrency(prices[prices.length - 1])}
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${
                        priceChange >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                    }`}>
                        {priceChange >= 0 ? '+' : ''}{visualizationService.formatCurrency(priceChange)}
                        ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Price Range</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {visualizationService.formatCurrency(minPrice)} - {visualizationService.formatCurrency(maxPrice)}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Spread: {visualizationService.formatCurrency(maxPrice - minPrice)}
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Average Price</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {visualizationService.formatCurrency(avgPrice)}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Last 30 days
                    </div>
                </div>
            </div>

            <div style={{ height: `${height}px` }}>
                <LineChart
                    data={chartData}
                    lines={[
                        { dataKey: 'value', name: 'Price', color: '#3b82f6' },
                    ]}
                    formatYAxis={visualizationService.formatCompactCurrency}
                    formatTooltip={visualizationService.formatCurrency}
                    yAxisLabel="Price"
                />
            </div>
        </div>
    );
};

export default PriceHistoryChart;
