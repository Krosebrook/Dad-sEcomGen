

import React from 'react';
import { InfluencerMarketingPlan } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const CheckSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;

interface InfluencerMarketingCardProps {
    plan: InfluencerMarketingPlan;
}

const InfluencerMarketingCard: React.FC<InfluencerMarketingCardProps> = ({ plan }) => {
    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <CameraIcon />
                    <div>
                        <CardTitle className="text-2xl md:text-3xl">Influencer Marketing Plan</CardTitle>
                        <CardDescription>A strategy to leverage influencers for your brand.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200 flex items-center gap-2"><UsersIcon /> Influencer Tiers</h4>
                        <div className="flex flex-wrap gap-2">
                             {plan.influencerTiers.map(tier => <span key={tier} className="bg-slate-200 text-slate-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">{tier}</span>)}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200 flex items-center gap-2"><CheckSquareIcon /> KPIs to Track</h4>
                         <div className="flex flex-wrap gap-2">
                            {plan.kpiToTrack.map(kpi => <span key={kpi} className="bg-slate-200 text-slate-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">{kpi}</span>)}
                        </div>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200 flex items-center gap-2"><SendIcon /> Outreach Template</h4>
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{plan.outreachTemplate}</div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Campaign Ideas</h4>
                    <div className="space-y-3">
                        {plan.campaignIdeas.map((idea, index) => (
                            <div key={index} className="p-3 border-l-4 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50">
                                <h5 className="font-bold text-slate-900 dark:text-white">{idea.ideaName}</h5>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{idea.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default InfluencerMarketingCard;