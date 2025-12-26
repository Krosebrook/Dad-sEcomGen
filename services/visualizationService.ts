import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { FinancialProjections, PriceHistoryPoint } from '../types';

export interface TimeSeriesDataPoint {
  name: string;
  value: number;
  date: Date;
}

export interface MultiSeriesDataPoint {
  name: string;
  [key: string]: string | number;
}

export const visualizationService = {
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },

  formatCompactCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  },

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  },

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  },

  generateDateRange(days: number): Date[] {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    return eachDayOfInterval({ start: startDate, end: endDate });
  },

  generateMonthRange(months: number): Date[] {
    const endDate = new Date();
    const startDate = subMonths(endDate, months - 1);
    return eachMonthOfInterval({ start: startOfMonth(startDate), end: endOfMonth(endDate) });
  },

  preparePriceHistoryData(priceHistory: PriceHistoryPoint[]): TimeSeriesDataPoint[] {
    return priceHistory
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((point) => ({
        name: format(new Date(point.date), 'MMM d'),
        value: point.priceCents / 100,
        date: new Date(point.date),
      }));
  },

  prepareFinancialProjectionData(
    financials: FinancialProjections,
    months: number = 12
  ): MultiSeriesDataPoint[] {
    const monthDates = this.generateMonthRange(months);
    const currentMonthlySales = financials.estimatedMonthlySales;
    const growthRate = 1.05;

    return monthDates.map((date, index) => {
      const projectedSales = Math.round(currentMonthlySales * Math.pow(growthRate, index));
      const revenue = (financials.sellingPriceCents / 100) * projectedSales;
      const cogs = (financials.costOfGoodsSoldCents / 100) * projectedSales;
      const marketingCosts = financials.monthlyMarketingBudgetCents / 100;
      const fixedCosts = financials.monthlyFixedCostsCents / 100;
      const transactionFees = revenue * (financials.transactionFeePercent / 100);
      const avgShippingCost =
        financials.shippingOptions.length > 0
          ? (financials.shippingOptions.reduce((sum, opt) => sum + opt.costCents, 0) /
              financials.shippingOptions.length /
              100) *
            projectedSales
          : 0;

      const totalCosts = cogs + marketingCosts + fixedCosts + transactionFees + avgShippingCost;
      const profit = revenue - totalCosts;

      return {
        name: format(date, 'MMM yyyy'),
        revenue: Math.round(revenue),
        costs: Math.round(totalCosts),
        profit: Math.round(profit),
        units: projectedSales,
      };
    });
  },

  prepareCostBreakdownData(financials: FinancialProjections) {
    const revenue = (financials.sellingPriceCents / 100) * financials.estimatedMonthlySales;
    const cogs = (financials.costOfGoodsSoldCents / 100) * financials.estimatedMonthlySales;
    const marketingCosts = financials.monthlyMarketingBudgetCents / 100;
    const fixedCosts = financials.monthlyFixedCostsCents / 100;
    const transactionFees = revenue * (financials.transactionFeePercent / 100);
    const avgShippingCost =
      financials.shippingOptions.length > 0
        ? (financials.shippingOptions.reduce((sum, opt) => sum + opt.costCents, 0) /
            financials.shippingOptions.length /
            100) *
          financials.estimatedMonthlySales
        : 0;

    return [
      { name: 'Cost of Goods', value: cogs, color: '#ef4444' },
      { name: 'Marketing', value: marketingCosts, color: '#f59e0b' },
      { name: 'Shipping', value: avgShippingCost, color: '#3b82f6' },
      { name: 'Fixed Costs', value: fixedCosts, color: '#8b5cf6' },
      { name: 'Transaction Fees', value: transactionFees, color: '#ec4899' },
    ].filter((item) => item.value > 0);
  },

  prepareCashFlowData(financials: FinancialProjections, months: number = 6) {
    const monthDates = this.generateMonthRange(months);
    const currentMonthlySales = financials.estimatedMonthlySales;
    const growthRate = 1.05;

    let cumulativeCashFlow = 0;

    return monthDates.map((date, index) => {
      const projectedSales = Math.round(currentMonthlySales * Math.pow(growthRate, index));
      const revenue = (financials.sellingPriceCents / 100) * projectedSales;
      const cogs = (financials.costOfGoodsSoldCents / 100) * projectedSales;
      const marketingCosts = financials.monthlyMarketingBudgetCents / 100;
      const fixedCosts = financials.monthlyFixedCostsCents / 100;
      const transactionFees = revenue * (financials.transactionFeePercent / 100);
      const avgShippingCost =
        financials.shippingOptions.length > 0
          ? (financials.shippingOptions.reduce((sum, opt) => sum + opt.costCents, 0) /
              financials.shippingOptions.length /
              100) *
            projectedSales
          : 0;

      const totalCosts = cogs + marketingCosts + fixedCosts + transactionFees + avgShippingCost;
      const monthlyCashFlow = revenue - totalCosts;
      cumulativeCashFlow += monthlyCashFlow;

      return {
        name: format(date, 'MMM yyyy'),
        monthly: Math.round(monthlyCashFlow),
        cumulative: Math.round(cumulativeCashFlow),
      };
    });
  },

  calculateBreakEvenPoint(financials: FinancialProjections): number {
    const sellingPrice = financials.sellingPriceCents / 100;
    const costPerUnit = financials.costOfGoodsSoldCents / 100;
    const avgShippingPerUnit =
      financials.shippingOptions.length > 0
        ? financials.shippingOptions.reduce((sum, opt) => sum + opt.costCents, 0) /
          financials.shippingOptions.length /
          100
        : 0;
    const transactionFeePerUnit = sellingPrice * (financials.transactionFeePercent / 100);
    const variableCostPerUnit = costPerUnit + avgShippingPerUnit + transactionFeePerUnit;
    const fixedCostsMonthly =
      (financials.monthlyFixedCostsCents + financials.monthlyMarketingBudgetCents) / 100;
    const contributionMargin = sellingPrice - variableCostPerUnit;

    if (contributionMargin <= 0) return Infinity;

    return Math.ceil(fixedCostsMonthly / contributionMargin);
  },

  prepareInventoryTrendData(inventoryData: any[]): MultiSeriesDataPoint[] {
    return inventoryData.map((item) => ({
      name: format(new Date(item.date), 'MMM d'),
      quantity: item.quantity,
      value: item.value,
    }));
  },

  prepareMarketingROIData(campaigns: any[]): MultiSeriesDataPoint[] {
    return campaigns.map((campaign) => ({
      name: campaign.name,
      spent: campaign.budget,
      revenue: campaign.revenue || 0,
      roi: campaign.revenue ? ((campaign.revenue - campaign.budget) / campaign.budget) * 100 : 0,
    }));
  },

  generateTrendIndicator(currentValue: number, previousValue: number): {
    percentage: number;
    direction: 'up' | 'down' | 'neutral';
    isPositive: boolean;
  } {
    if (previousValue === 0) {
      return { percentage: 0, direction: 'neutral', isPositive: true };
    }

    const percentage = ((currentValue - previousValue) / previousValue) * 100;
    const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
    const isPositive = percentage >= 0;

    return {
      percentage: Math.abs(percentage),
      direction,
      isPositive,
    };
  },

  calculateMovingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const slice = data.slice(start, i + 1);
      const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      result.push(avg);
    }
    return result;
  },
};
