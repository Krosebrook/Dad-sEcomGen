import React, { useState, useCallback } from 'react';
import { ProductPlan, CustomerPersona, SeoStrategy } from '../types';
import { generateSeoStrategy } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';

interface SeoStrategyCardProps {
    productPlan: ProductPlan;
    customerPersona: CustomerPersona;
    brandVoice: string;
    seoStrategy: SeoStrategy | null;
    setSeoStrategy: React.Dispatch<React.SetStateAction<SeoStrategy | null>>;
    onPlanModified: () => void;
}

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
)

const SeoStrategyCard: React.FC<SeoStrategyCardProps> = ({
    productPlan,
    customerPersona,
    brandVoice,
    seoStrategy,
    setSeoStrategy,
    onPlanModified
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateStrategy = useCallback(async () => {
        if (!customerPersona) {
            setError("A customer persona is required to generate an SEO strategy.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const strategy = await generateSeoStrategy(productPlan, customerPersona, brandVoice);
            setSeoStrategy(strategy);
            onPlanModified();
        } catch (err) {
            console.error(err);
            setError("Failed to generate SEO strategy. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }, [productPlan, customerPersona, brandVoice, setSeoStrategy, onPlanModified]);

    const getCompetitionColor = (level: 'Low' | 'Medium' | 'High') => {
        switch(level) {
            case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        }
    };
     const getRelevanceColor = (level: 'Low' | 'Medium' | 'High') => {
        switch(level) {
            case 'High': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Medium': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
            case 'Low': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            default: return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">Advanced SEO Strategy Hub</CardTitle>
                <CardDescription>A data-driven plan to boost your search engine ranking, powered by Google Search.</CardDescription>
            </CardHeader>
            <CardContent>
                {!seoStrategy ? (
                    <div className="text-center p-4">
                        <p className="mb-4 text-slate-600 dark:text-slate-400">Analyze keyword competition and generate an optimal content strategy to attract your target audience.</p>
                        <Button onClick={handleGenerateStrategy} disabled={isGenerating || !customerPersona}>
                            {isGenerating ? 'Analyzing...' : '📈 Generate SEO Strategy'}
                        </Button>
                         {!customerPersona && <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">Requires a Customer Persona from the Market step.</p>}
                         {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {error && <p className="text-red-500 text-center">{error}</p>}
                        
                        {/* Strategy Summary */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Strategy Summary</h3>
                            <p className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-slate-700 dark:text-slate-300">{seoStrategy.strategySummary}</p>
                        </div>

                        {/* Keyword Analysis */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Keyword Analysis</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-100 dark:bg-slate-800">
                                        <tr>
                                            <th className="p-3 font-semibold">Keyword</th>
                                            <th className="p-3 font-semibold">Competition</th>
                                            <th className="p-3 font-semibold">Monthly Searches</th>
                                            <th className="p-3 font-semibold">Relevance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {seoStrategy.keywordAnalysis.map((kw, index) => (
                                            <tr key={index} className="border-b border-slate-200 dark:border-slate-700">
                                                <td className="p-2 font-medium">{kw.keyword}</td>
                                                <td className="p-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCompetitionColor(kw.competition)}`}>{kw.competition}</span>
                                                </td>
                                                <td className="p-2 font-mono">{kw.monthlySearches}</td>
                                                <td className="p-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRelevanceColor(kw.relevance)}`}>{kw.relevance}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Content Angle Ideas */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Content Angle Ideas</h3>
                            <div className="space-y-3">
                                {seoStrategy.contentAngleIdeas.map((idea, index) => (
                                    <div key={index} className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                        <h4 className="font-bold text-slate-900 dark:text-white">{idea.title}</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{idea.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content Calendar */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">30-Day Content Calendar</h3>
                            <div className="space-y-4">
                                {seoStrategy.contentCalendar.map(week => (
                                    <div key={week.week} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                                        <h4 className="font-bold text-slate-900 dark:text-white">Week {week.week}: <span className="font-normal">{week.theme}</span></h4>
                                        <div className="mt-2 pl-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                            {week.dailyPosts.map((post, index) => (
                                                <p key={index} className="text-sm text-slate-600 dark:text-slate-400">
                                                    <strong className="text-slate-700 dark:text-slate-300">{post.platform}:</strong> {post.idea}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sources */}
                         {seoStrategy.sources && seoStrategy.sources.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Sources</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {seoStrategy.sources.map((source, index) => (
                                        <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5">
                                            <LinkIcon />
                                            {source.title || new URL(source.uri).hostname}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SeoStrategyCard;
