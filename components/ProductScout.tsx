import React, { useState } from 'react';
import { ProductScoutResult } from '../types';
import { scoutTrendingProducts } from '../services/geminiService';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import ProductScoutCard from './ProductScoutCard';

interface ProductScoutProps {
    onClose: () => void;
    onSelectIdea: (idea: string) => void;
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center flex-col gap-4 p-8">
        <svg className="animate-spin h-8 w-8 text-slate-600 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-600 dark:text-slate-400">Scouting for trending products...</p>
    </div>
);

const ProductScout: React.FC<ProductScoutProps> = ({ onClose, onSelectIdea }) => {
    const [category, setCategory] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<ProductScoutResult[]>([]);

    const handleScout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const scoutResults = await scoutTrendingProducts(category);
            setResults(scoutResults);
        } catch (err) {
            console.error(err);
            setError('Failed to scout for products. The market is quiet today, please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExampleClick = (exampleCategory: string) => {
        setCategory(exampleCategory);
    };

    const exampleCategories = ["Kitchen Gadgets", "Home Office", "Outdoor Gear", "Pet Supplies"];

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-100 dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Amazon Product Scout</h2>
                    <p className="text-slate-500 dark:text-slate-400">Discover trending products with high potential on Amazon.</p>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto">
                    <form onSubmit={handleScout} className="space-y-4 mb-6">
                         <Input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Enter a product category, e.g., 'sustainable home goods'"
                            className="text-lg"
                            disabled={isLoading}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Examples:</span>
                            {exampleCategories.map(ex => (
                                <button key={ex} type="button" onClick={() => handleExampleClick(ex)} className="px-2 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">{ex}</button>
                            ))}
                        </div>
                        <Button type="submit" disabled={isLoading || !category.trim()} className="w-full sm:w-auto">
                            {isLoading ? 'Scouting...' : 'Scout for Products'}
                        </Button>
                    </form>

                    {isLoading && <LoadingSpinner />}
                    {error && (
                        <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">{error}</div>
                    )}
                    {results.length > 0 && (
                        <div className="space-y-6">
                            {results.map((result, index) => (
                                <ProductScoutCard key={index} result={result} onSelect={onSelectIdea} />
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-right">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
};

export default ProductScout;