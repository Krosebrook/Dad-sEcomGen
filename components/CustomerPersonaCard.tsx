import React, { useState, useEffect } from 'react';
import { CustomerPersona } from '../types';
import { generatePersonaAvatar } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

// Icons for each persona section
const Icons = {
    Demographics: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Motivations: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 2.5c4.142 0 7.5 3.358 7.5 7.5 0 2.25-1 4.313-2.61 5.61L22 22l-4.89-4.89C15.813 18 13.75 19 11.5 19c-4.142 0-7.5-3.358-7.5-7.5S7.358 4 11.5 4"/><path d="M11.5 11.5 2 22"/></svg>,
    Goals: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    PainPoints: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>,
};


interface CustomerPersonaCardProps {
  persona: CustomerPersona;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
}

const AvatarPlaceholder: React.FC = () => (
    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
         <svg className="w-16 h-16 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
    </div>
);

const CustomerPersonaCard: React.FC<CustomerPersonaCardProps> = ({ persona, avatarUrl, setAvatarUrl }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    
    useEffect(() => {
        if (persona && !avatarUrl && !isGenerating) {
            const generateAvatar = async () => {
                setIsGenerating(true);
                try {
                    const url = await generatePersonaAvatar(persona.avatarPrompt);
                    setAvatarUrl(url);
                } catch (error) {
                    console.error("Failed to generate persona avatar:", error);
                    // Handle error if needed, maybe set a default avatar
                } finally {
                    setIsGenerating(false);
                }
            };
            generateAvatar();
        }
    }, [persona, avatarUrl, isGenerating, setAvatarUrl]);


    const personaSections = [
        { key: 'Demographics', icon: Icons.Demographics, data: persona.demographics },
        { key: 'Motivations', icon: Icons.Motivations, data: persona.motivations },
        { key: 'Goals', icon: Icons.Goals, data: persona.goals },
        { key: 'PainPoints', label: 'Pain Points', icon: Icons.PainPoints, data: persona.painPoints },
    ];

    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-center p-2">
                         {avatarUrl ? (
                            <img src={avatarUrl} alt={persona.name} className="w-full h-full object-cover rounded-full" />
                        ) : isGenerating ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg className="animate-spin h-8 w-8 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : (
                           <AvatarPlaceholder />
                        )}
                    </div>
                     <div className="flex-grow">
                        <CardTitle className="text-2xl md:text-3xl">{persona.name}</CardTitle>
                        <CardDescription>{persona.age}, {persona.occupation}</CardDescription>
                        <blockquote className="mt-4 border-l-4 border-slate-300 dark:border-slate-700 pl-4 italic text-slate-600 dark:text-slate-400">
                            "{persona.quote}"
                        </blockquote>
                        <p className="mt-4 text-slate-700 dark:text-slate-300">{persona.background}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {personaSections.map(({ key, label, icon: Icon, data }) => (
                         <div key={key}>
                            <h3 className="flex items-center gap-2 font-bold text-lg mb-2 text-slate-800 dark:text-slate-200">
                                <Icon />
                                {label || key}
                            </h3>
                            <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400">
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

export default CustomerPersonaCard;
