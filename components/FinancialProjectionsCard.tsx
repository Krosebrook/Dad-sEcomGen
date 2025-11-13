import React, { useMemo, useState } from 'react';
import { FinancialProjections, FinancialScenario } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Slider } from './ui/Slider';
import { Button } from './ui/Button';

interface FinancialProjectionsCardProps {
  financials: FinancialProjections;
  onFinancialsChange: (newFinancials: FinancialProjections) => void;
  currency: string;
  onScenarioChange: (scenario: FinancialScenario) => void;
  isRegenerating: boolean;
}

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);


const formatCurrency = (cents: number, currency: string = 'USD') => {
  if (isNaN(cents)) return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
};

const FinancialProjectionsCard: React.FC<FinancialProjectionsCardProps> = ({ financials, onFinancialsChange, currency, onScenarioChange, isRegenerating }) => {

  const [newShippingName, setNewShippingName] = useState('');
  const [newShippingCost, setNewShippingCost] = useState('');
  const [newShippingTime, setNewShippingTime] = useState('');

  const handleCentsChange = (field: keyof FinancialProjections, value: string) => {
    const floatValue = parseFloat(value);
    const cents = isNaN(floatValue) ? 0 : Math.round(floatValue * 100);
    onFinancialsChange({ ...financials, [field]: cents });
  };

  const handleAddShippingOption = (e: React.FormEvent) => {
    e.preventDefault();
    const costCents = Math.round(parseFloat(newShippingCost) * 100);
    if (newShippingName.trim() && !isNaN(costCents) && newShippingTime.trim()) {
        const newOption = {
            name: newShippingName.trim(),
            costCents,
            deliveryTime: newShippingTime.trim()
        };
        const newFinancials = {
            ...financials,
            shippingOptions: [...(financials.shippingOptions || []), newOption]
        };
        onFinancialsChange(newFinancials);
        // Reset form
        setNewShippingName('');
        setNewShippingCost('');
        setNewShippingTime('');
    }
  };

  const handleDeleteShippingOption = (index: number) => {
    const newOptions = [...(financials.shippingOptions || [])];
    newOptions.splice(index, 1);
    onFinancialsChange({ ...financials, shippingOptions: newOptions });
  };

  const calculations = useMemo(() => {
    const { 
        sellingPriceCents, 
        costOfGoodsSoldCents, 
        estimatedMonthlySales, 
        monthlyMarketingBudgetCents,
        shippingOptions = [],
        transactionFeePercent = 0,
        monthlyFixedCostsCents = 0,
    } = financials;
    const monthlyRevenue = sellingPriceCents * estimatedMonthlySales;
    const totalCOGS = costOfGoodsSoldCents * estimatedMonthlySales;
    const grossProfit = monthlyRevenue - totalCOGS;

    const shippingCostPerUnitCents = shippingOptions.length > 0 ? shippingOptions[0].costCents : 0;
    const totalShippingCosts = shippingCostPerUnitCents * estimatedMonthlySales;
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
                            id="monthlySalesSlider"
                            min={0}
                            max={Math.max(500, financials.estimatedMonthlySales * 2)}
                            step={5}
                            value={[financials.estimatedMonthlySales]}
                            onValueChange={(value) => onFinancialsChange({ ...financials, estimatedMonthlySales: value[0] })}
                        />
                         <Input
                            id="monthlySales"
                            type="number"
                            value={financials.estimatedMonthlySales}
                            onChange={(e) => onFinancialsChange({ ...financials, estimatedMonthlySales: parseInt(e.target.value, 10) || 0 })}
                            className="w-24 h-10 font-bold text-lg text-center"
                            min={0}
                            step={5}
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="marketingBudget">Monthly Marketing Budget ({currency})</Label>
                    <div className="flex items-center gap-4">
                        <Slider
                            id="marketingBudgetSlider"
                            min={0}
                            max={Math.max(5000, (financials.monthlyMarketingBudgetCents / 100) * 2)}
                            step={50}
                            value={[financials.monthlyMarketingBudgetCents / 100]}
                            onValueChange={(value) => onFinancialsChange({ ...financials, monthlyMarketingBudgetCents: value[0] * 100 })}
                        />
                        <Input
                            id="marketingBudget"
                            type="number"
                            value={financials.monthlyMarketingBudgetCents / 100}
                            onChange={(e) => handleCentsChange('monthlyMarketingBudgetCents', e.target.value)}
                            min="0"
                            step="10"
                            className="w-24 h-10 font-bold text-lg text-center"
                        />
                    </div>
                </div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-6">
                <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Detailed Assumptions</h4>
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
                 <div>
                    <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Shipping Options</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Manage your shipping rates. The first option in the list is used for profit calculations.</p>
                    
                    <div className="mt-2 space-y-2">
                        {(financials.shippingOptions || []).map((option, index) => (
                            <div key={index} className="flex items-center justify-between p-2 pl-3 bg-white dark:bg-slate-700/50 rounded-md gap-2">
                                <div className="flex-grow">
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{option.name} <span className="text-xs text-slate-500 dark:text-slate-400">({option.deliveryTime})</span></p>
                                </div>
                                 <p className="text-sm font-semibold flex-shrink-0">{formatCurrency(option.costCents, currency)}</p>
                                <Button size="sm" variant="outline" onClick={() => handleDeleteShippingOption(index)} aria-label={`Delete ${option.name}`} className="w-8 h-8 p-0 flex-shrink-0">
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         {(financials.shippingOptions || []).length === 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">No shipping options added yet.</p>
                         )}
                    </div>

                    <form onSubmit={handleAddShippingOption} className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3">
                        <h5 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Add New Shipping Option</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="shipping-name" className="text-xs">Name</Label>
                                <Input id="shipping-name" value={newShippingName} onChange={e => setNewShippingName(e.target.value)} placeholder="e.g., Express" className="h-9" required />
                            </div>
                             <div>
                                <Label htmlFor="shipping-time" className="text-xs">Delivery Time</Label>
                                <Input id="shipping-time" value={newShippingTime} onChange={e => setNewShippingTime(e.target.value)} placeholder="e.g., 1-3 days" className="h-9" required />
                            </div>
                        </div>
                        <div>
                             <Label htmlFor="shipping-cost" className="text-xs">Cost ({currency})</Label>
                            <Input id="shipping-cost" type="number" value={newShippingCost} onChange={e => setNewShippingCost(e.target.value)} placeholder="19.99" min="0" step="0.01" className="h-9" required />
                        </div>
                        <div className="text-right">
                             <Button type="submit" size="sm">Add Option</Button>
                        </div>
                    </form>
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
                <span className="text-slate-600 dark:text-slate-400">Shipping Costs (Est.)</span>
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