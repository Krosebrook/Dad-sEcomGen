import React from 'react';
import { AdCampaign } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

interface AdCampaignGeneratorCardProps {
    campaigns: AdCampaign[];
}

const MegaphoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;


const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

const AdCampaignGeneratorCard: React.FC<AdCampaignGeneratorCardProps> = ({ campaigns }) => {
    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <MegaphoneIcon />
                    <div>
                        <CardTitle className="text-2xl md:text-3xl">Ad Campaign Strategy</CardTitle>
                        <CardDescription>Generated ad campaigns for various platforms.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {campaigns.map((campaign, index) => (
                    <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{campaign.platform}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4"><strong>Objective:</strong> {campaign.objective}</p>
                        <div className="space-y-4">
                            {campaign.adSets.map((adSet, adSetIndex) => (
                                <div key={adSetIndex} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">{adSet.adSetName}</h4>
                                    <div className="mt-2 space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <TargetIcon className="mt-0.5 flex-shrink-0 text-slate-500" />
                                            <p><strong className="text-slate-700 dark:text-slate-300">Targeting:</strong> {adSet.targetingSummary}</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <DollarSignIcon className="mt-0.5 flex-shrink-0 text-slate-500" />
                                            <p><strong className="text-slate-700 dark:text-slate-300">Budget:</strong> {formatCurrency(adSet.dailyBudgetCents)} / day</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <LightbulbIcon className="mt-0.5 flex-shrink-0 text-slate-500" />
                                            <div>
                                                <strong className="text-slate-700 dark:text-slate-300">Creative Notes:</strong>
                                                <ul className="list-disc list-inside pl-2">
                                                    {adSet.adCreativeNotes.map((note, noteIndex) => <li key={noteIndex}>{note}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default AdCampaignGeneratorCard;