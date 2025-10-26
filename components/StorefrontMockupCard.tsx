import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';

interface StorefrontMockupCardProps {
  onGenerate: () => void;
  isGenerating: boolean;
  mockupUrl: string | null;
}

const ReloadIcon: React.FC<{ className?: string, isSpinning?: boolean }> = ({ className, isSpinning }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} ${isSpinning ? 'animate-spin' : ''}`}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
    </svg>
);

const StorefrontMockupCard: React.FC<StorefrontMockupCardProps> = ({ onGenerate, isGenerating, mockupUrl }) => {
  return (
    <Card className="w-full animate-fade-in text-left">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="text-2xl md:text-3xl">Storefront Mockup</CardTitle>
                <CardDescription>A tangible vision of your product's online storefront.</CardDescription>
            </div>
            {mockupUrl && !isGenerating && (
                 <Button variant="outline" onClick={onGenerate} disabled={isGenerating}>
                    <ReloadIcon className="mr-2" /> Regenerate
                </Button>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800/50 rounded-lg flex items-center justify-center p-2">
            {isGenerating ? (
                <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
                     <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p>Generating your mockup...</p>
                </div>
            ) : mockupUrl ? (
                <img src={mockupUrl} alt="Storefront Mockup" className="w-full h-full object-contain rounded-md" />
            ) : (
                <div className="text-center">
                    <p className="mb-4 text-slate-600 dark:text-slate-400">Generate an AI-powered mockup of your product page.</p>
                    <Button onClick={onGenerate} disabled={isGenerating}>
                        ✨ Generate Storefront Mockup
                    </Button>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StorefrontMockupCard;