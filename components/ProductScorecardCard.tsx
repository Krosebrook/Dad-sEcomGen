import React from 'react';
import { ProductScorecard } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface ProductScorecardCardProps {
  scorecard: ProductScorecard;
}

const ProductScorecardCard: React.FC<ProductScorecardCardProps> = ({ scorecard }) => {
  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl">Product Opportunity Scorecard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400">Est. Monthly Sales</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{scorecard.estimatedMonthlySales}</div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400">Average BSR</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{scorecard.averageBSR}</div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400">FBA Competitors</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{scorecard.competingFBASellers}</div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400">Sales Velocity</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{scorecard.salesVelocity}</div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Opportunity Summary</h3>
          <p className="text-slate-600 dark:text-slate-400">{scorecard.opportunitySummary}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductScorecardCard;
