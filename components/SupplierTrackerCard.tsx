import React, { useState } from 'react';
import { SupplierQuote } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

interface SupplierTrackerCardProps {
  quotes: SupplierQuote[];
  onQuotesChange: (newQuotes: SupplierQuote[]) => void;
  currency: string;
}

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const formatCurrency = (cents: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
};

const SupplierTrackerCard: React.FC<SupplierTrackerCardProps> = ({ quotes, onQuotesChange, currency }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [moq, setMoq] = useState('');

    const handleAddQuote = (e: React.FormEvent) => {
        e.preventDefault();
        const priceCents = Math.round(parseFloat(price) * 100);
        const moqNum = parseInt(moq, 10);

        if (name.trim() && !isNaN(priceCents) && !isNaN(moqNum)) {
            const newQuote: SupplierQuote = {
                id: Date.now().toString(),
                name: name.trim(),
                pricePerUnitCents: priceCents,
                moq: moqNum,
            };
            onQuotesChange([...quotes, newQuote]);
            setName('');
            setPrice('');
            setMoq('');
        }
    };

    const handleDeleteQuote = (id: string) => {
        onQuotesChange(quotes.filter(q => q.id !== id));
    };

    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">Supplier & Sourcing Tracker</CardTitle>
                <CardDescription>Track quotes from potential suppliers to refine your cost of goods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {quotes.length > 0 && (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                                <tr>
                                <th className="p-3 font-semibold">Supplier Name</th>
                                <th className="p-3 font-semibold">Price per Unit</th>
                                <th className="p-3 font-semibold">Min. Order (MOQ)</th>
                                <th className="p-3 font-semibold"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotes.map(quote => (
                                <tr key={quote.id} className="border-b border-slate-200 dark:border-slate-700">
                                    <td className="p-2 font-medium">{quote.name}</td>
                                    <td className="p-2">{formatCurrency(quote.pricePerUnitCents, currency)}</td>
                                    <td className="p-2">{quote.moq} units</td>
                                    <td className="p-2 text-right">
                                        <button onClick={() => handleDeleteQuote(quote.id)} className="p-1 text-slate-500 hover:text-red-500" aria-label={`Delete quote from ${quote.name}`}>
                                            <TrashIcon />
                                        </button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 <form onSubmit={handleAddQuote} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Add New Quote</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 items-end">
                        <div className="sm:col-span-2 md:col-span-1">
                            <Label htmlFor="supplier-name">Supplier Name</Label>
                            <Input id="supplier-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Alibaba Vendor" className="h-10" />
                        </div>
                        <div>
                            <Label htmlFor="supplier-price">Price/Unit ({currency})</Label>
                            <Input id="supplier-price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="12.50" min="0" step="0.01" className="h-10" />
                        </div>
                         <div>
                            <Label htmlFor="supplier-moq">MOQ</Label>
                            <Input id="supplier-moq" type="number" value={moq} onChange={e => setMoq(e.target.value)} placeholder="500" min="1" step="1" className="h-10" />
                        </div>
                        <Button type="submit" className="w-full h-10">Add Quote</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default SupplierTrackerCard;