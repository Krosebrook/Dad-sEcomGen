import React, { useState, useEffect, useCallback } from 'react';
// FIX: Correctly import types from the central types file.
import { ProductPlan, MarketingKickstart, FinancialProjections, FinancialScenario, NextStepItem, ChatMessage, CompetitiveAnalysis, CustomerPersona, SeoStrategy, ShopifyIntegration, SupplierQuote, AdCampaign, InfluencerMarketingPlan, CustomerSupportPlaybook, PackagingExperience, LegalChecklist, SupplierSuggestion, SocialMediaCalendar, ProductPhotographyPlan, ABTestPlan, EmailFunnel, PressRelease, ContentStrategy, ProductScorecard } from '../../types';
import { generateMarketingPlan, generateFinancialProjections, generateNextSteps, generateStorefrontMockup, generateAdCampaigns, generateInfluencerPlan, generatePackagingExperience, generateLegalChecklist, generateContentStrategy, generateProductScorecard } from '../../services/geminiService';

import MarketingKickstartCard from '../MarketingKickstartCard';
import FinancialProjectionsCard from '../FinancialProjectionsCard';
import NextStepsCard from '../NextStepsCard';
import ChatCard from '../ChatCard';
import ExportControls from '../ExportControls';
import StorefrontMockupCard from '../StorefrontMockupCard';
import SeoStrategyCard from '../SeoStrategyCard';
import ShopifyIntegrationCard from '../ShopifyIntegrationCard';
import SupplierTrackerCard from '../SupplierTrackerCard';
import AdCampaignGeneratorCard from '../AdCampaignGeneratorCard';
import InfluencerMarketingCard from '../InfluencerMarketingCard';
import CustomerSupportCard from '../CustomerSupportCard';
import PackagingExperienceCard from '../PackagingExperienceCard';
import LegalChecklistCard from '../LegalChecklistCard';
import SocialMediaCalendarCard from '../SocialMediaCalendarCard';
import ProductPhotographyCard from '../ProductPhotographyCard';
import ABTestingCard from '../ABTestingCard';
import EmailFunnelCard from '../EmailFunnelCard';
import PressReleaseCard from '../PressReleaseCard';
import ContentStrategyCard from '../ContentStrategyCard';
import ProductScorecardCard from '../ProductScorecardCard';

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

    seoStrategy: SeoStrategy | null;
    setSeoStrategy: React.Dispatch<React.SetStateAction<SeoStrategy | null>>;
    
    shopifyIntegration: ShopifyIntegration | null;
    setShopifyIntegration: React.Dispatch<React.SetStateAction<ShopifyIntegration | null>>;

    supplierQuotes: SupplierQuote[];
    setSupplierQuotes: React.Dispatch<React.SetStateAction<SupplierQuote[]>>;

    supplierSuggestions: SupplierSuggestion[] | null;
    setSupplierSuggestions: React.Dispatch<React.SetStateAction<SupplierSuggestion[] | null>>;

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

    socialMediaCalendar: SocialMediaCalendar | null;
    setSocialMediaCalendar: React.Dispatch<React.SetStateAction<SocialMediaCalendar | null>>;

    photographyPlan: ProductPhotographyPlan | null;
    setPhotographyPlan: React.Dispatch<React.SetStateAction<ProductPhotographyPlan | null>>;

    abTestPlan: ABTestPlan | null;
    setAbTestPlan: React.Dispatch<React.SetStateAction<ABTestPlan | null>>;

    emailFunnel: EmailFunnel | null;
    setEmailFunnel: React.Dispatch<React.SetStateAction<EmailFunnel | null>>;

    pressRelease: PressRelease | null;
    setPressRelease: React.Dispatch<React.SetStateAction<PressRelease | null>>;

    contentStrategy: ContentStrategy | null;
    setContentStrategy: React.Dispatch<React.SetStateAction<ContentStrategy | null>>;

    productScorecard: ProductScorecard | null;
    setProductScorecard: React.Dispatch<React.SetStateAction<ProductScorecard | null>>;

    onPlanModified: () => void;
    onBack: () => void;
}

const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="flex justify-center items-center flex-col gap-4 p-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
        <svg className="animate-spin h-8 w-8 text-slate-600 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 R-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
        seoStrategy, setSeoStrategy,
        shopifyIntegration, setShopifyIntegration,
        supplierQuotes, setSupplierQuotes,
        supplierSuggestions, setSupplierSuggestions,
        adCampaigns, setAdCampaigns,
        influencerMarketingPlan, setInfluencerMarketingPlan,
        customerSupportPlaybook, setCustomerSupportPlaybook,
        packagingExperience, setPackagingExperience,
        legalChecklist, setLegalChecklist,
        socialMediaCalendar, setSocialMediaCalendar,
        photographyPlan, setPhotographyPlan,
        abTestPlan, setAbTestPlan,
        emailFunnel, setEmailFunnel,
        pressRelease, setPressRelease,
        contentStrategy, setContentStrategy,
        productScorecard, setProductScorecard,
        onPlanModified, onBack
    } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
    const [isRegeneratingFinancials, setIsRegeneratingFinancials] = useState(false);

    const isDataMissing = !marketingPlan || !financials || nextSteps.length === 0 || !adCampaigns || !influencerMarketingPlan || !packagingExperience || !legalChecklist;

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
                        packaging,
                        legal
                    ] = await Promise.all([
                        financials ? Promise.resolve(financials) : generateFinancialProjections(productPlan, 'Realistic'),
                        nextSteps.length > 0 ? Promise.resolve(nextSteps) : generateNextSteps(productPlan, brandVoice),
                        adCampaigns ? Promise.resolve(adCampaigns) : generateAdCampaigns(productPlan, customerPersona, marketingPlan),
                        influencerMarketingPlan ? Promise.resolve(influencerMarketingPlan) : generateInfluencerPlan(productPlan, customerPersona, brandVoice),
                        packagingExperience ? Promise.resolve(packagingExperience) : generatePackagingExperience(productPlan, brandVoice),
                        legalChecklist ? Promise.resolve(legalChecklist) : generateLegalChecklist(productPlan)
                    ]);
                    
                    setFinancials(financial);
                    setNextSteps(steps);
                    setAdCampaigns(campaigns);
                    setInfluencerMarketingPlan(influencerPlan);
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

    const handleGenerateContentStrategy = useCallback(async () => {
        setIsLoading(true);
        try {
            const strategy = await generateContentStrategy(productPlan, brandVoice, seoStrategy, customerPersona);
            setContentStrategy(strategy);
            onPlanModified();
        } catch (error) {
            console.error("Failed to generate content strategy:", error);
        } finally {
            setIsLoading(false);
        }
    }, [productPlan, brandVoice, seoStrategy, customerPersona, setContentStrategy, onPlanModified]);

    const handleGenerateProductScorecard = useCallback(async () => {
        setIsLoading(true);
        try {
            const scorecard = await generateProductScorecard(productPlan, competitiveAnalysis, null, financials, customerPersona);
            setProductScorecard(scorecard);
            onPlanModified();
        } catch (error) {
            console.error("Failed to generate product scorecard:", error);
        } finally {
            setIsLoading(false);
        }
    }, [productPlan, competitiveAnalysis, financials, customerPersona, setProductScorecard, onPlanModified]);

    const handleToggleNextStep = (index: number) => {
        const newSteps = [...nextSteps];
        newSteps[index].completed = !newSteps[index].completed;
        setNextSteps(newSteps);
        onPlanModified();
    };

    const handleAddTask = (text: string, category: string, priority: 'High' | 'Medium' | 'Low') => {
        setNextSteps([...nextSteps, { text, completed: false, category, priority }]);
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
    
    const handleSupplierSuggestionsChange = (newSuggestions: SupplierSuggestion[]) => {
        setSupplierSuggestions(newSuggestions);
        onPlanModified();
    };


    if (isLoading || isDataMissing) {
        return <div className="w-full max-w-4xl space-y-8"><LoadingSpinner message="Building your advanced launchpad assets..." /></div>;
    }

    return (
        <div className="w-full max-w-4xl space-y-8">
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
            {customerPersona && <SeoStrategyCard productPlan={productPlan} customerPersona={customerPersona} brandVoice={brandVoice} seoStrategy={seoStrategy} setSeoStrategy={setSeoStrategy} onPlanModified={onPlanModified} />}
            {adCampaigns && <AdCampaignGeneratorCard campaigns={adCampaigns} />}
            {influencerMarketingPlan && <InfluencerMarketingCard plan={influencerMarketingPlan} />}
            <ContentStrategyCard
                contentStrategy={contentStrategy}
                onGenerate={handleGenerateContentStrategy}
                onChange={(strategy) => {
                    setContentStrategy(strategy);
                    onPlanModified();
                }}
                isLoading={isLoading}
            />
            <ProductScorecardCard
                scorecard={productScorecard}
                onGenerate={handleGenerateProductScorecard}
                isLoading={isLoading}
            />
            <SocialMediaCalendarCard productPlan={productPlan} customerPersona={customerPersona} brandVoice={brandVoice} calendar={socialMediaCalendar} setCalendar={setSocialMediaCalendar} onPlanModified={onPlanModified} />
            <EmailFunnelCard productPlan={productPlan} customerPersona={customerPersona} brandVoice={brandVoice} funnel={emailFunnel} setFunnel={setEmailFunnel} onPlanModified={onPlanModified} />
            <ABTestingCard productPlan={productPlan} customerPersona={customerPersona} testPlan={abTestPlan} setTestPlan={setAbTestPlan} onPlanModified={onPlanModified} />
            <ProductPhotographyCard productPlan={productPlan} brandVoice={brandVoice} plan={photographyPlan} setPlan={setPhotographyPlan} onPlanModified={onPlanModified} />
            <PressReleaseCard productPlan={productPlan} brandVoice={brandVoice} release={pressRelease} setRelease={setPressRelease} onPlanModified={onPlanModified} />
            <CustomerSupportCard 
                productPlan={productPlan}
                brandVoice={brandVoice}
                playbook={customerSupportPlaybook}
                setPlaybook={setCustomerSupportPlaybook}
                onPlanModified={onPlanModified}
            />
            {packagingExperience && <PackagingExperienceCard experience={packagingExperience} />}
            <StorefrontMockupCard onGenerate={handleGenerateMockup} isGenerating={isGeneratingMockup} mockupUrl={storefrontMockupUrl} />
            <SupplierTrackerCard 
                quotes={supplierQuotes} 
                onQuotesChange={handleSupplierQuotesChange} 
                currency={productPlan.currency}
                productPlan={productPlan}
                customerPersona={customerPersona}
                suggestions={supplierSuggestions}
                onSuggestionsChange={handleSupplierSuggestionsChange}
            />
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
                seoStrategy={seoStrategy}
                adCampaigns={adCampaigns}
                influencerMarketingPlan={influencerMarketingPlan}
                customerSupportPlaybook={customerSupportPlaybook}
                packagingExperience={packagingExperience}
                legalChecklist={legalChecklist}
                socialMediaCalendar={socialMediaCalendar}
                photographyPlan={photographyPlan}
                abTestPlan={abTestPlan}
                emailFunnel={emailFunnel}
                pressRelease={pressRelease}
            />
            
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={onBack}>Back</Button>
                {/* No 'next' button, this is the final step */}
            </div>
        </div>
    );
};

export default Step4Launchpad;