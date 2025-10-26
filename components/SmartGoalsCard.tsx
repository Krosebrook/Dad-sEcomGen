import React from 'react';
import { SMARTGoals } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

// Icons for each SMART category
const Icons = {
    Specific: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    Measurable: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
    Achievable: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 12-7 7-4-4-3 3 4 4 7-7Z"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/></svg>,
    Relevant: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"/><path d="m9 12 2 2 4-4"/></svg>,
    TimeBound: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};


interface SmartGoalsCardProps {
  goals: SMARTGoals;
}

const SmartGoalsCard: React.FC<SmartGoalsCardProps> = ({ goals }) => {
  const goalItems = [
    { key: 'specific', label: 'Specific', icon: Icons.Specific, data: goals.specific },
    { key: 'measurable', label: 'Measurable', icon: Icons.Measurable, data: goals.measurable },
    { key: 'achievable', label: 'Achievable', icon: Icons.Achievable, data: goals.achievable },
    { key: 'relevant', label: 'Relevant', icon: Icons.Relevant, data: goals.relevant },
    { key: 'timeBound', label: 'Time-bound', icon: Icons.TimeBound, data: goals.timeBound },
  ];

  return (
    <Card className="w-full animate-fade-in text-left">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">S.M.A.R.T. Business Goals</CardTitle>
        <CardDescription>Your strategic objectives for the first 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {goalItems.map(({ key, label, icon: Icon, data }) => (
            <div key={key} className="relative pl-12">
              <dt>
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800">
                    <Icon />
                </div>
                <p className="font-semibold text-lg text-slate-900 dark:text-white">{label}: {data.title}</p>
              </dt>
              <dd className="mt-1 text-base text-slate-600 dark:text-slate-400">{data.description}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};

export default SmartGoalsCard;