import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import {
  financialPlanningService,
  BreakEvenAnalysis,
  CashFlowForecast,
} from '../services/financialPlanningService';
import { useAuth } from '../contexts/AuthContext';

interface FinancialPlanningSuiteCardProps {
  ventureId: string;
}

export function FinancialPlanningSuiteCard({ ventureId }: FinancialPlanningSuiteCardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'breakeven' | 'cashflow'>('breakeven');
  const [breakEvenAnalyses, setBreakEvenAnalyses] = useState<BreakEvenAnalysis[]>([]);
  const [cashFlowForecasts, setCashFlowForecasts] = useState<CashFlowForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [breakEvenForm, setBreakEvenForm] = useState({
    name: '',
    fixedCosts: '',
    variableCostPerUnit: '',
    pricePerUnit: '',
    notes: '',
  });

  const [cashFlowForm, setCashFlowForm] = useState({
    name: '',
    monthYear: '',
    revenue: '',
    costOfGoods: '',
    operatingExpenses: '',
    marketingExpenses: '',
    otherExpenses: '',
    notes: '',
  });

  const [calculatedBreakEven, setCalculatedBreakEven] = useState<{
    units: number;
    revenue: number;
    isViable: boolean;
  } | null>(null);

  useEffect(() => {
    if (ventureId && user) {
      loadData();
    }
  }, [ventureId, user]);

  useEffect(() => {
    if (breakEvenForm.fixedCosts && breakEvenForm.variableCostPerUnit && breakEvenForm.pricePerUnit) {
      const result = financialPlanningService.calculateBreakEven(
        parseFloat(breakEvenForm.fixedCosts),
        parseFloat(breakEvenForm.variableCostPerUnit),
        parseFloat(breakEvenForm.pricePerUnit)
      );
      setCalculatedBreakEven(result);
    } else {
      setCalculatedBreakEven(null);
    }
  }, [breakEvenForm.fixedCosts, breakEvenForm.variableCostPerUnit, breakEvenForm.pricePerUnit]);

  const loadData = async () => {
    if (!ventureId || !user) return;

    try {
      setLoading(true);
      const [analyses, forecasts] = await Promise.all([
        financialPlanningService.getBreakEvenAnalyses(ventureId),
        financialPlanningService.getCashFlowForecasts(ventureId),
      ]);
      setBreakEvenAnalyses(analyses);
      setCashFlowForecasts(forecasts);
    } catch (err) {
      setError('Failed to load financial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBreakEven = async () => {
    if (!user || !breakEvenForm.name || !breakEvenForm.fixedCosts || !breakEvenForm.pricePerUnit) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await financialPlanningService.createBreakEvenAnalysis({
        venture_id: ventureId,
        user_id: user.id,
        analysis_name: breakEvenForm.name,
        fixed_costs: parseFloat(breakEvenForm.fixedCosts),
        variable_cost_per_unit: parseFloat(breakEvenForm.variableCostPerUnit || '0'),
        price_per_unit: parseFloat(breakEvenForm.pricePerUnit),
        notes: breakEvenForm.notes || undefined,
      });

      setBreakEvenForm({
        name: '',
        fixedCosts: '',
        variableCostPerUnit: '',
        pricePerUnit: '',
        notes: '',
      });
      setCalculatedBreakEven(null);

      await loadData();
    } catch (err) {
      setError('Failed to create break-even analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCashFlow = async () => {
    if (!user || !cashFlowForm.name || !cashFlowForm.monthYear) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await financialPlanningService.createCashFlowForecast({
        venture_id: ventureId,
        user_id: user.id,
        forecast_name: cashFlowForm.name,
        month_year: cashFlowForm.monthYear,
        revenue: parseFloat(cashFlowForm.revenue || '0'),
        cost_of_goods: parseFloat(cashFlowForm.costOfGoods || '0'),
        operating_expenses: parseFloat(cashFlowForm.operatingExpenses || '0'),
        marketing_expenses: parseFloat(cashFlowForm.marketingExpenses || '0'),
        other_expenses: parseFloat(cashFlowForm.otherExpenses || '0'),
        notes: cashFlowForm.notes || undefined,
      });

      setCashFlowForm({
        name: '',
        monthYear: '',
        revenue: '',
        costOfGoods: '',
        operatingExpenses: '',
        marketingExpenses: '',
        otherExpenses: '',
        notes: '',
      });

      await loadData();
    } catch (err) {
      setError('Failed to create cash flow forecast');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBreakEven = async (id: string) => {
    try {
      setLoading(true);
      await financialPlanningService.deleteBreakEvenAnalysis(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCashFlow = async (id: string) => {
    try {
      setLoading(true);
      await financialPlanningService.deleteCashFlowForecast(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete forecast');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">Please sign in to use Financial Planning features</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Financial Planning Suite</h2>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('breakeven')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'breakeven'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Break-Even Analysis
        </button>
        <button
          onClick={() => setActiveTab('cashflow')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'cashflow'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Cash Flow Forecasts
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'breakeven' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold mb-4">New Break-Even Analysis</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="beName">Analysis Name*</Label>
                <Input
                  id="beName"
                  value={breakEvenForm.name}
                  onChange={(e) => setBreakEvenForm({ ...breakEvenForm, name: e.target.value })}
                  placeholder="e.g., Product Launch Q1 2024"
                />
              </div>

              <div>
                <Label htmlFor="fixedCosts">Fixed Costs ($)*</Label>
                <Input
                  id="fixedCosts"
                  type="number"
                  step="0.01"
                  value={breakEvenForm.fixedCosts}
                  onChange={(e) =>
                    setBreakEvenForm({ ...breakEvenForm, fixedCosts: e.target.value })
                  }
                  placeholder="5000.00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="variableCost">Variable Cost/Unit ($)</Label>
                  <Input
                    id="variableCost"
                    type="number"
                    step="0.01"
                    value={breakEvenForm.variableCostPerUnit}
                    onChange={(e) =>
                      setBreakEvenForm({ ...breakEvenForm, variableCostPerUnit: e.target.value })
                    }
                    placeholder="10.00"
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerUnit">Price/Unit ($)*</Label>
                  <Input
                    id="pricePerUnit"
                    type="number"
                    step="0.01"
                    value={breakEvenForm.pricePerUnit}
                    onChange={(e) =>
                      setBreakEvenForm({ ...breakEvenForm, pricePerUnit: e.target.value })
                    }
                    placeholder="25.00"
                  />
                </div>
              </div>

              {calculatedBreakEven && (
                <div className="p-3 bg-white rounded-lg border border-blue-300">
                  {calculatedBreakEven.isViable ? (
                    <>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Break-Even Point:
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {calculatedBreakEven.units.toLocaleString()} units
                      </p>
                      <p className="text-lg text-gray-700">
                        ${calculatedBreakEven.revenue.toFixed(2)} revenue
                      </p>
                    </>
                  ) : (
                    <p className="text-red-600 font-medium">
                      Business model not viable: Price must exceed variable cost
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="beNotes">Notes</Label>
                <textarea
                  id="beNotes"
                  value={breakEvenForm.notes}
                  onChange={(e) => setBreakEvenForm({ ...breakEvenForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <Button onClick={handleCreateBreakEven} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Analysis'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Saved Analyses</h3>
            {breakEvenAnalyses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No analyses yet</p>
            ) : (
              breakEvenAnalyses.map((analysis) => (
                <div key={analysis.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{analysis.analysis_name}</h4>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Fixed Costs:</p>
                          <p className="font-medium">${analysis.fixed_costs.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Variable Cost/Unit:</p>
                          <p className="font-medium">
                            ${analysis.variable_cost_per_unit.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Price/Unit:</p>
                          <p className="font-medium">${analysis.price_per_unit.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Break-Even:</p>
                          <p className="font-medium text-blue-600">
                            {Math.ceil(analysis.break_even_units).toLocaleString()} units
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-blue-50 rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Break-Even Revenue:</span> $
                          {analysis.break_even_revenue.toFixed(2)}
                        </p>
                      </div>
                      {analysis.notes && (
                        <p className="mt-2 text-sm text-gray-600">{analysis.notes}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleDeleteBreakEven(analysis.id)}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold mb-4">New Cash Flow Forecast</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="cfName">Forecast Name*</Label>
                <Input
                  id="cfName"
                  value={cashFlowForm.name}
                  onChange={(e) => setCashFlowForm({ ...cashFlowForm, name: e.target.value })}
                  placeholder="e.g., January 2024 Forecast"
                />
              </div>

              <div>
                <Label htmlFor="monthYear">Month*</Label>
                <Input
                  id="monthYear"
                  type="date"
                  value={cashFlowForm.monthYear}
                  onChange={(e) => setCashFlowForm({ ...cashFlowForm, monthYear: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="revenue">Revenue ($)</Label>
                <Input
                  id="revenue"
                  type="number"
                  step="0.01"
                  value={cashFlowForm.revenue}
                  onChange={(e) => setCashFlowForm({ ...cashFlowForm, revenue: e.target.value })}
                  placeholder="10000.00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cogs">Cost of Goods ($)</Label>
                  <Input
                    id="cogs"
                    type="number"
                    step="0.01"
                    value={cashFlowForm.costOfGoods}
                    onChange={(e) =>
                      setCashFlowForm({ ...cashFlowForm, costOfGoods: e.target.value })
                    }
                    placeholder="4000.00"
                  />
                </div>
                <div>
                  <Label htmlFor="opex">Operating Expenses ($)</Label>
                  <Input
                    id="opex"
                    type="number"
                    step="0.01"
                    value={cashFlowForm.operatingExpenses}
                    onChange={(e) =>
                      setCashFlowForm({ ...cashFlowForm, operatingExpenses: e.target.value })
                    }
                    placeholder="2000.00"
                  />
                </div>
                <div>
                  <Label htmlFor="marketing">Marketing Expenses ($)</Label>
                  <Input
                    id="marketing"
                    type="number"
                    step="0.01"
                    value={cashFlowForm.marketingExpenses}
                    onChange={(e) =>
                      setCashFlowForm({ ...cashFlowForm, marketingExpenses: e.target.value })
                    }
                    placeholder="1500.00"
                  />
                </div>
                <div>
                  <Label htmlFor="other">Other Expenses ($)</Label>
                  <Input
                    id="other"
                    type="number"
                    step="0.01"
                    value={cashFlowForm.otherExpenses}
                    onChange={(e) =>
                      setCashFlowForm({ ...cashFlowForm, otherExpenses: e.target.value })
                    }
                    placeholder="500.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cfNotes">Notes</Label>
                <textarea
                  id="cfNotes"
                  value={cashFlowForm.notes}
                  onChange={(e) => setCashFlowForm({ ...cashFlowForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <Button onClick={handleCreateCashFlow} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Forecast'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Saved Forecasts</h3>
            {cashFlowForecasts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No forecasts yet</p>
            ) : (
              cashFlowForecasts.map((forecast) => (
                <div key={forecast.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{forecast.forecast_name}</h4>
                        <span className="text-sm text-gray-600">
                          {new Date(forecast.month_year).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium text-green-600">
                            ${forecast.revenue.toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t pt-2 space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Cost of Goods:</span>
                            <span>${forecast.cost_of_goods.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Operating:</span>
                            <span>${forecast.operating_expenses.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Marketing:</span>
                            <span>${forecast.marketing_expenses.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Other:</span>
                            <span>${forecast.other_expenses.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm font-semibold border-t pt-2">
                          <span>Total Expenses:</span>
                          <span className="text-red-600">
                            ${forecast.total_expenses.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t pt-2">
                          <span>Net Cash Flow:</span>
                          <span
                            className={
                              forecast.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            ${forecast.net_cash_flow.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {forecast.notes && (
                        <p className="mt-2 text-sm text-gray-600 italic">{forecast.notes}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleDeleteCashFlow(forecast.id)}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      className="ml-4"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
