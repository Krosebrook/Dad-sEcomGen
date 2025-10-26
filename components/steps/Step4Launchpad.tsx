import React, { useState, useEffect, useCallback } from 'react';
import { ProductPlan, MarketingKickstart, FinancialProjections, NextStepItem, ChatMessage, CompetitiveAnalysis, BrandIdentityKit, ShopifyIntegration, ContentStrategy, CustomerPersona, FinancialScenario, SupplierQuote } from '../../types';
import { generateMarketingKickstart, generateFinancialAssumptions, generateNextSteps, generateStorefrontMockup } from '../../services/geminiService';
import MarketingKickstartCard from '../MarketingKickstartCard';
import FinancialProjectionsCard from '../FinancialProjectionsCard';
import NextStepsCard from '../NextStepsCard';
import ChatCard from '../ChatCard';
import StorefrontMockupCard from '../StorefrontMockupCard';
import ShopifyIntegrationCard from '../ShopifyIntegrationCard';
import ContentStrategyCard from '../ContentStrategyCard';
import SupplierTrackerCard from '../SupplierTrackerCard';
import { Button } from '../ui/Button';
import ExportControls from '../ExportControls';

interface Step4LaunchpadProps {
    productPlan: ProductPlan;
    brandVoice: string;
    marketingPlan: MarketingKickstart | null;
    setMarketingPlan: React.Dispatch<React.SetStateAction<MarketingKickstart | null>>;
    financials: FinancialProjections | null;
    setFinancials: React.Dispatch<React.SetStateAction<FinancialProjections | null>>;
    supplierQuotes: SupplierQuote[];
    setSupplierQuotes: React.Dispatch<React.SetStateAction<SupplierQuote[]>>;
    nextSteps: NextStepItem[] | null;
    setNextSteps: React.Dispatch<React.SetStateAction<NextStepItem[] | null>>;
    chatHistory: ChatMessage[] | null;
    setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[] | null>>;
    onBack: () => void;
    onStartOver: () => void;
    isPlanSaved: boolean;
    onSavePlan: () => void;
    onPlanModified: () => void;
    logoImageUrl: string | null;
    analysis: CompetitiveAnalysis | null;
    brandKit: BrandIdentityKit | null;
    storefrontMockupUrl: string | null;
    setStorefrontMockupUrl: React.Dispatch<React.SetStateAction<string | null>>;
    shopifyIntegration: ShopifyIntegration | null;
    setShopifyIntegration: React.Dispatch<React.SetStateAction<ShopifyIntegration | null>>;
    contentStrategy: ContentStrategy | null;
    setContentStrategy: React.Dispatch<React.SetStateAction<ContentStrategy | null>>;
    customerPersona: CustomerPersona | null;
}

const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="flex justify-center items-center flex-col gap-4 p-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
        <svg className="animate-spin h-8 w-8 text-slate-600 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
    </div>
);

const Step4Launchpad: React.FC<Step4LaunchpadProps> = ({
    productPlan,
    brandVoice,
    marketingPlan,
    setMarketingPlan,
    financials,
    setFinancials,
    supplierQuotes,
    setSupplierQuotes,
    nextSteps,
    setNextSteps,
    chatHistory,
    setChatHistory,
    onBack,
    onStartOver,
    isPlanSaved,
    onSavePlan,
    onPlanModified,
    logoImageUrl,
    analysis,
    brandKit,
    storefrontMockupUrl,
    setStorefrontMockupUrl,
    shopifyIntegration,
    setShopifyIntegration,
    contentStrategy,
    setContentStrategy,
    customerPersona,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRegeneratingFinancials, setIsRegeneratingFinancials] = useState(false);
    const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);


    useEffect(() => {
        if (!marketingPlan && !financials && !nextSteps && productPlan) {
            const fetchLaunchpadAssets = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const [marketingResult, financialResult, nextStepsResult] = await Promise.all([
                        generateMarketingKickstart(productPlan, brandVoice),
                        generateFinancialAssumptions(productPlan, 'Realistic'),
                        generateNextSteps(productPlan, brandVoice)
                    ]);
                    setMarketingPlan(marketingResult);
                    setFinancials({
                        ...financialResult,
                        sellingPriceCents: productPlan.priceCents,
                    });
                    setSupplierQuotes([]);
                    setNextSteps(nextStepsResult.map(text => ({ text, completed: false })));
                    setChatHistory([]); // Initialize chat history
                } catch (err) {
                    console.error(err);
                    setError('Failed to generate launchpad assets. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchLaunchpadAssets();
        } else {
             if (chatHistory === null) setChatHistory([]);
             if (supplierQuotes === null) setSupplierQuotes([]);
        }
    }, [marketingPlan, financials, nextSteps, productPlan, chatHistory, supplierQuotes, setMarketingPlan, setFinancials, setSupplierQuotes, setNextSteps, setChatHistory, brandVoice]);
    
    const handleFinancialScenarioChange = useCallback(async (scenario: FinancialScenario) => {
        if (!productPlan) return;
        setIsRegeneratingFinancials(true);
        setError(null);
        try {
            const newAssumptions = await generateFinancialAssumptions(productPlan, scenario);
            setFinancials({
                sellingPriceCents: productPlan.priceCents,
                ...newAssumptions
            });
            onPlanModified();
        } catch (err) {
            console.error("Failed to regenerate financials", err);
            setError('Failed to regenerate financial assumptions. Please try again.');
        } finally {
            setIsRegeneratingFinancials(false);
        }
    }, [productPlan, setFinancials, onPlanModified]);

    const handleGenerateMockup = useCallback(async () => {
        if (!productPlan || !brandKit) return;
        setIsGeneratingMockup(true);
        setError(null);
        try {
            const mockupUrl = await generateStorefrontMockup(productPlan, brandKit);
            setStorefrontMockupUrl(mockupUrl);
            onPlanModified();
        } catch (err) {
            console.error("Failed to generate mockup", err);
            setError('Failed to generate storefront mockup. Please try again.');
        } finally {
            setIsGeneratingMockup(false);
        }
    }, [productPlan, brandKit, setStorefrontMockupUrl, onPlanModified]);

    const handleFinancialsChange = (newFinancials: FinancialProjections) => {
        setFinancials(newFinancials);
        onPlanModified();
    };

    const handleSupplierQuotesChange = (newQuotes: SupplierQuote[]) => {
        setSupplierQuotes(newQuotes);
        onPlanModified();
    };

    const handleToggleNextStep = useCallback((index: number) => {
        if (nextSteps) {
            const newNextSteps = [...nextSteps];
            newNextSteps[index].completed = !newNextSteps[index].completed;
            setNextSteps(newNextSteps);
            onPlanModified();
        }
    }, [nextSteps, setNextSteps, onPlanModified]);

    const handleAddTask = useCallback((text: string) => {
        const newItem: NextStepItem = { text, completed: false };
        setNextSteps(prev => (prev ? [...prev, newItem] : [newItem]));
        onPlanModified();
    }, [setNextSteps, onPlanModified]);

    const handleEditTask = useCallback((index: number, text: string) => {
        if (nextSteps) {
            const newNextSteps = [...nextSteps];
            newNextSteps[index].text = text;
            setNextSteps(newNextSteps);
            onPlanModified();
        }
    }, [nextSteps, setNextSteps, onPlanModified]);

    const handleDeleteTask = useCallback((index: number) => {
        if (nextSteps) {
            const newNextSteps = nextSteps.filter((_, i) => i !== index);
            setNextSteps(newNextSteps);
            onPlanModified();
        }
    }, [nextSteps, setNextSteps, onPlanModified]);

    const handleHistoryChange = useCallback((newHistory: ChatMessage[]) => {
        setChatHistory(newHistory);
        onPlanModified();
    }, [setChatHistory, onPlanModified]);


    return (
        <div className="w-full max-w-4xl space-y-8 animate-fade-in">
             <div className="flex justify-end">
                <Button onClick={onSavePlan} disabled={isPlanSaved} variant={isPlanSaved ? "outline" : "default"} className="px-4 py-2 text-sm">
                    {isPlanSaved ? '✔ Plan Saved' : 'Save Plan'}
                </Button>
            </div>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
                    <p>{error}</p>
                </div>
            )}
            {isLoading && <LoadingSpinner message="Building your launchpad..." />}
            {!isLoading && (
                <>
                    <ExportControls 
                        productPlan={productPlan}
                        logoImageUrl={logoImageUrl}
                        analysis={analysis}
                        marketingPlan={marketingPlan}
                        financials={financials}
                        nextSteps={nextSteps}
                    />
                    <ShopifyIntegrationCard
                        productPlan={productPlan}
                        logoImageUrl={logoImageUrl}
                        storefrontMockupUrl={storefrontMockupUrl}
                        integrationConfig={shopifyIntegration}
                        setIntegrationConfig={setShopifyIntegration}
                        onPlanModified={onPlanModified}
                    />
                     {brandKit && (
                        <StorefrontMockupCard
                            onGenerate={handleGenerateMockup}
                            isGenerating={isGeneratingMockup}
                            mockupUrl={storefrontMockupUrl}
                        />
                    )}
                    {marketingPlan && customerPersona && (
                        <ContentStrategyCard
                            productPlan={productPlan}
                            customerPersona={customerPersona}
                            brandVoice={brandVoice}
                            contentStrategy={contentStrategy}
                            setContentStrategy={setContentStrategy}
                            onPlanModified={onPlanModified}
                        />
                    )}
                     {financials && productPlan && (
                        <FinancialProjectionsCard 
                            financials={financials} 
                            onFinancialsChange={handleFinancialsChange} 
                            currency={productPlan.currency} 
                            onScenarioChange={handleFinancialScenarioChange}
                            isRegenerating={isRegeneratingFinancials}
                        />
                    )}
                    {productPlan && (
                        <SupplierTrackerCard 
                            quotes={supplierQuotes} 
                            onQuotesChange={handleSupplierQuotesChange}
                            currency={productPlan.currency}
                        />
                    )}
                    {chatHistory && productPlan && (
                        <ChatCard 
                            productPlan={productPlan}
                            brandVoice={brandVoice}
                            history={chatHistory}
                            onHistoryChange={handleHistoryChange}
                        />
                    )}
                    {nextSteps && (
                        <NextStepsCard 
                            items={nextSteps} 
                            onToggle={handleToggleNextStep}
                            onAddTask={handleAddTask}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                        />
                    )}
                    {marketingPlan && <MarketingKickstartCard marketingPlan={marketingPlan} />}
                </>
            )}
            <div className="flex justify-between items-center pt-8">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={onStartOver} size="default">Start a New Plan</Button>
            </div>
        </div>
    );
};

export default Step4Launchpad;