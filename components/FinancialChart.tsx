import React, { useState } from 'react';
import { FinancialProjections } from '../types';
import { ChartContainer, LineChart, PieChart, AreaChart } from './charts';
import { visualizationService } from '../services/visualizationService';

interface FinancialChartProps {
  financials: FinancialProjections;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ financials }) => {
  const [projectionMonths, setProjectionMonths] = useState(12);
  const [cashFlowMonths, setCashFlowMonths] = useState(6);

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
  const breakEvenUnits = visualizationService.calculateBreakEvenPoint(financials);

  const formatCurrency = visualizationService.formatCurrency;

  const revenuePercent = 100;
  const cogsPercent = revenue > 0 ? (cogs / revenue) * 100 : 0;
  const marketingPercent = revenue > 0 ? (marketingCosts / revenue) * 100 : 0;
  const shippingPercent = revenue > 0 ? (avgShippingCost / revenue) * 100 : 0;
  const fixedPercent = revenue > 0 ? (fixedCosts / revenue) * 100 : 0;
  const feesPercent = revenue > 0 ? (transactionFees / revenue) * 100 : 0;
  const profitPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

  const projectionData = visualizationService.prepareFinancialProjectionData(financials, projectionMonths);
  const costBreakdownData = visualizationService.prepareCostBreakdownData(financials);
  const cashFlowData = visualizationService.prepareCashFlowData(financials, cashFlowMonths);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Revenue & Profit Projections"
          subtitle={`${projectionMonths}-month forecast with 5% monthly growth`}
          height={350}
          actions={
            <select
              value={projectionMonths}
              onChange={(e) => setProjectionMonths(Number(e.target.value))}
              className="text-sm px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
            </select>
          }
        >
          <LineChart
            data={projectionData}
            lines={[
              { dataKey: 'revenue', name: 'Revenue', color: '#10b981' },
              { dataKey: 'costs', name: 'Total Costs', color: '#ef4444' },
              { dataKey: 'profit', name: 'Net Profit', color: '#3b82f6' },
            ]}
            formatYAxis={visualizationService.formatCompactCurrency}
            formatTooltip={visualizationService.formatCurrency}
          />
        </ChartContainer>

        <ChartContainer
          title="Cost Breakdown"
          subtitle="Monthly expense distribution"
          height={350}
        >
          <PieChart
            data={costBreakdownData}
            formatValue={visualizationService.formatCurrency}
            showPercentage={true}
            innerRadius={60}
          />
        </ChartContainer>
      </div>

      <ChartContainer
        title="Cash Flow Analysis"
        subtitle={`${cashFlowMonths}-month cumulative cash flow`}
        height={350}
        actions={
          <select
            value={cashFlowMonths}
            onChange={(e) => setCashFlowMonths(Number(e.target.value))}
            className="text-sm px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
        }
      >
        <AreaChart
          data={cashFlowData}
          areas={[
            { dataKey: 'monthly', name: 'Monthly Cash Flow', color: '#3b82f6' },
            { dataKey: 'cumulative', name: 'Cumulative Cash Flow', color: '#10b981' },
          ]}
          formatYAxis={visualizationService.formatCompactCurrency}
          formatTooltip={visualizationService.formatCurrency}
        />
      </ChartContainer>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Break-even Analysis</h4>
        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Units to break-even:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {breakEvenUnits === Infinity ? 'Not profitable' : `${visualizationService.formatNumber(breakEvenUnits)} units`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Profit per unit:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatCurrency((profit / financials.estimatedMonthlySales) || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Current vs break-even:</span>
            <span className={`font-semibold ${
              financials.estimatedMonthlySales >= breakEvenUnits
                ? 'text-green-600 dark:text-green-400'
                : 'text-orange-600 dark:text-orange-400'
            }`}>
              {breakEvenUnits === Infinity
                ? 'Need higher margin'
                : financials.estimatedMonthlySales >= breakEvenUnits
                ? `${visualizationService.formatNumber(financials.estimatedMonthlySales - breakEvenUnits)} units above`
                : `${visualizationService.formatNumber(breakEvenUnits - financials.estimatedMonthlySales)} units needed`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
