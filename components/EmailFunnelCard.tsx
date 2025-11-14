import React, { useState } from 'react';
import { EmailFunnel, ProductPlan, CustomerPersona } from '../types';
import { generateEmailFunnel } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';

const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;

interface EmailFunnelCardProps {
    productPlan: ProductPlan;
    customerPersona: CustomerPersona | null;
    brandVoice: string;
    funnel: EmailFunnel | null;
    setFunnel: (funnel: EmailFunnel | null) => void;
    onPlanModified: () => void;
}

const EmailFunnelCard: React.FC<EmailFunnelCardProps> = ({ productPlan, customerPersona, brandVoice, funnel, setFunnel, onPlanModified }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!customerPersona) {
            setError("Customer Persona is required to generate an email funnel.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const result = await generateEmailFunnel(productPlan, customerPersona, brandVoice);
            setFunnel(result);
            onPlanModified();
        } catch (err) {
            console.error(err);
            setError("Failed to generate the email funnel. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <MailIcon />
                    <div>
                        <CardTitle className="text-2xl md:text-3xl">Email Marketing Funnel</CardTitle>
                        <CardDescription>Automated email sequences to nurture and convert customers.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!funnel ? (
                    <div className="text-center p-4">
                        <p className="mb-4 text-slate-600 dark:text-slate-400">Generate essential automated emails for your marketing funnel.</p>
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? 'Generating...' : '📧 Generate Email Funnel'}
                        </Button>
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {funnel.emails.map((email, index) => (
                            <details key={index} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg group" open={index === 0}>
                                <summary className="font-bold text-lg text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                                    <div>
                                        {email.name}
                                        <p className="text-xs font-normal text-slate-500 dark:text-slate-400">Timing: {email.timing}</p>
                                    </div>
                                    <span className="text-slate-500 transform-gpu transition-transform duration-200 group-open:rotate-90">&#9656;</span>
                                </summary>
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                    <h5 className="font-semibold text-slate-800 dark:text-slate-200">Subject: <span className="font-normal">{email.subject}</span></h5>
                                    <div>
                                        <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Body:</h5>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap p-3 bg-white dark:bg-slate-800 rounded-md">{email.body}</p>
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default EmailFunnelCard;