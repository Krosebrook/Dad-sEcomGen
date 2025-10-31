import React, { useState } from 'react';
import { SupplierQuote, SupplierSuggestion, ProductPlan, CustomerPersona } from '../types';
import { generateSupplierSuggestions } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';

interface SupplierTrackerCardProps {
  quotes: SupplierQuote[];
  onQuotesChange: (newQuotes: SupplierQuote[]) => void;
  currency: string;
  productPlan: ProductPlan;
  customerPersona: CustomerPersona | null;
  suggestions: SupplierSuggestion[] | null;
  onSuggestionsChange: (newSuggestions: SupplierSuggestion[]) => void;
}

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);


const formatCurrency = (cents: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
};

const SupplierTrackerCard: React.FC<SupplierTrackerCardProps> = ({ quotes, onQuotesChange, currency, productPlan, customerPersona, suggestions, onSuggestionsChange }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [moq, setMoq] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [notes, setNotes] = useState('');
    const [isScouting, setIsScouting] = useState(false);
    const [scoutError, setScoutError] = useState<string | null>(null);
    const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

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
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                website: website.trim() || undefined,
                notes: notes.trim() || undefined,
            };
            onQuotesChange([...quotes, newQuote]);
            setName('');
            setPrice('');
            setMoq('');
            setEmail('');
            setPhone('');
            setWebsite('');
            setNotes('');
        }
    };

    const handleDeleteQuote = (id: string) => {
        onQuotesChange(quotes.filter(q => q.id !== id));
    };

    const handleToggleExpand = (id: string) => {
        setExpandedQuoteId(prev => (prev === id ? null : id));
    };

    const handleScoutSuppliers = async () => {
        if (!productPlan || !customerPersona) {
            setScoutError("Product plan and customer persona must be generated first.");
            return;
        }
        setIsScouting(true);
        setScoutError(null);
        try {
            const newSuggestions = await generateSupplierSuggestions(productPlan, customerPersona);
            onSuggestionsChange(newSuggestions);
        } catch (error) {
            console.error("Failed to scout suppliers:", error);
            setScoutError("Could not generate supplier suggestions. Please try again.");
        } finally {
            setIsScouting(false);
        }
    };

    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">Supplier & Sourcing Tracker</CardTitle>
                <CardDescription>Track quotes from potential suppliers to refine your cost of goods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* AI Supplier Scouting */}
                <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg space-y-4">
                     <h4 className="font-semibold text-slate-800 dark:text-slate-200">AI Supplier Scouting</h4>
                     {!suggestions && !isScouting && (
                         <div className="text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Let AI suggest potential suppliers based on your product materials and target audience.</p>
                            <Button onClick={handleScoutSuppliers} disabled={isScouting || !customerPersona}>
                                {isScouting ? 'Scouting...' : '🤖 Scout for Suppliers'}
                            </Button>
                         </div>
                     )}
                     {isScouting && (
                        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                           <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           <span>Finding potential partners...</span>
                        </div>
                     )}
                     {scoutError && <p className="text-sm text-center text-red-500">{scoutError}</p>}
                     {suggestions && suggestions.length > 0 && (
                        <div className="space-y-3">
                            {suggestions.map((s, i) => (
                                <div key={i} className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <h5 className="font-bold text-slate-900 dark:text-white">{s.supplierName}</h5>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.location} - {s.specialty}</p>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => { 
                                            setName(s.supplierName); 
                                            setWebsite(s.contactWebsite || ''); 
                                            setNotes(s.notes || '');
                                            setEmail(s.email || '');
                                            setPhone(s.phone || '');
                                            setMoq(s.moq ? String(s.moq) : '');
                                            setPrice('');
                                        }}>+ Add to Tracker</Button>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{s.notes}</p>
                                     <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-sm space-y-1">
                                        {s.moq && <p><strong className="text-slate-700 dark:text-slate-300">Est. MOQ:</strong> {s.moq.toLocaleString()} units</p>}
                                        {s.email && <p><strong className="text-slate-700 dark:text-slate-300">Email:</strong> {s.email}</p>}
                                        {s.phone && <p><strong className="text-slate-700 dark:text-slate-300">Phone:</strong> {s.phone}</p>}
                                        {s.contactWebsite &&
                                            <a href={s.contactWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5">
                                                <LinkIcon /> Visit Website
                                            </a>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}
                </div>

                {quotes.length > 0 && (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                                <tr>
                                <th className="p-3 font-semibold">Supplier Name</th>
                                <th className="p-3 font-semibold">Price per Unit</th>
                                <th className="p-3 font-semibold">Min. Order (MOQ)</th>
                                <th className="p-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotes.map(quote => (
                                <React.Fragment key={quote.id}>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <td className="p-2 font-medium">{quote.name}</td>
                                        <td className="p-2">{formatCurrency(quote.pricePerUnitCents, currency)}</td>
                                        <td className="p-2">{quote.moq} units</td>
                                        <td className="p-2 text-right">
                                           <div className="flex justify-end items-center gap-1">
                                                <button onClick={() => handleDeleteQuote(quote.id)} className="p-1 text-slate-500 hover:text-red-500" aria-label={`Delete quote from ${quote.name}`}>
                                                    <TrashIcon />
                                                </button>
                                                <button onClick={() => handleToggleExpand(quote.id)} className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white" aria-label={`View details for ${quote.name}`}>
                                                    <ChevronDownIcon className={`transition-transform duration-200 ${expandedQuoteId === quote.id ? 'rotate-180' : ''}`} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedQuoteId === quote.id && (
                                        <tr className="bg-slate-50 dark:bg-slate-900/50">
                                            <td colSpan={4} className="p-4 space-y-2 text-sm">
                                                {quote.email && <div><strong>Email:</strong> <a href={`mailto:${quote.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">{quote.email}</a></div>}
                                                {quote.phone && <div><strong>Phone:</strong> {quote.phone}</div>}
                                                {quote.website && <div><strong>Website:</strong> <a href={quote.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{quote.website}</a></div>}
                                                {quote.notes && <div className="pt-2 border-t border-slate-200 dark:border-slate-700 mt-2"><strong>Notes:</strong><p className="whitespace-pre-wrap mt-1">{quote.notes}</p></div>}
                                                {(!quote.email && !quote.phone && !quote.website && !quote.notes) && <p className="text-slate-500">No additional details provided.</p>}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 <form onSubmit={handleAddQuote} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg space-y-4">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Add New Quote</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="supplier-name">Supplier Name*</Label>
                            <Input id="supplier-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Global Textiles" className="h-10" required />
                        </div>
                        <div>
                            <Label htmlFor="supplier-price">Price/Unit ({currency})*</Label>
                            <Input id="supplier-price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="12.50" min="0" step="0.01" className="h-10" required />
                        </div>
                        <div>
                            <Label htmlFor="supplier-moq">MOQ*</Label>
                            <Input id="supplier-moq" type="number" value={moq} onChange={e => setMoq(e.target.value)} placeholder="500" min="1" step="1" className="h-10" required />
                        </div>
                        <div>
                            <Label htmlFor="supplier-email">Email</Label>
                            <Input id="supplier-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@supplier.com" className="h-10" />
                        </div>
                        <div>
                            <Label htmlFor="supplier-phone">Phone</Label>
                            <Input id="supplier-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" className="h-10" />
                        </div>
                        <div>
                            <Label htmlFor="supplier-website">Website</Label>
                            <Input id="supplier-website" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://supplier.com" className="h-10" />
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="supplier-notes">Notes</Label>
                        <Textarea id="supplier-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Initial contact made, sample requested..." className="min-h-[80px]" />
                    </div>
                    <div className="text-right">
                        <Button type="submit">Add Quote</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default SupplierTrackerCard;