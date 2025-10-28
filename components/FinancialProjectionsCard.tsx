
import React, { useMemo } from 'react';
import { FinancialProjections, FinancialScenario } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Slider } from './ui/Slider';

interface FinancialProjectionsCardProps {
  financials: FinancialProjections;
  onFinancialsChange: (newFinancials: FinancialProjections) => void;
  currency: string;
  onScenarioChange: (scenario: FinancialScenario) => void;
  isRegenerating: boolean;
}

const formatCurrency = (cents: number, currency: string = 'USD') => {
  if (isNaN(cents)) return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
};

const FinancialProjectionsCard: React.FC<FinancialProjectionsCardProps> = ({ financials, onFinancialsChange, currency, onScenarioChange, isRegenerating }) => {

  const handleCentsChange = (field: keyof FinancialProjections, value: string) => {
    const floatValue = parseFloat(value);
    const cents = isNaN(floatValue) ? 0 : Math.round(floatValue * 100);
    onFinancialsChange({ ...financials, [field]: cents });
  };

  const calculations = useMemo(() => {
    const { 
        sellingPriceCents, 
        costOfGoodsSoldCents, 
        estimatedMonthlySales, 
        monthlyMarketingBudgetCents,
        shippingCostPerUnitCents = 0,
        transactionFeePercent = 0,
        monthlyFixedCostsCents = 0,
    } = financials;
    const monthlyRevenue = sellingPriceCents * estimatedMonthlySales;
    const totalCOGS = costOfGoodsSoldCents * estimatedMonthlySales;
    const grossProfit = monthlyRevenue - totalCOGS;

    const totalShippingCosts = (shippingCostPerUnitCents || 0) * estimatedMonthlySales;
    const totalTransactionFees = monthlyRevenue * ((transactionFeePercent || 0) / 100);
    
    const netProfit = grossProfit - monthlyMarketingBudgetCents - totalShippingCosts - totalTransactionFees - (monthlyFixedCostsCents || 0);
    const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;
    
    return { monthlyRevenue, totalCOGS, grossProfit, netProfit, profitMargin, totalShippingCosts, totalTransactionFees };
  }, [financials]);

  const getProfitColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-slate-800 dark:text-slate-200';
  }

  const scenarios: FinancialScenario[] = ['Pessimistic', 'Realistic', 'Optimistic'];

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
                <div>
                    <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Financial Scenario</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Select a scenario to regenerate AI assumptions based on different market conditions.</p>
                    <div className="flex flex-wrap justify-start gap-2">
                         {scenarios.map((scenario) => (
                            <button
                                key={scenario}
                                type="button"
                                onClick={() => onScenarioChange(scenario)}
                                disabled={isRegenerating}
                                className={`px-3 py-1.5 text-sm rounded-full transition-colors font-semibold flex items-center justify-center ${
                                    financials.scenario === scenario
                                    ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900 ring-slate-900 dark:ring-slate-50'
                                    : 'bg-white hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
                                }`}
                                >
                                {isRegenerating && financials.scenario === scenario && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                )}
                                {scenario}
                            </button>
                        ))}
                    </div>
                </div>

                 <div>
                    <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-200">AI-Generated Assumptions</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">These are starting points. Adjust them to fit your strategy.</p>
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
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-6">
                <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Detailed Assumptions</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Add more detail for a precise projection.</p>
                
                <div>
                    <Label htmlFor="shippingCost">Shipping Cost (per unit)</Label>
                    <Input
                        id="shippingCost"
                        type="number"
                        value={(financials.shippingCostPerUnitCents || 0) / 100}
                        onChange={(e) => handleCentsChange('shippingCostPerUnitCents', e.target.value)}
                        min="0"
                        step="0.01"
                    />
                </div>
                <div>
                    <Label htmlFor="transactionFee">Transaction Fee (%)</Label>
                    <Input
                        id="transactionFee"
                        type="number"
                        value={financials.transactionFeePercent || ''}
                        onChange={(e) => onFinancialsChange({ ...financials, transactionFeePercent: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.1"
                        placeholder="e.g. 2.9"
                    />
                </div>
                <div>
                    <Label htmlFor="fixedCosts">Monthly Fixed Costs</Label>
                    <Input
                        id="fixedCosts"
                        type="number"
                        value={(financials.monthlyFixedCostsCents || 0) / 100}
                        onChange={(e) => handleCentsChange('monthlyFixedCostsCents', e.target.value)}
                        min="0"
                        step="1"
                        placeholder="e.g. Shopify plan, apps"
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
             <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Shipping Costs</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">-{formatCurrency(calculations.totalShippingCosts, currency)}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Transaction Fees</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">-{formatCurrency(calculations.totalTransactionFees, currency)}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Fixed Costs</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">-{formatCurrency(financials.monthlyFixedCostsCents || 0, currency)}</span>
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