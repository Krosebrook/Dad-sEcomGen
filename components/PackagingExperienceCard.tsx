
import React from 'react';
import { PackagingExperience } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const SparkleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"/></svg>;
const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22s5-3.5 5-11V2L2 11v11zM11 22s5-3.5 5-11V2L11 11v11zM20 22s5-3.5 5-11V2l-5 11v11z"/></svg>;


interface PackagingExperienceCardProps {
    experience: PackagingExperience;
}

const PackagingExperienceCard: React.FC<PackagingExperienceCardProps> = ({ experience }) => {
    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                 <div className="flex items-center gap-3">
                    <BoxIcon />
                    <div>
                        <CardTitle className="text-2xl md:text-3xl">Packaging & Unboxing</CardTitle>
                        <CardDescription>Design the customer's first physical interaction with your product.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Theme</h4>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{experience.theme}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">The Box</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{experience.boxDescription}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200 flex items-center gap-2"><SparkleIcon/> Inside the Box</h4>
                         <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                            {experience.insideBoxElements.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200 flex items-center gap-2"><LeafIcon/> Sustainability Note</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{experience.sustainabilityNotes}</p>
                </div>

            </CardContent>
        </Card>
    );
};

export default PackagingExperienceCard;
