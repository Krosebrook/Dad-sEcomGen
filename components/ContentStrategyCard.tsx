import React, { useState, useCallback } from 'react';
import { ProductPlan, CustomerPersona, ContentStrategy } from '../types';
import { generateContentStrategy, generateBlogPost } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';

interface ContentStrategyCardProps {
    productPlan: ProductPlan;
    customerPersona: CustomerPersona;
    brandVoice: string;
    contentStrategy: ContentStrategy | null;
    setContentStrategy: React.Dispatch<React.SetStateAction<ContentStrategy | null>>;
    onPlanModified: () => void;
}

const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);

const BlogPostModal: React.FC<{ title: string; content: string; onClose: () => void }> = ({ title, content, onClose }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const formatContent = (text: string) => {
        const lines = text.split('\n');
        let html = '';
        let inList = false;

        const closeList = () => {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
        };

        for (const line of lines) {
            let processedLine = line;

            // Bold and Italics
            processedLine = processedLine
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/__(.*?)__/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/_(.*?)_/g, '<em>$1</em>');

            // Headings
            if (processedLine.startsWith('### ')) {
                closeList();
                html += `<h3>${processedLine.substring(4)}</h3>`;
                continue;
            }
            if (processedLine.startsWith('## ')) {
                closeList();
                html += `<h2>${processedLine.substring(3)}</h2>`;
                continue;
            }
            if (processedLine.startsWith('# ')) {
                closeList();
                html += `<h1>${processedLine.substring(2)}</h1>`;
                continue;
            }

            // Unordered Lists
            if (processedLine.startsWith('* ') || processedLine.startsWith('- ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${processedLine.substring(2)}</li>`;
                continue;
            }

            closeList();

            // Paragraphs
            if (processedLine.trim() === '') {
                html += '<br />';
            } else {
                html += `<p>${processedLine}</p>`;
            }
        }
        
        closeList();
        return html;
    };


    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">AI-Generated Blog Post Draft</p>
                </div>
                <div className="p-6 flex-grow overflow-y-auto prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
                    <Button variant="outline" onClick={handleCopy}>
                        {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                        <span className="ml-2">{isCopied ? 'Copied!' : 'Copy to Clipboard'}</span>
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
};


const ContentStrategyCard: React.FC<ContentStrategyCardProps> = ({
    productPlan,
    customerPersona,
    brandVoice,
    contentStrategy,
    setContentStrategy,
    onPlanModified
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDrafting, setIsDrafting] = useState<string | null>(null);
    const [blogDraft, setBlogDraft] = useState<{ title: string; content: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateStrategy = useCallback(async () => {
        if (!customerPersona) {
            setError("A customer persona is required to generate a content strategy.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const strategy = await generateContentStrategy(productPlan, customerPersona, brandVoice);
            setContentStrategy(strategy);
            onPlanModified();
        } catch (err) {
            console.error(err);
            setError("Failed to generate content strategy. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }, [productPlan, customerPersona, brandVoice, setContentStrategy, onPlanModified]);

    const handleGenerateDraft = useCallback(async (title: string) => {
        setIsDrafting(title);
        setError(null);
        try {
            const draftContent = await generateBlogPost(title, productPlan, brandVoice);
            setBlogDraft({ title, content: draftContent });
        } catch (err) {
            console.error(err);
            setError("Failed to draft the blog post. Please try again.");
        } finally {
            setIsDrafting(null);
        }
    }, [productPlan, brandVoice]);

    return (
        <>
        {blogDraft && <BlogPostModal title={blogDraft.title} content={blogDraft.content} onClose={() => setBlogDraft(null)} />}
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">Content Strategy Hub</CardTitle>
                <CardDescription>Your 30-day roadmap for content marketing and SEO.</CardDescription>
            </CardHeader>
            <CardContent>
                {!contentStrategy ? (
                    <div className="text-center p-4">
                        <p className="mb-4 text-slate-600 dark:text-slate-400">Generate a content calendar, SEO keywords, and blog ideas to attract your target audience.</p>
                        <Button onClick={handleGenerateStrategy} disabled={isGenerating || !customerPersona}>
                            {isGenerating ? 'Generating Strategy...' : '📈 Develop Content Strategy'}
                        </Button>
                         {!customerPersona && <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">Requires a Customer Persona from the Market step.</p>}
                         {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {error && <p className="text-red-500 text-center">{error}</p>}
                        {/* SEO Keyword Pack */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">SEO Keyword Pack</h3>
                            <div className="flex flex-wrap gap-2 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                {contentStrategy.seoKeywordPack.map((keyword, index) => (
                                    <span key={index} className="bg-slate-200 text-slate-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* Blog Post Ideas */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Blog Post Ideas</h3>
                            <ul className="space-y-2">
                                {contentStrategy.blogPostIdeas.map((title, index) => (
                                    <li key={index} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg gap-2">
                                        <span className="text-slate-700 dark:text-slate-300 flex-grow">{title}</span>
                                        <Button size="sm" variant="outline" onClick={() => handleGenerateDraft(title)} disabled={!!isDrafting} className="self-end sm:self-center flex-shrink-0">
                                            {isDrafting === title ? 'Drafting...' : '✍️ Draft Post'}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Content Calendar */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">30-Day Content Calendar</h3>
                            <div className="space-y-4">
                                {contentStrategy.contentCalendar.map(week => (
                                    <div key={week.week} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                                        <h4 className="font-bold text-slate-900 dark:text-white">Week {week.week}: <span className="font-normal">{week.theme}</span></h4>
                                        <div className="mt-2 pl-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                            {week.dailyPosts.map((post, index) => (
                                                <p key={index} className="text-sm text-slate-600 dark:text-slate-400">
                                                    <strong className="text-slate-700 dark:text-slate-300">{post.platform}:</strong> {post.idea}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
        </>
    );
};

export default ContentStrategyCard;