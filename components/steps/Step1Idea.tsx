import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface Step1IdeaProps {
    productIdea: string;
    onProductIdeaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleGeneratePlan: (e: React.FormEvent) => void;
    isLoading: boolean;
    inputError: string | null;
    handleExampleClick: (prompt: string) => void;
    brandVoice: string;
    setBrandVoice: (voice: string) => void;
}

const Step1Idea: React.FC<Step1IdeaProps> = ({
    productIdea,
    onProductIdeaChange,
    handleGeneratePlan,
    isLoading,
    inputError,
    handleExampleClick,
    brandVoice,
    setBrandVoice,
}) => {
    const examplePrompts = ["Handmade leather wallets", "Smart gadgets for the garage", "Gourmet BBQ sauces", "Customizable wooden toys"];
    const brandVoices = ["Witty & Humorous Dad", "Knowledgeable & Trustworthy Dad", "Enthusiastic & Fun Dad", "Modern & Minimalist"];


    return (
        <div className="w-full max-w-3xl text-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Turn Your Idea into a Plan</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Describe a product you'd like to sell, and our AI will generate a detailed business plan.</p>
            <form onSubmit={handleGeneratePlan} className="space-y-4">
                <div>
                    <Input
                        type="text"
                        value={productIdea}
                        onChange={onProductIdeaChange}
                        placeholder="e.g., 'A durable, stylish backpack for tech-savvy dads'"
                        className="text-lg"
                        disabled={isLoading}
                        isInvalid={!!inputError}
                        aria-invalid={!!inputError}
                        aria-describedby="input-error"
                    />
                    {inputError && <p id="input-error" className="text-red-500 text-sm text-left mt-1">{inputError}</p>}
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Brand Voice</label>
                    <div className="flex flex-wrap justify-center gap-2">
                         {brandVoices.map((voice) => (
                            <button
                                key={voice}
                                type="button"
                                onClick={() => setBrandVoice(voice)}
                                disabled={isLoading}
                                className={`px-3 py-1.5 text-sm rounded-full transition-colors font-semibold ${
                                    brandVoice === voice
                                    ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900 ring-slate-900 dark:ring-slate-50'
                                    : 'bg-white hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
                                }`}
                                >
                                {voice}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-2 pt-2 pb-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400 self-center">Or try an example:</span>
                    {examplePrompts.map((prompt) => (
                        <button
                            key={prompt}
                            type="button"
                            onClick={() => handleExampleClick(prompt)}
                            className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                    <Button type="submit" disabled={isLoading || !productIdea.trim() || !!inputError} className="w-full sm:w-auto">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : ('Generate Plan')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Step1Idea;