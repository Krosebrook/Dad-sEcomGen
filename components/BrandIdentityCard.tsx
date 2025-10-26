import React from 'react';
import { BrandIdentityKit } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

interface BrandIdentityCardProps {
  brandKit: BrandIdentityKit;
}

const BrandIdentityCard: React.FC<BrandIdentityCardProps> = ({ brandKit }) => {
  const { colorPalette, typography, missionStatement } = brandKit;

  return (
    <Card className="w-full animate-fade-in text-left">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">Brand Identity</CardTitle>
        <CardDescription>Your brand's visual and narrative foundation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Palette */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Color Palette</h3>
          <div className="flex flex-wrap gap-4">
            <div className="text-center">
              <div className="w-20 h-20 rounded-lg shadow-inner" style={{ backgroundColor: colorPalette.primary }}></div>
              <p className="mt-2 text-sm font-medium">Primary</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{colorPalette.primary}</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-lg shadow-inner" style={{ backgroundColor: colorPalette.secondary }}></div>
              <p className="mt-2 text-sm font-medium">Secondary</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{colorPalette.secondary}</p>
            </div>
             <div className="text-center">
              <div className="w-20 h-20 rounded-lg shadow-inner" style={{ backgroundColor: colorPalette.accent }}></div>
              <p className="mt-2 text-sm font-medium">Accent</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{colorPalette.accent}</p>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Typography</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400">Heading Font</p>
              <p className="text-2xl font-bold truncate">{typography.headingFont}</p>
            </div>
             <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400">Body Font</p>
              <p className="text-2xl truncate">{typography.bodyFont}</p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div>
           <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Mission Statement</h3>
           <blockquote className="border-l-4 border-slate-300 dark:border-slate-700 pl-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-r-lg">
            <p className="text-lg italic text-slate-700 dark:text-slate-300">"{missionStatement}"</p>
           </blockquote>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandIdentityCard;