import React from 'react';
import { SWOTAnalysis } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

// Icons for each SWOT category
const Icons = {
    Strengths: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M17 10V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6h10z"/></svg>,
    Weaknesses: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M7 14V20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6H7z"/></svg>,
    Opportunities: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    Threats: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-3 14h3l-3 6h5l3-14h-3l3-6h-5z"/></svg>,
};

const colors = {
    Strengths: 'text-green-500',
    Weaknesses: 'text-red-500',
    Opportunities: 'text-blue-500',
    Threats: 'text-amber-500',
}

interface SWOTAnalysisCardProps {
  analysis: SWOTAnalysis;
}

const SWOTAnalysisCard: React.FC<SWOTAnalysisCardProps> = ({ analysis }) => {
    const swotItems = [
        { key: 'Strengths', icon: Icons.Strengths, data: analysis.strengths },
        { key: 'Weaknesses', icon: Icons.Weaknesses, data: analysis.weaknesses },
        { key: 'Opportunities', icon: Icons.Opportunities, data: analysis.opportunities },
        { key: 'Threats', icon: Icons.Threats, data: analysis.threats },
    ];
    
    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">SWOT Analysis</CardTitle>
                <CardDescription>A strategic look at your venture's Strengths, Weaknesses, Opportunities, and Threats.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {swotItems.map(({ key, icon: Icon, data }) => (
                        <div key={key} className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg">
                            <h3 className={`flex items-center gap-2 font-bold text-lg mb-3 ${colors[key as keyof typeof colors]}`}>
                                <Icon />
                                {key}
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                                {data.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default SWOTAnalysisCard;