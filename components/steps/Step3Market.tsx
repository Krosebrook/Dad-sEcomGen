import React, { useState, useEffect } from 'react';
import { CompetitiveAnalysis } from '../../types';
import { generateCompetitiveAnalysis } from '../../services/geminiService';
import CompetitiveAnalysisCard from '../CompetitiveAnalysisCard';
import { Button } from '../ui/Button';

interface Step3MarketProps {
    productIdea: string;
    brandVoice: string;
    analysis: CompetitiveAnalysis | null;
    setAnalysis: React.Dispatch<React.SetStateAction<CompetitiveAnalysis | null>>;
    onNavigateToLaunchpad: () => void;
    onBack: () => void;
}

const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="flex justify-center items-center flex-col gap-4 p-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
        <svg className="animate-spin h-8 w-8 text-slate-600 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
    </div>
);


const Step3Market: React.FC<Step3MarketProps> = ({
    productIdea,
    brandVoice,
    analysis,
    setAnalysis,
    onNavigateToLaunchpad,
    onBack,
}) => {
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    useEffect(() => {
        if (!analysis && productIdea) {
            const fetchAnalysis = async () => {
                setIsAnalyzing(true);
                setAnalysisError(null);
                try {
                    const result = await generateCompetitiveAnalysis(productIdea, brandVoice);
                    setAnalysis(result);
                } catch (err) {
                    console.error(err);
                    setAnalysisError('Failed to generate competitive analysis. Please try again.');
                } finally {
                    setIsAnalyzing(false);
                }
            };
            fetchAnalysis();
        }
    }, [analysis, productIdea, setAnalysis, brandVoice]);


    return (
        <div className="w-full max-w-4xl space-y-8 animate-fade-in">
            {analysisError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
                    <p>{analysisError}</p>
                </div>
            )}
            {isAnalyzing && <LoadingSpinner message="Analyzing market intelligence..." />}
            {analysis && !isAnalyzing && <CompetitiveAnalysisCard analysis={analysis} />}
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={onNavigateToLaunchpad} disabled={!analysis || isAnalyzing}>
                    {'Next: Plan Launch'}
                </Button>
            </div>
        </div>
    );
};

export default Step3Market;