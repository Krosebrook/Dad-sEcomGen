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
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const formatCurrency = (cents: number, currency: string = 'USD') => {
  if (isNaN(cents)) return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
};

const ReloadIcon: React.FC<{ className?: string, isSpinning?: boolean }> = ({ className, isSpinning }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} ${isSpinning ? 'animate-spin' : ''}`}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
    </svg>
);


const FinancialProjectionsCard: React.FC<FinancialProjectionsCardProps> = ({ financials, onFinancialsChange, currency, onRegenerate, isRegenerating }) => {

  const handleCentsChange = (field: keyof FinancialProjections, value: string) => {
    const floatValue = parseFloat(value);
    const cents = isNaN(floatValue) ? 0 : Math.round(floatValue * 100);
    onFinancialsChange({ ...financials, [field]: cents });
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
        <CardDescription>Adjust the assumptions below to project your potential profit.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
             <div>
              <Label htmlFor="sellingPrice">Selling Price ({currency})</Label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">This value is based on your Product Blueprint.</p>
              <Input
                id="sellingPrice"
                type="number"
                value={financials.sellingPriceCents / 100}
                onChange={(e) => handleCentsChange('sellingPriceCents', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* AI Assumptions Section */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-200">AI-Generated Assumptions</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">These are starting points. Adjust them to fit your strategy.</p>
                    </div>
                     <button
                        onClick={onRegenerate}
                        disabled={isRegenerating}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors disabled:opacity-50"
                        aria-label="Regenerate financial assumptions"
                    >
                        <ReloadIcon isSpinning={isRegenerating} />
                        Regenerate
                    </button>
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
                    <Label htmlFor="monthlySales">Estimated Monthly Sales (Units)</Label>
                    <div className="flex items-center gap-4">
                        <Slider
                            id="monthlySales"
                            min={0}
                            max={Math.max(500, financials.estimatedMonthlySales * 2)}
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