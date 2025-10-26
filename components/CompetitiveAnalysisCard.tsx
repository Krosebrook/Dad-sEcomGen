import React from 'react';
import { CompetitiveAnalysis } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

interface CompetitiveAnalysisCardProps {
  analysis: CompetitiveAnalysis;
}

const getScoreColor = (score: number): string => {
  if (score >= 8) return 'text-green-500';
  if (score >= 5) return 'text-yellow-500';
  return 'text-red-500';
};

const ThumbsUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 flex-shrink-0"><path d="M7 10v12"/><path d="M17 10V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6h10z"/></svg>
);

const ThumbsDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mr-2 flex-shrink-0"><path d="M17 14V2"/><path d="M7 14V20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6H7z"/></svg>
);

const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2 flex-shrink-0"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
)

const CompetitiveAnalysisCard: React.FC<CompetitiveAnalysisCardProps> = ({ analysis }) => {
  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl">Competitive Intelligence</CardTitle>
                <CardDescription>Market analysis powered by Google Search.</CardDescription>
            </div>
            <div className="text-center">
                 <div className={`text-5xl font-bold ${getScoreColor(analysis.opportunityScore)}`}>
                    {analysis.opportunityScore}<span className="text-2xl text-slate-400">/10</span>
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Opportunity Score</div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Market Summary</h3>
          <p className="text-slate-600 dark:text-slate-400">{analysis.marketSummary}</p>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Competitor Snapshot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.competitors.map((competitor, index) => (
                    <div key={index} className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg">
                        <h4 className="font-bold text-slate-900 dark:text-white">{competitor.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Price: {competitor.estimatedPriceRange}</p>
                        <div className="space-y-2">
                            <div>
                                <h5 className="font-semibold text-sm mb-1 flex items-center"><ThumbsUpIcon /> Strengths</h5>
                                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 pl-2 space-y-1">
                                    {competitor.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                             <div>
                                <h5 className="font-semibold text-sm mb-1 flex items-center"><ThumbsDownIcon /> Weaknesses</h5>
                                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 pl-2 space-y-1">
                                    {competitor.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">How to Stand Out</h3>
             <ul className="space-y-3">
                {analysis.differentiationStrategies.map((strategy, index) => (
                    <li key={index} className="flex items-start p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                        <TargetIcon />
                        <span className="text-slate-700 dark:text-slate-300">{strategy}</span>
                    </li>
                ))}
            </ul>
        </div>
        
        {analysis.sources && analysis.sources.length > 0 && (
            <div>
                 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Sources</h3>
                 <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {analysis.sources.map((source, index) => (
                         <a 
                            key={index} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5"
                        >
                            <LinkIcon />
                            {source.title || new URL(source.uri).hostname}
                        </a>
                    ))}
                 </div>
            </div>
        )}

      </CardContent>
    </Card>
  );
};

export default CompetitiveAnalysisCard;
