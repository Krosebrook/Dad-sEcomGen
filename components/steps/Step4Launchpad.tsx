import React, { useState, useEffect, useCallback } from 'react';
// FIX: Correctly import types from the central types file.
import { ProductPlan, MarketingKickstart, FinancialProjections, FinancialScenario, NextStepItem, ChatMessage, CompetitiveAnalysis, CustomerPersona, ContentStrategy, ShopifyIntegration, SupplierQuote, AdCampaign, InfluencerMarketingPlan, CustomerSupportPlaybook, PackagingExperience, LegalChecklist } from '../../types';
// FIX: Correctly import services from the geminiService file.
import { generateMarketingPlan, generateFinancialProjections, generateNextSteps, generateStorefrontMockup, generateAdCampaigns, generateInfluencerPlan, generateCustomerSupportPlaybook, generatePackagingExperience, generateLegalChecklist } from '../../services/geminiService';

import MarketingKickstartCard from '../MarketingKickstartCard';
import FinancialProjectionsCard from '../FinancialProjectionsCard';
import NextStepsCard from '../NextStepsCard';
import ChatCard from '../ChatCard';
import ExportControls from '../ExportControls';
import StorefrontMockupCard from '../StorefrontMockupCard';
import ContentStrategyCard from '../ContentStrategyCard';
import ShopifyIntegrationCard from '../ShopifyIntegrationCard';
import SupplierTrackerCard from '../SupplierTrackerCard';
import AdCampaignGeneratorCard from '../AdCampaignGeneratorCard';
import InfluencerMarketingCard from '../InfluencerMarketingCard';
import CustomerSupportCard from '../CustomerSupportCard';
import PackagingExperienceCard from '../PackagingExperienceCard';
import LegalChecklistCard from '../LegalChecklistCard';


import { Button } from '../ui/Button';

interface Step4LaunchpadProps {
    productPlan: ProductPlan;
    brandVoice: string;
    competitiveAnalysis: CompetitiveAnalysis | null;
    customerPersona: CustomerPersona | null;
    logoImageUrl: string | null;
    
    marketingPlan: MarketingKickstart | null;
    setMarketingPlan: React.Dispatch<React.SetStateAction<MarketingKickstart | null>>;
    
    financials: FinancialProjections | null;
    setFinancials: React.Dispatch<React.SetStateAction<FinancialProjections | null>>;

    nextSteps: NextStepItem[];
    setNextSteps: React.Dispatch<React.SetStateAction<NextStepItem[]>>;

    chatHistory: ChatMessage[];
    setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;

    storefrontMockupUrl: string | null;
    setStorefrontMockupUrl: React.Dispatch<React.SetStateAction<string | null>>;

    contentStrategy: ContentStrategy | null;
    setContentStrategy: React.Dispatch<React.SetStateAction<ContentStrategy | null>>;
    
    shopifyIntegration: ShopifyIntegration | null;
    setShopifyIntegration: React.Dispatch<React.SetStateAction<ShopifyIntegration | null>>;

    supplierQuotes: SupplierQuote[];
    setSupplierQuotes: React.Dispatch<React.SetStateAction<SupplierQuote[]>>;

    adCampaigns: AdCampaign[] | null;
    setAdCampaigns: React.Dispatch<React.SetStateAction<AdCampaign[] | null>>;

    influencerMarketingPlan: InfluencerMarketingPlan | null;
    setInfluencerMarketingPlan: React.Dispatch<React.SetStateAction<InfluencerMarketingPlan | null>>;

    customerSupportPlaybook: CustomerSupportPlaybook | null;
    setCustomerSupportPlaybook: React.Dispatch<React.SetStateAction<CustomerSupportPlaybook | null>>;

    packagingExperience: PackagingExperience | null;
    setPackagingExperience: React.Dispatch<React.SetStateAction<PackagingExperience | null>>;

    legalChecklist: LegalChecklist | null;
    setLegalChecklist: React.Dispatch<React.SetStateAction<LegalChecklist | null>>;

    onPlanModified: () => void;
    onBack: () => void;
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


const Step4Launchpad: React.FC<Step4LaunchpadProps> = (props) => {
    const {
        productPlan,
        brandVoice,
        competitiveAnalysis,
        customerPersona,
        logoImageUrl,
        marketingPlan, setMarketingPlan,
        financials, setFinancials,
        nextSteps, setNextSteps,
        chatHistory, setChatHistory,
        storefrontMockupUrl, setStorefrontMockupUrl,
        contentStrategy, setContentStrategy,
        shopifyIntegration, setShopifyIntegration,
        supplierQuotes, setSupplierQuotes,
        adCampaigns, setAdCampaigns,
        influencerMarketingPlan, setInfluencerMarketingPlan,
        customerSupportPlaybook, setCustomerSupportPlaybook,
        packagingExperience, setPackagingExperience,
        legalChecklist, setLegalChecklist,
        onPlanModified, onBack
    } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
    const [isRegeneratingFinancials, setIsRegeneratingFinancials] = useState(false);

    const isDataMissing = !marketingPlan || !financials || nextSteps.length === 0 || !adCampaigns || !influencerMarketingPlan || !customerSupportPlaybook || !packagingExperience || !legalChecklist;

    useEffect(() => {
        const fetchLaunchpadData = async () => {
            if (productPlan && customerPersona && marketingPlan && isDataMissing) {
                setIsLoading(true);
                try {
                    const [
                        financial, 
                        steps,
                        campaigns,
                        influencerPlan,
                        supportPlaybook,
                        packaging,
                        legal
                    ] = await Promise.all([
                        financials ? Promise.resolve(financials) : generateFinancialProjections(productPlan, 'Realistic'),
                        nextSteps.length > 0 ? Promise.resolve(nextSteps) : generateNextSteps(productPlan, brandVoice),
                        adCampaigns ? Promise.resolve(adCampaigns) : generateAdCampaigns(productPlan, customerPersona, marketingPlan),
                        influencerMarketingPlan ? Promise.resolve(influencerMarketingPlan) : generateInfluencerPlan(productPlan, customerPersona, brandVoice),
                        customerSupportPlaybook ? Promise.resolve(customerSupportPlaybook) : generateCustomerSupportPlaybook(productPlan, brandVoice),
                        packagingExperience ? Promise.resolve(packagingExperience) : generatePackagingExperience(productPlan, brandVoice),
                        legalChecklist ? Promise.resolve(legalChecklist) : generateLegalChecklist(productPlan)
                    ]);
                    
                    setFinancials(financial);
                    setNextSteps(steps);
                    setAdCampaigns(campaigns);
                    setInfluencerMarketingPlan(influencerPlan);
                    setCustomerSupportPlaybook(supportPlaybook);
                    setPackagingExperience(packaging);
                    setLegalChecklist(legal);

                    onPlanModified();
                } catch (error) {
                    console.error("Failed to generate launchpad data:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        const fetchInitialMarketingData = async () => {
            if (productPlan && customerPersona && !marketingPlan) {
                 setIsLoading(true);
                 try {
                     const marketing = await generateMarketingPlan(productPlan, brandVoice, customerPersona);
                     setMarketingPlan(marketing);
                     onPlanModified();
                 } catch(e) {
                     console.error("Failed to generate marketing plan", e);
                 } finally {
                     setIsLoading(false);
                 }
            }
        }
        
        fetchInitialMarketingData();
        fetchLaunchpadData();
        
    }, [productPlan, customerPersona, marketingPlan, brandVoice, onPlanModified]);

    const handleGenerateMockup = useCallback(async () => {
        if (!productPlan || !logoImageUrl) return;
        setIsGeneratingMockup(true);
        try {
            const url = await generateStorefrontMockup(productPlan, logoImageUrl);
            setStorefrontMockupUrl(url);
            onPlanModified();
        } catch (error) {
            console.error("Failed to generate mockup:", error);
        } finally {
            setIsGeneratingMockup(false);
        }
    }, [productPlan, logoImageUrl, setStorefrontMockupUrl, onPlanModified]);
    
    const handleScenarioChange = useCallback(async (scenario: FinancialScenario) => {
        setIsRegeneratingFinancials(true);
        try {
            const newFinancials = await generateFinancialProjections(productPlan, scenario);
            setFinancials(newFinancials);
            onPlanModified();
        } catch (error) {
            console.error("Failed to regenerate financials:", error);
        } finally {
            setIsRegeneratingFinancials(false);
        }
    }, [productPlan, setFinancials, onPlanModified]);

    const handleToggleNextStep = (index: number) => {
        const newSteps = [...nextSteps];
        newSteps[index].completed = !newSteps[index].completed;
        setNextSteps(newSteps);
        onPlanModified();
    };

    const handleAddTask = (text: string) => {
        setNextSteps([...nextSteps, { text, completed: false }]);
        onPlanModified();
    };

    const handleEditTask = (index: number, text: string) => {
        const newSteps = [...nextSteps];
        newSteps[index].text = text;
        setNextSteps(newSteps);
        onPlanModified();
    };

    const handleDeleteTask = (index: number) => {
        setNextSteps(nextSteps.filter((_, i) => i !== index));
        onPlanModified();
    };

    const handleSupplierQuotesChange = (newQuotes: SupplierQuote[]) => {
        setSupplierQuotes(newQuotes);
        onPlanModified();
    };

    if (isLoading || isDataMissing) {
        return <div className="w-full max-w-4xl space-y-8 animate-fade-in"><LoadingSpinner message="Building your advanced launchpad assets..." /></div>;
    }

    return (
        <div className="w-full max-w-4xl space-y-8 animate-fade-in">
            {marketingPlan && (
                <MarketingKickstartCard
                    marketingPlan={marketingPlan}
                    productPlan={productPlan}
                    brandVoice={brandVoice}
                    onUpdate={(newPlan) => {
                        setMarketingPlan(newPlan);
                        onPlanModified();
                    }}
                />
            )}
            {financials && <FinancialProjectionsCard financials={financials} onFinancialsChange={(f) => { setFinancials(f); onPlanModified(); }} currency={productPlan.currency} onScenarioChange={handleScenarioChange} isRegenerating={isRegeneratingFinancials} />}
            {customerPersona && <ContentStrategyCard productPlan={productPlan} customerPersona={customerPersona} brandVoice={brandVoice} contentStrategy={contentStrategy} setContentStrategy={setContentStrategy} onPlanModified={onPlanModified} />}
            {adCampaigns && <AdCampaignGeneratorCard campaigns={adCampaigns} />}
            {influencerMarketingPlan && <InfluencerMarketingCard plan={influencerMarketingPlan} />}
            {customerSupportPlaybook && <CustomerSupportCard playbook={customerSupportPlaybook} />}
            {packagingExperience && <PackagingExperienceCard experience={packagingExperience} />}
            <StorefrontMockupCard onGenerate={handleGenerateMockup} isGenerating={isGeneratingMockup} mockupUrl={storefrontMockupUrl} />
            <SupplierTrackerCard quotes={supplierQuotes} onQuotesChange={handleSupplierQuotesChange} currency={productPlan.currency} />
            <ShopifyIntegrationCard 
                productPlan={productPlan} 
                logoImageUrl={logoImageUrl}
                storefrontMockupUrl={storefrontMockupUrl}
                integrationConfig={shopifyIntegration}
                setIntegrationConfig={setShopifyIntegration}
                onPlanModified={onPlanModified}
            />
            {legalChecklist && <LegalChecklistCard checklist={legalChecklist} />}
            {nextSteps.length > 0 && <NextStepsCard items={nextSteps} onToggle={handleToggleNextStep} onAddTask={handleAddTask} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />}
            <ChatCard productPlan={productPlan} brandVoice={brandVoice} history={chatHistory} onHistoryChange={(h) => { setChatHistory(h); onPlanModified(); }} />
            <ExportControls 
                productPlan={productPlan} 
                logoImageUrl={logoImageUrl} 
                analysis={competitiveAnalysis} 
                marketingPlan={marketingPlan} 
                financials={financials} 
                nextSteps={nextSteps} 
                adCampaigns={adCampaigns}
                influencerMarketingPlan={influencerMarketingPlan}
                customerSupportPlaybook={customerSupportPlaybook}
                packagingExperience={packagingExperience}
                legalChecklist={legalChecklist}
            />
            
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={onBack}>Back</Button>
                {/* No 'next' button, this is the final step */}
            </div>
        </div>
    );
};

export default Step4Launchpad;