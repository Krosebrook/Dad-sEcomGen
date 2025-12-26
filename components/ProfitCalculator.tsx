import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

interface ProfitCalculatorProps {
  estimatedPrice?: number;
  className?: string;
}

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ estimatedPrice = 0, className = '' }) => {
  const [sellingPrice, setSellingPrice] = useState(estimatedPrice || 29.99);
  const [productCost, setProductCost] = useState(10);
  const [shippingCost, setShippingCost] = useState(5);
  const [marketingCost, setMarketingCost] = useState(3);
  const [platformFees, setPlatformFees] = useState(15);
  const [monthlyUnits, setMonthlyUnits] = useState(100);

  const totalCostPerUnit = productCost + shippingCost + marketingCost + (sellingPrice * platformFees / 100);
  const profitPerUnit = sellingPrice - totalCostPerUnit;
  const profitMargin = (profitPerUnit / sellingPrice) * 100;
  const monthlyProfit = profitPerUnit * monthlyUnits;
  const annualProfit = monthlyProfit * 12;

  const getProfitColor = (margin: number) => {
    if (margin >= 30) return 'text-green-600 dark:text-green-400';
    if (margin >= 15) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className={`${className} text-left`}>
      <CardHeader>
        <CardTitle className="text-lg">Profit Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="selling-price">Selling Price ($)</Label>
            <Input
              id="selling-price"
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="product-cost">Product Cost ($)</Label>
            <Input
              id="product-cost"
              type="number"
              value={productCost}
              onChange={(e) => setProductCost(parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="shipping-cost">Shipping Cost ($)</Label>
            <Input
              id="shipping-cost"
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="marketing-cost">Marketing Cost/Unit ($)</Label>
            <Input
              id="marketing-cost"
              type="number"
              value={marketingCost}
              onChange={(e) => setMarketingCost(parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="platform-fees">Platform Fees (%)</Label>
            <Input
              id="platform-fees"
              type="number"
              value={platformFees}
              onChange={(e) => setPlatformFees(parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div>
            <Label htmlFor="monthly-units">Est. Monthly Units</Label>
            <Input
              id="monthly-units"
              type="number"
              value={monthlyUnits}
              onChange={(e) => setMonthlyUnits(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400">Cost Per Unit</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                ${totalCostPerUnit.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400">Profit Per Unit</p>
              <p className={`text-xl font-bold ${getProfitColor(profitMargin)}`}>
                ${profitPerUnit.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400">Profit Margin</p>
              <p className={`text-xl font-bold ${getProfitColor(profitMargin)}`}>
                {profitMargin.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly Profit</p>
              <p className={`text-xl font-bold ${getProfitColor(profitMargin)}`}>
                ${monthlyProfit.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400">Projected Annual Profit</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${annualProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {profitMargin < 15 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Warning:</strong> Profit margin is below 15%. Consider adjusting pricing or reducing costs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfitCalculator;
