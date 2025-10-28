
import React from 'react';
import { CustomerSupportPlaybook } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

const HeadsetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/><path d="M3 14a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2"/></svg>;

interface CustomerSupportCardProps {
    playbook: CustomerSupportPlaybook;
}

const CustomerSupportCard: React.FC<CustomerSupportCardProps> = ({ playbook }) => {
    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <HeadsetIcon />
                    <div>
                        <CardTitle className="text-2xl md:text-3xl">Customer Support Playbook</CardTitle>
                        <CardDescription>Your guide to providing excellent customer service.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                        <h4 className="font-semibold mb-1 text-slate-800 dark:text-slate-200">Tone of Voice</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{playbook.toneOfVoice}</p>
                    </div>
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                        <h4 className="font-semibold mb-1 text-slate-800 dark:text-slate-200">Return Policy Summary</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{playbook.returnPolicySummary}</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Frequently Asked Questions</h3>
                    <div className="space-y-2">
                        {playbook.faq.map((item, index) => (
                             <details key={index} className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg group">
                                <summary className="font-medium text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                                    {item.question}
                                    <span className="text-slate-500 group-open:rotate-90 transition-transform">&#9656;</span>
                                </summary>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">{item.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Sample Responses</h3>
                    <div className="space-y-3">
                        {playbook.sampleResponses.map((res, index) => (
                            <div key={index} className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                <h4 className="font-semibold text-slate-900 dark:text-white">{res.scenario}</h4>
                                <blockquote className="mt-1 text-sm text-slate-600 dark:text-slate-400 border-l-2 border-slate-300 dark:border-slate-600 pl-3 italic">"{res.response}"</blockquote>
                            </div>
                        ))}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

export default CustomerSupportCard;
