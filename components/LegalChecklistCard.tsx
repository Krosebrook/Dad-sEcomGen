import React from 'react';
import { LegalChecklist } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

interface LegalChecklistCardProps {
    checklist: LegalChecklist;
}

const LegalChecklistCard: React.FC<LegalChecklistCardProps> = ({ checklist }) => {
    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <ShieldIcon />
                    <div>
                        <CardTitle className="text-2xl md:text-3xl">Legal & Compliance Checklist</CardTitle>
                        <CardDescription>General information to help you get started.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500 text-amber-800 dark:text-amber-300 rounded-r-lg">
                    <p className="text-sm font-semibold">Disclaimer</p>
                    <p className="text-xs">{checklist.disclaimer}</p>
                </div>
                <div className="space-y-3">
                    {checklist.checklistItems.map((item, index) => (
                        <div key={index} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex justify-between items-start gap-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white">{item.item}</h4>
                                {item.isCritical && (
                                    <div className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                                        <AlertTriangleIcon />
                                        CRITICAL
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default LegalChecklistCard;