import React, { useState } from 'react';
import { PressRelease, ProductPlan } from '../types';
import { generatePressRelease } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';

const NewspaperIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2h0z"/><path d="M4 18h12"/><path d="M12 10h8"/><path d="M12 14h8"/><path d="M16 2v4"/><path d="M8 2v4"/></svg>;

interface PressReleaseCardProps {
    productPlan: ProductPlan;
    brandVoice: string;
    release: PressRelease | null;
    setRelease: (release: PressRelease | null) => void;
    onPlanModified: () => void;
}

const PressReleaseCard: React.FC<PressReleaseCardProps> = ({ productPlan, brandVoice, release, setRelease, onPlanModified }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const result = await generatePressRelease(productPlan, brandVoice);
            setRelease(result);
            onPlanModified();
        } catch (err) {
            console.error(err);
            setError("Failed to generate the press release. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <NewspaperIcon />
                    <div>
                        <CardTitle className="text-2xl md:text-3xl">Press Release</CardTitle>
                        <CardDescription>A draft press release to announce your product launch to the world.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!release ? (
                    <div className="text-center p-4">
                        <p className="mb-4 text-slate-600 dark:text-slate-400">Generate a professional press release to send to media outlets.</p>
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? 'Generating...' : '📰 Generate Press Release'}
                        </Button>
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </div>
                ) : (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg font-serif text-slate-800 dark:text-slate-200 space-y-4">
                        <h3 className="text-2xl font-bold text-center">{release.headline}</h3>
                        <p className="text-lg text-center text-slate-600 dark:text-slate-400">{release.subheadline}</p>
                        <p className="text-sm font-semibold">{release.dateline}</p>
                        <p className="whitespace-pre-wrap">{release.introduction}</p>
                        <p className="whitespace-pre-wrap">{release.body}</p>
                        <div>
                            <h4 className="font-bold">About {productPlan.productTitle}</h4>
                            <p className="text-sm whitespace-pre-wrap">{release.boilerplate}</p>
                        </div>
                        <div>
                            <h4 className="font-bold">Contact:</h4>
                            <p className="text-sm whitespace-pre-wrap">{release.contactInfo}</p>
                        </div>
                        <p className="text-center font-bold">###</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PressReleaseCard;