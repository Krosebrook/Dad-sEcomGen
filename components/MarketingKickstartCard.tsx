import React, { useState, useCallback } from 'react';
import { MarketingKickstart, ProductPlan } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { regenerateLaunchEmail } from '../services/geminiService';

const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ReloadIcon: React.FC<{ className?: string, isSpinning?: boolean }> = ({ className, isSpinning }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} ${isSpinning ? 'animate-spin' : ''}`}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
);


const useCopyToClipboard = (): [(text: string, id: string) => void, string | null] => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);
  return [copy, copiedId];
};

interface MarketingKickstartCardProps {
  marketingPlan: MarketingKickstart;
  productPlan: ProductPlan;
  brandVoice: string;
  onUpdate: (updatedPlan: MarketingKickstart) => void;
}

const MarketingKickstartCard: React.FC<MarketingKickstartCardProps> = ({ marketingPlan, productPlan, brandVoice, onUpdate }) => {
  const [copy, copiedId] = useCopyToClipboard();
  const [isRegeneratingEmail, setIsRegeneratingEmail] = useState(false);
  const { socialMediaPosts, adCopy, launchEmail } = marketingPlan;

  const handleRegenerateEmail = async () => {
    setIsRegeneratingEmail(true);
    try {
        const newEmail = await regenerateLaunchEmail(productPlan, brandVoice);
        onUpdate({ ...marketingPlan, launchEmail: newEmail });
    } catch (e) {
        console.error(e);
        // TODO: show error in UI
    } finally {
        setIsRegeneratingEmail(false);
    }
  };


  return (
    <Card className="w-full animate-fade-in text-left">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">Marketing Kickstart</CardTitle>
        <CardDescription>AI-generated assets to get you started on your marketing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Social Media Section */}
        <section>
          <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Social Media Posts</h3>
          <div className="space-y-6">
            {socialMediaPosts.map((post, index) => (
              <div key={index} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">{post.platform} Post</h4>
                  <button
                    onClick={() => copy(post.postText, `post-${index}`)}
                    className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {copiedId === `post-${index}` ? <CheckIcon /> : <ClipboardIcon />}
                    {copiedId === `post-${index}` ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 mb-3">{post.postText}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.hashtags.map(tag => (
                    <span key={tag} className="text-sm text-blue-600 dark:text-blue-400">#{tag}</span>
                  ))}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Visual Idea:</span> {post.visualPrompt}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ad Copy Section */}
        <section>
          <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Ad Copy</h3>
          <div className="space-y-6">
            {adCopy.map((ad, index) => (
              <div key={index} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                <h4 className="font-bold mb-3 text-slate-900 dark:text-white">{ad.platform}</h4>
                <div>
                  <h5 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Headlines:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {ad.headlines.map((headline, hIndex) => (
                      <li key={hIndex} className="text-slate-700 dark:text-slate-300">{headline}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <h5 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Descriptions:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {ad.descriptions.map((desc, dIndex) => (
                      <li key={dIndex} className="text-slate-700 dark:text-slate-300">{desc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Launch Email Section */}
        <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Launch Email</h3>
                <Button variant="outline" size="sm" onClick={handleRegenerateEmail} disabled={isRegeneratingEmail}>
                    <ReloadIcon isSpinning={isRegeneratingEmail} className="mr-2" />
                    {isRegeneratingEmail ? 'Regenerating...' : 'Regenerate Email'}
                </Button>
            </div>
          <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Email Subject</h4>
                    <p className="text-slate-700 dark:text-slate-300 mt-1">{launchEmail.subject}</p>
                </div>
                 <button
                    onClick={() => copy(launchEmail.subject, 'email-subject')}
                    className="flex-shrink-0 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {copiedId === 'email-subject' ? <CheckIcon /> : <ClipboardIcon />}
                    {copiedId === 'email-subject' ? 'Copied!' : 'Copy Subject'}
                  </button>
            </div>
             <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-4"></div>
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Email Body</h4>
                 <button
                    onClick={() => copy(launchEmail.body, 'email-body')}
                    className="flex-shrink-0 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {copiedId === 'email-body' ? <CheckIcon /> : <ClipboardIcon />}
                    {copiedId === 'email-body' ? 'Copied!' : 'Copy Body'}
                  </button>
            </div>
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{launchEmail.body}</p>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};

export default MarketingKickstartCard;