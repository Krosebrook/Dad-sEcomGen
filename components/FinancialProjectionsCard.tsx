import React, { useMemo } from 'react';
import { FinancialProjections } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Slider } from './ui/Slider';

interface FinancialProjectionsCardProps {
  financials: FinancialProjections;
  onFinancialsChange: (newFinancials: FinancialProjections) => void;
  currency: string;
}

const formatCurrency = (cents: number, currency: string = 'USD') => {
  if (isNaN(cents)) return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
};

const FinancialProjectionsCard: React.FC<FinancialProjectionsCardProps> = ({ financials, onFinancialsChange, currency }) => {

  const handleCentsChange = (field: keyof FinancialProjections, value: string) => {
    const floatValue = parseFloat(value);
    const cents = isNaN(floatValue) ? 0 : Math.round(floatValue * 100);
    onFinancialsChange({ ...financials, [field]: cents });
  };

  const handleNumberChange = (field: keyof FinancialProjections, value: string) => {
    const intValue = parseInt(value, 10);
    onFinancialsChange({ ...financials, [field]: isNaN(intValue) ? 0 : intValue });
  };

  const calculations = useMemo(() => {
    const { sellingPriceCents, costOfGoodsSoldCents, estimatedMonthlySales, monthlyMarketingBudgetCents } = financials;
    const monthlyRevenue = sellingPriceCents * estimatedMonthlySales;
    const totalCOGS = costOfGoodsSoldCents * estimatedMonthlySales;
    const grossProfit = monthlyRevenue - totalCOGS;
    const netProfit = grossProfit - monthlyMarketingBudgetCents;
    const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;
    
    return { monthlyRevenue, totalCOGS, grossProfit, netProfit, profitMargin };
  }, [financials]);

  const getProfitColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-slate-800 dark:text-slate-200';
  }

  return (
    <Card className="w-full animate-fade-in text-left">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">Financial Projections</CardTitle>
        <CardDescription>Adjust the numbers to see your potential profit.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="sellingPrice">Selling Price ({currency})</Label>
              <Input
                id="sellingPrice"
                type="number"
                value={financials.sellingPriceCents / 100}
                onChange={(e) => handleCentsChange('sellingPriceCents', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="cogs">Cost of Goods Sold (per unit)</Label>
              <Input
                id="cogs"
                type="number"
                value={financials.costOfGoodsSoldCents / 100}
                onChange={(e) => handleCentsChange('costOfGoodsSoldCents', e.target.value)}
                 min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="monthlySales">Estimated Monthly Sales</Label>
               <div className="flex items-center gap-4">
                <Slider
                    id="monthlySales"
                    min={0}
                    max={500}
                    step={5}
                    value={[financials.estimatedMonthlySales]}
                    onValueChange={(value) => onFinancialsChange({ ...financials, estimatedMonthlySales: value[0] })}
                />
                <span className="font-bold text-lg w-16 text-center">{financials.estimatedMonthlySales}</span>
               </div>
            </div>
            <div>
              <Label htmlFor="marketingBudget">Monthly Marketing Budget</Label>
              <Input
                id="marketingBudget"
                type="number"
                value={financials.monthlyMarketingBudgetCents / 100}
                onChange={(e) => handleCentsChange('monthlyMarketingBudgetCents', e.target.value)}
                 min="0"
                step="10"
              />
            </div>
          </div>
          {/* Output Section */}
          <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Profit Breakdown (Monthly)</h3>
            <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Revenue</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(calculations.monthlyRevenue, currency)}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Cost of Goods</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">-{formatCurrency(calculations.totalCOGS, currency)}</span>
            </div>
            <hr className="border-slate-200 dark:border-slate-700" />
            <div className="flex justify-between items-center font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Gross Profit</span>
                <span className="text-slate-800 dark:text-slate-200">{formatCurrency(calculations.grossProfit, currency)}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Marketing Budget</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">-{formatCurrency(financials.monthlyMarketingBudgetCents, currency)}</span>
            </div>
            <hr className="border-slate-200 dark:border-slate-700" />
            <div className="flex justify-between items-center text-xl font-bold p-3 rounded-md bg-white dark:bg-slate-900/50">
                <span className="text-slate-800 dark:text-slate-200">Net Profit</span>
                <span className={getProfitColor(calculations.netProfit)}>{formatCurrency(calculations.netProfit, currency)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Profit Margin</span>
                <span className={getProfitColor(calculations.netProfit)}>{calculations.profitMargin.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialProjectionsCard;
