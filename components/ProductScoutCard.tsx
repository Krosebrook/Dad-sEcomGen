import React from 'react';
import { ProductScoutResult } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';

// Icons for visual flair
const TrendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>;
const SupplierIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const AmazonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.56 12.24a5.41 5.41 0 0 1-1.12 1.12"/><path d="m14.07 15.22 3.33 3.33"/><path d="M18.66 14a8 8 0 1 0-1.34 1.34"/><path d="M14.61 10.39 12 13l-2.61-2.61a3 3 0 0 1 5.22 0Z"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface ProductScoutCardProps {
  result: ProductScoutResult;
  onSelect: (productName: string) => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 8) return 'text-green-500';
  if (score >= 5) return 'text-yellow-500';
  return 'text-red-500';
};

const ProductScoutCard: React.FC<ProductScoutCardProps> = ({ result, onSelect }) => {
  return (
    <Card className="w-full text-left animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div>
                <CardTitle className="text-xl">{result.productName}</CardTitle>
                <CardDescription>{result.description}</CardDescription>
            </div>
            <div className="flex-shrink-0 text-center">
                 <div className={`text-4xl font-bold ${getScoreColor(result.trendScore)}`}>
                    {result.trendScore}<span className="text-xl text-slate-400">/10</span>
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Trend Score</div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2"><TrendIcon/> Sales Forecast</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">{result.salesForecast}</p>
        </div>
        <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><SupplierIcon/> Potential Suppliers</h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
                {result.potentialSuppliers.map((supplier, index) => (
                    <li key={index} className="text-slate-600 dark:text-slate-300">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{supplier.platform}:</span> {supplier.notes}
                    </li>
                ))}
            </ul>
        </div>
        <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><AmazonIcon/> Amazon Selling Strategy</h4>
             <div className="space-y-2 text-sm">
                <p><strong className="text-slate-800 dark:text-slate-200">Key Services:</strong> <span className="text-slate-600 dark:text-slate-300">{result.amazonSellingStrategy.keyServices.join(', ')}</span></p>
                <p><strong className="text-slate-800 dark:text-slate-200">Shipping:</strong> <span className="text-slate-600 dark:text-slate-300">{result.amazonSellingStrategy.shippingRecommendation}</span></p>
                <div>
                     <strong className="text-slate-800 dark:text-slate-200 block mb-1">Compliance Checklist:</strong>
                     <ul className="space-y-1">
                        {result.amazonSellingStrategy.complianceChecklist.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                                <CheckCircleIcon className="mt-1 flex-shrink-0 text-green-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
        <div className="flex justify-end pt-2">
            <Button onClick={() => onSelect(result.productName)}>Use This Idea</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductScoutCard;