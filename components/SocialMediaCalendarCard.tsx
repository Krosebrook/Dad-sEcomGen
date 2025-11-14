import React, { useState } from 'react';
import { SocialMediaCalendar, ProductPlan, CustomerPersona } from '../types';
import { generateSocialMediaCalendar } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';

const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

interface SocialMediaCalendarCardProps {
    productPlan: ProductPlan;
    customerPersona: CustomerPersona | null;
    brandVoice: string;
    calendar: SocialMediaCalendar | null;
    setCalendar: (calendar: SocialMediaCalendar | null) => void;
    onPlanModified: () => void;
}

const SocialMediaCalendarCard: React.FC<SocialMediaCalendarCardProps> = ({ productPlan, customerPersona, brandVoice, calendar, setCalendar, onPlanModified }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!customerPersona) {
            setError("Customer Persona is required to generate a social media calendar.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const result = await generateSocialMediaCalendar(productPlan, customerPersona, brandVoice);
            setCalendar(result);
            onPlanModified();
        } catch (err) {
            console.error(err);
            setError("Failed to generate the social media calendar. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <CalendarIcon />
                    <div>
                        <CardTitle className="text-2xl md:text-3xl">Social Media Calendar</CardTitle>
                        <CardDescription>A 4-week content plan to build hype and engage your audience.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!calendar ? (
                    <div className="text-center p-4">
                        <p className="mb-4 text-slate-600 dark:text-slate-400">Generate a structured 4-week social media plan to guide your launch.</p>
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? 'Generating...' : '📅 Generate Calendar'}
                        </Button>
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {calendar.weeks.map((week, index) => (
                             <details key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg group" open={index === 0}>
                                <summary className="font-bold text-xl text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                                    Week {week.weekNumber}: {week.theme}
                                    <span className="text-slate-500 transform-gpu transition-transform duration-200 group-open:rotate-90">&#9656;</span>
                                </summary>
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                    {week.posts.map((post, postIndex) => (
                                        <div key={postIndex} className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-md">
                                            <h5 className="font-semibold text-slate-800 dark:text-slate-200">{post.day} on {post.platform}</h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1"><strong>Idea:</strong> {post.idea}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1"><em>Visual: {post.visualPrompt}</em></p>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SocialMediaCalendarCard;