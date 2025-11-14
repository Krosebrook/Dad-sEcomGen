import React, { useState } from 'react';
import { ABTestPlan, ProductPlan, CustomerPersona } from '../types';
import { generateABTestingIdeas } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';

const BeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><path d="M10 13a2 2 0 0 0-2-2H7v4h1a2 2 0 0 0 2-2Z"/><path d="M17 11h-1a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h1"/></svg>;

interface ABTestingCardProps {
    productPlan: ProductPlan;
    customerPersona: CustomerPersona | null;
    testPlan: ABTestPlan | null;
    setTestPlan: (plan: ABTestPlan | null) => void;
    onPlanModified: () => void;
}

const ABTestingCard: React.FC<ABTestingCardProps> = ({ productPlan, customerPersona, testPlan, setTestPlan, onPlanModified }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!customerPersona) {
            setError("Customer Persona is required to generate A/B test ideas.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const result = await generateABTestingIdeas(productPlan, customerPersona);
            setTestPlan(result);
            onPlanModified();
        } catch (err) {
            console.error(err);
            setError("Failed to generate A/B testing ideas. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <BeakerIcon />
                    <div>
                        <CardTitle className="text-2xl md:text-3xl">A/B Testing Ideas</CardTitle>
                        <CardDescription>Ideas to optimize your product page for higher conversions.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!testPlan ? (
                    <div className="text-center p-4">
                        <p className="mb-4 text-slate-600 dark:text-slate-400">Generate data-driven A/B test ideas to improve your sales.</p>
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? 'Generating...' : '💡 Generate Test Ideas'}
                        </Button>
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {testPlan.tests.map((test, index) => (
                            <div key={index} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                <h4 className="font-bold text-slate-900 dark:text-white">Test: {test.element}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 italic"><strong>Hypothesis:</strong> {test.hypothesis}</p>
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {test.variations.map((v, vIndex) => (
                                        <div key={vIndex} className="p-3 bg-white dark:bg-slate-800 rounded-md">
                                            <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{v.name}</h5>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{v.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ABTestingCard;