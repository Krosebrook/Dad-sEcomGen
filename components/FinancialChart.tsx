import React from 'react';
import { FinancialProjections } from '../types';

interface FinancialChartProps {
  financials: FinancialProjections;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ financials }) => {
  const revenue = (financials.sellingPriceCents / 100) * financials.estimatedMonthlySales;
  const cogs = (financials.costOfGoodsSoldCents / 100) * financials.estimatedMonthlySales;
  const marketingCosts = financials.monthlyMarketingBudgetCents / 100;
  const fixedCosts = financials.monthlyFixedCostsCents / 100;
  const transactionFees = revenue * (financials.transactionFeePercent / 100);
  const avgShippingCost = financials.shippingOptions.length > 0
    ? (financials.shippingOptions.reduce((sum, opt) => sum + opt.costCents, 0) / financials.shippingOptions.length / 100) * financials.estimatedMonthlySales
    : 0;

  const totalCosts = cogs + marketingCosts + fixedCosts + transactionFees + avgShippingCost;
  const profit = revenue - totalCosts;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const revenuePercent = 100;
  const cogsPercent = (cogs / revenue) * 100;
  const marketingPercent = (marketingCosts / revenue) * 100;
  const shippingPercent = (avgShippingCost / revenue) * 100;
  const fixedPercent = (fixedCosts / revenue) * 100;
  const feesPercent = (transactionFees / revenue) * 100;
  const profitPercent = (profit / revenue) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Monthly Revenue</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(revenue)}</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            {financials.estimatedMonthlySales} units × {formatCurrency(financials.sellingPriceCents / 100)}
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-600 dark:text-red-400 font-medium">Total Costs</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{formatCurrency(totalCosts)}</div>
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
            All expenses included
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          profit >= 0
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
        }`}>
          <div className={`text-sm font-medium ${
            profit >= 0
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            Net Profit
          </div>
          <div className={`text-2xl font-bold ${
            profit >= 0
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-orange-700 dark:text-orange-300'
          }`}>
            {formatCurrency(profit)}
          </div>
          <div className={`text-xs mt-1 ${
            profit >= 0
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {profitMargin.toFixed(1)}% margin
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Cost Breakdown</h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Revenue</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(revenue)}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Cost of Goods ({cogsPercent.toFixed(1)}%)</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(cogs)}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400 dark:bg-slate-500" style={{ width: `${cogsPercent}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Marketing ({marketingPercent.toFixed(1)}%)</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(marketingCosts)}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400" style={{ width: `${marketingPercent}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Shipping ({shippingPercent.toFixed(1)}%)</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(avgShippingCost)}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400" style={{ width: `${shippingPercent}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Transaction Fees ({feesPercent.toFixed(1)}%)</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(transactionFees)}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400" style={{ width: `${feesPercent}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Fixed Costs ({fixedPercent.toFixed(1)}%)</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(fixedCosts)}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-red-400" style={{ width: `${fixedPercent}%` }}></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-slate-900 dark:text-white">Net Profit ({profitPercent.toFixed(1)}%)</span>
              <span className={`font-bold ${
                profit >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(profit)}
              </span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full ${
                profit >= 0 ? 'bg-green-500' : 'bg-red-500'
              }`} style={{ width: `${Math.abs(profitPercent)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Break-even Analysis</h4>
        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Units to break-even:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {Math.ceil(fixedCosts / ((financials.sellingPriceCents - financials.costOfGoodsSoldCents) / 100))} units
            </span>
          </div>
          <div className="flex justify-between">
            <span>Profit per unit:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatCurrency((profit / financials.estimatedMonthlySales) || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
