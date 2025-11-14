import React, { useState } from 'react';
import { ProductPhotographyPlan, ProductPlan } from '../types';
import { generatePhotographyPlan } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';

const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;

interface ProductPhotographyCardProps {
    productPlan: ProductPlan;
    brandVoice: string;
    plan: ProductPhotographyPlan | null;
    setPlan: (plan: ProductPhotographyPlan | null) => void;
    onPlanModified: () => void;
}

const ProductPhotographyCard: React.FC<ProductPhotographyCardProps> = ({ productPlan, brandVoice, plan, setPlan, onPlanModified }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const result = await generatePhotographyPlan(productPlan, brandVoice);
            setPlan(result);
            onPlanModified();
        } catch (err) {
            console.error(err);
            setError("Failed to generate the photography plan. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const getShotTypePill = (type: string) => {
        const base = 'px-2 py-0.5 rounded-full text-xs font-semibold';
        switch (type) {
            case 'Studio': return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`;
            case 'Lifestyle': return `${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
            case 'Detail': return `${base} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300`;
            default: return `${base} bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300`;
        }
    };

    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <CameraIcon />
                    <div>
                        <CardTitle className="text-2xl md:text-3xl">Product Photography Plan</CardTitle>
                        <CardDescription>A professional shot list to capture your product perfectly.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!plan ? (
                    <div className="text-center p-4">
                        <p className="mb-4 text-slate-600 dark:text-slate-400">Generate a creative and effective shot list for your product photos.</p>
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? 'Generating...' : '📸 Generate Shot List'}
                        </Button>
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {plan.shotList.map((shot, index) => (
                            <div key={index} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-slate-900 dark:text-white">{shot.description}</h4>
                                    <span className={getShotTypePill(shot.type)}>{shot.type}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1"><strong>Creative Direction:</strong> {shot.creativeDirection}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProductPhotographyCard;