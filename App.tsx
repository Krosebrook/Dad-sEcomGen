import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ProgressBar from './components/ProgressBar';
import Step1Idea from './components/steps/Step1Idea';
import Step2Blueprint from './components/steps/Step2Blueprint';
import Step3Market from './components/steps/Step3Market';
import Step4Launchpad from './components/steps/Step4Launchpad';
import MyVenturesDashboard from './components/MyVenturesDashboard';
import ProductScout from './components/ProductScout';
import { generateProductPlan, generateSmartGoals } from './services/geminiService';

import {
    ProductPlan,
    MarketingKickstart,
    FinancialProjections,
    NextStepItem,
    CompetitiveAnalysis,
    SWOTAnalysis,
    CustomerPersona,
    BrandIdentityKit,
    SMARTGoals,
    ChatMessage,
    SavedVenture,
    AppData,
    SeoStrategy,
    ShopifyIntegration,
    SupplierQuote,
    SupplierSuggestion,
    PriceHistoryPoint,
    AdCampaign,
    InfluencerMarketingPlan,
    CustomerSupportPlaybook,
    PackagingExperience,
    LegalChecklist,
    SocialMediaCalendar,
    ProductPhotographyPlan,
    ABTestPlan,
    EmailFunnel,
    PressRelease,
} from './types';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [productIdea, setProductIdea] = useState('');
    const [brandVoice, setBrandVoice] = useState('Witty & Humorous Dad');
    const [isLoading, setIsLoading] = useState(false);
    const [inputError, setInputError] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>('light');

    // State for all data generated throughout the steps
    const [ventureId, setVentureId] = useState<string | null>(null);
    const [ventureName, setVentureName] = useState('');
    const [smartGoals, setSmartGoals] = useState<SMARTGoals | null>(null);
    const [plan, setPlan] = useState<ProductPlan | null>(null);
    const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
    const [brandKit, setBrandKit] = useState<BrandIdentityKit | null>(null);
    const [analysis, setAnalysis] = useState<CompetitiveAnalysis | null>(null);
    const [swotAnalysis, setSwotAnalysis] = useState<SWOTAnalysis | null>(null);
    const [customerPersona, setCustomerPersona] = useState<CustomerPersona | null>(null);
    const [personaAvatarUrl, setPersonaAvatarUrl] = useState<string | null>(null);
    const [marketingPlan, setMarketingPlan] = useState<MarketingKickstart | null>(null);
    const [financials, setFinancials] = useState<FinancialProjections | null>(null);
    const [nextSteps, setNextSteps] = useState<NextStepItem[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [storefrontMockupUrl, setStorefrontMockupUrl] = useState<string | null>(null);
    const [seoStrategy, setSeoStrategy] = useState<SeoStrategy | null>(null);
    const [shopifyIntegration, setShopifyIntegration] = useState<ShopifyIntegration | null>(null);
    const [supplierQuotes, setSupplierQuotes] = useState<SupplierQuote[]>([]);
    const [supplierSuggestions, setSupplierSuggestions] = useState<SupplierSuggestion[] | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
    const [adCampaigns, setAdCampaigns] = useState<AdCampaign[] | null>(null);
    const [influencerMarketingPlan, setInfluencerMarketingPlan] = useState<InfluencerMarketingPlan | null>(null);
    const [customerSupportPlaybook, setCustomerSupportPlaybook] = useState<CustomerSupportPlaybook | null>(null);
    const [packagingExperience, setPackagingExperience] = useState<PackagingExperience | null>(null);
    const [legalChecklist, setLegalChecklist] = useState<LegalChecklist | null>(null);
    const [socialMediaCalendar, setSocialMediaCalendar] = useState<SocialMediaCalendar | null>(null);
    const [photographyPlan, setPhotographyPlan] = useState<ProductPhotographyPlan | null>(null);
    const [abTestPlan, setAbTestPlan] = useState<ABTestPlan | null>(null);
    const [emailFunnel, setEmailFunnel] = useState<EmailFunnel | null>(null);
    const [pressRelease, setPressRelease] = useState<PressRelease | null>(null);


    const [isPlanSaved, setIsPlanSaved] = useState(false);
    const [savedVentures, setSavedVentures] = useState<SavedVenture[]>([]);
    const [showVentures, setShowVentures] = useState(false);
    const [showScout, setShowScout] = useState(false);

    useEffect(() => {
        const ventures = localStorage.getItem('dad-ecommerce-ventures');
        if (ventures) {
            setSavedVentures(JSON.parse(ventures));
        }

        const savedTheme = localStorage.getItem('theme') as Theme || 'light';
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return newTheme;
        });
    };

    const resetState = () => {
        setCurrentStep(1);
        setProductIdea('');
        setBrandVoice('Witty & Humorous Dad');
        setInputError(null);
        setVentureId(null);
        setVentureName('');
        setSmartGoals(null);
        setPlan(null);
        setLogoImageUrl(null);
        setBrandKit(null);
        setAnalysis(null);
        setSwotAnalysis(null);
        setCustomerPersona(null);
        setPersonaAvatarUrl(null);
        setMarketingPlan(null);
        setFinancials(null);
        setNextSteps([]);
        setIsPlanSaved(false);
        setChatHistory([]);
        setStorefrontMockupUrl(null);
        setSeoStrategy(null);
        setShopifyIntegration(null);
        setSupplierQuotes([]);
        setSupplierSuggestions(null);
        setPriceHistory([]);
        setAdCampaigns(null);
        setInfluencerMarketingPlan(null);
        setCustomerSupportPlaybook(null);
        setPackagingExperience(null);
        setLegalChecklist(null);
        setSocialMediaCalendar(null);
        setPhotographyPlan(null);
        setAbTestPlan(null);
        setEmailFunnel(null);
        setPressRelease(null);
    };
    
    const onPlanModified = useCallback(() => {
        setIsPlanSaved(false);
    }, []);

    const handleProductIdeaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProductIdea(e.target.value);
        if (e.target.value.trim().length > 0) {
            setInputError(null);
        }
    };
    
    const handleGeneratePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productIdea.trim()) {
            setInputError('Please enter a product idea.');
            return;
        }

        setIsLoading(true);
        setInputError(null);

        try {
            const goals = await generateSmartGoals(productIdea, brandVoice);
            setSmartGoals(goals);
        } catch (err) {
            console.error(err);
            setInputError('Failed to generate a plan. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProceedToBlueprint = async () => {
        setIsLoading(true);
        try {
            // Passing empty array for initial generation
            const { plan: newPlan, smartGoals: newGoals } = await generateProductPlan(productIdea, brandVoice, []);
            // Use the goals from the previous step if available, otherwise use newly generated ones
            setSmartGoals(smartGoals || newGoals); 
            setPlan(newPlan);
            
            const newVentureId = Date.now().toString();
            setVentureId(newVentureId);
            setVentureName(newPlan.productTitle);
            
            setCurrentStep(2);
        } catch (err) {
            console.error(err);
            setInputError('Failed to generate the blueprint. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExampleClick = (prompt: string) => {
        setProductIdea(prompt);
        setInputError(null);
    };

    const updatePlan = (updatedPlan: ProductPlan) => {
        setPlan(updatedPlan);
        onPlanModified();

        // Update price history
        const today = new Date().toISOString().split('T')[0];
        const newHistory = [...priceHistory.filter(p => p.date !== today), { date: today, priceCents: updatedPlan.priceCents }];
        // Keep last 30 days
        if (newHistory.length > 30) {
            newHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            newHistory.length = 30;
        }
        setPriceHistory(newHistory);
    };
    
    const handleSavePlan = () => {
        if (!ventureId || !plan) return;

        const currentAppData: AppData = {
            productIdea, brandVoice, smartGoals, plan, logoImageUrl, brandKit,
            analysis, swotAnalysis, customerPersona, personaAvatarUrl, marketingPlan,
            financials, nextSteps, chatHistory, storefrontMockupUrl, seoStrategy,
            shopifyIntegration, supplierQuotes, supplierSuggestions, priceHistory, adCampaigns: adCampaigns ?? undefined,
            influencerMarketingPlan: influencerMarketingPlan ?? undefined,
            customerSupportPlaybook: customerSupportPlaybook ?? undefined,
            packagingExperience: packagingExperience ?? undefined,
            legalChecklist: legalChecklist ?? undefined,
            socialMediaCalendar: socialMediaCalendar ?? undefined,
            photographyPlan: photographyPlan ?? undefined,
            abTestPlan: abTestPlan ?? undefined,
            emailFunnel: emailFunnel ?? undefined,
            pressRelease: pressRelease ?? undefined
        };

        const newVenture: SavedVenture = {
            id: ventureId,
            name: ventureName || plan.productTitle,
            lastModified: new Date().toISOString(),
            data: currentAppData
        };

        const updatedVentures = savedVentures.filter(v => v.id !== ventureId);
        setSavedVentures([...updatedVentures, newVenture]);
        localStorage.setItem('dad-ecommerce-ventures', JSON.stringify([...updatedVentures, newVenture]));
        setIsPlanSaved(true);
    };

    const loadVenture = (ventureId: string) => {
        const ventureToLoad = savedVentures.find(v => v.id === ventureId);
        if (ventureToLoad) {
            const { data } = ventureToLoad;
            setVentureId(ventureToLoad.id);
            setVentureName(ventureToLoad.name);
            setProductIdea(data.productIdea);
            setBrandVoice(data.brandVoice);
            setSmartGoals(data.smartGoals);

            const loadedPlan = data.plan;
            if (loadedPlan) {
                loadedPlan.materials = loadedPlan.materials ?? [];
                loadedPlan.dimensions = loadedPlan.dimensions ?? '';
                loadedPlan.weightGrams = loadedPlan.weightGrams ?? 0;
            }
            setPlan(loadedPlan);
            
            setLogoImageUrl(data.logoImageUrl);
            setBrandKit(data.brandKit);
            setAnalysis(data.analysis);
            setSwotAnalysis(data.swotAnalysis);
            setCustomerPersona(data.customerPersona);
            setPersonaAvatarUrl(data.personaAvatarUrl);

            const marketingData = data.marketingPlan;
            if (marketingData) {
                if (marketingData.adCopy) {
                    marketingData.adCopy = marketingData.adCopy.map((ad: any) => {
                        const migratedAd = {
                            ...ad,
                            audienceTargeting: ad.audienceTargeting ?? { demographics: [], interests: [], keywords: [] },
                        };
            
                        if (migratedAd.headlines && migratedAd.descriptions && !migratedAd.variations) {
                            migratedAd.variations = [{
                                headlines: migratedAd.headlines,
                                descriptions: migratedAd.descriptions,
                            }];
                            delete migratedAd.headlines;
                            delete migratedAd.descriptions;
                        } else {
                             migratedAd.variations = migratedAd.variations || [];
                        }
                        return migratedAd;
                    });
                }
            
                if (marketingData.socialMediaPosts) {
                    marketingData.socialMediaPosts = marketingData.socialMediaPosts.map((post: any) => {
                         const migratedPost = { ...post };
                         if (migratedPost.postText && !migratedPost.postTextVariations) {
                             migratedPost.postTextVariations = [migratedPost.postText];
                             delete migratedPost.postText;
                         } else {
                             migratedPost.postTextVariations = migratedPost.postTextVariations || [];
                         }
                         return migratedPost;
                    });
                }
            }
            setMarketingPlan(marketingData);
            
            const financialData = data.financials;
            if (financialData) {
                // Migration logic for shipping options
                if (financialData.shippingCostPerUnitCents && (!financialData.shippingOptions || financialData.shippingOptions.length === 0)) {
                    financialData.shippingOptions = [{
                        name: 'Standard Shipping',
                        costCents: financialData.shippingCostPerUnitCents,
                        deliveryTime: '5-7 business days'
                    }];
                }
                // Ensure shippingOptions is an array even if it's null/undefined from storage
                financialData.shippingOptions = financialData.shippingOptions || [];
                financialData.transactionFeePercent = financialData.transactionFeePercent ?? 2.9;
                financialData.monthlyFixedCostsCents = financialData.monthlyFixedCostsCents ?? 0;
            }
            setFinancials(financialData);

            setNextSteps(data.nextSteps?.map(step => ({ ...step, category: step.category || 'General', priority: (step as any).priority || 'Medium' })) || []);
            setChatHistory(data.chatHistory || []);
            setStorefrontMockupUrl(data.storefrontMockupUrl || null);
            setSeoStrategy(data.seoStrategy || null);
            setShopifyIntegration(data.shopifyIntegration || null);
            setSupplierQuotes(data.supplierQuotes || []);
            setSupplierSuggestions(data.supplierSuggestions || null);
            setPriceHistory(data.priceHistory || []);
            setAdCampaigns(data.adCampaigns || null);
            setInfluencerMarketingPlan(data.influencerMarketingPlan || null);
            setCustomerSupportPlaybook(data.customerSupportPlaybook || null);
            setPackagingExperience(data.packagingExperience || null);
            setLegalChecklist(data.legalChecklist || null);
            setSocialMediaCalendar(data.socialMediaCalendar || null);
            setPhotographyPlan(data.photographyPlan || null);
            setAbTestPlan(data.abTestPlan || null);
            setEmailFunnel(data.emailFunnel || null);
            setPressRelease(data.pressRelease || null);

            
            setIsPlanSaved(true);
            setCurrentStep(2); // Go to blueprint step after loading
            setShowVentures(false);
        }
    };
    
    const renameVenture = (ventureId: string, newName: string) => {
        const updatedVentures = savedVentures.map(v => v.id === ventureId ? { ...v, name: newName, lastModified: new Date().toISOString() } : v);
        setSavedVentures(updatedVentures);
        localStorage.setItem('dad-ecommerce-ventures', JSON.stringify(updatedVentures));
        if(ventureId === ventureId) {
            setVentureName(newName);
        }
    };

    const deleteVenture = (ventureId: string) => {
        const updatedVentures = savedVentures.filter(v => v.id !== ventureId);
        setSavedVentures(updatedVentures);
        localStorage.setItem('dad-ecommerce-ventures', JSON.stringify(updatedVentures));
        if (ventureId === ventureId) {
            resetState();
        }
    };

    const handleSelectScoutIdea = (idea: string) => {
        setProductIdea(idea);
        setShowScout(false);
        setInputError(null);
    };

    const steps = ['Idea & Goals', 'Blueprint', 'Market Analysis', 'Launchpad'];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            <Header 
                onShowVentures={() => setShowVentures(true)} 
                hasVentures={savedVentures.length > 0}
                theme={theme}
                onToggleTheme={toggleTheme}
            />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
                <ProgressBar currentStep={currentStep} steps={steps} />
                
                <div key={currentStep} className="w-full animate-fade-in-up">
                    {currentStep === 1 && (
                        <Step1Idea
                            productIdea={productIdea}
                            onProductIdeaChange={handleProductIdeaChange}
                            handleGeneratePlan={handleGeneratePlan}
                            isLoading={isLoading}
                            inputError={inputError}
                            handleExampleClick={handleExampleClick}
                            brandVoice={brandVoice}
                            setBrandVoice={setBrandVoice}
                            onShowScout={() => setShowScout(true)}
                            smartGoals={smartGoals}
                            onProceedToBlueprint={handleProceedToBlueprint}
                        />
                    )}
                    {currentStep === 2 && plan && (
                        <Step2Blueprint
                            plan={plan}
                            productIdea={productIdea}
                            brandVoice={brandVoice}
                            onPlanChange={updatePlan}
                            logoImageUrl={logoImageUrl}
                            setLogoImageUrl={(url) => { setLogoImageUrl(url); onPlanModified(); }}
                            brandKit={brandKit}
                            setBrandKit={(kit) => { setBrandKit(kit); onPlanModified(); }}
                            onSavePlan={handleSavePlan}
                            isPlanSaved={isPlanSaved}
                            onNavigateToMarket={() => setCurrentStep(3)}
                            onBack={() => setCurrentStep(1)}
                        />
                    )}
                     {currentStep === 3 && plan && (
                        <Step3Market
                            productPlan={plan}
                            productIdea={productIdea}
                            brandVoice={brandVoice}
                            analysis={analysis}
                            setAnalysis={(a) => { setAnalysis(a); onPlanModified(); }}
                            swotAnalysis={swotAnalysis}
                            setSwotAnalysis={(s) => { setSwotAnalysis(s); onPlanModified(); }}
                            customerPersona={customerPersona}
                            setCustomerPersona={(p) => { setCustomerPersona(p); onPlanModified(); }}
                            personaAvatarUrl={personaAvatarUrl}
                            setPersonaAvatarUrl={(url) => { setPersonaAvatarUrl(url); onPlanModified(); }}
                            onNavigateToLaunchpad={() => setCurrentStep(4)}
                            onBack={() => setCurrentStep(2)}
                        />
                    )}
                    {currentStep === 4 && plan && (
                        <Step4Launchpad
                            productPlan={plan}
                            brandVoice={brandVoice}
                            competitiveAnalysis={analysis}
                            customerPersona={customerPersona}
                            logoImageUrl={logoImageUrl}
                            marketingPlan={marketingPlan}
                            setMarketingPlan={setMarketingPlan}
                            financials={financials}
                            setFinancials={setFinancials}
                            nextSteps={nextSteps}
                            setNextSteps={setNextSteps}
                            chatHistory={chatHistory}
                            setChatHistory={setChatHistory}
                            storefrontMockupUrl={storefrontMockupUrl}
                            setStorefrontMockupUrl={setStorefrontMockupUrl}
                            seoStrategy={seoStrategy}
                            setSeoStrategy={setSeoStrategy}
                            shopifyIntegration={shopifyIntegration}
                            setShopifyIntegration={setShopifyIntegration}
                            supplierQuotes={supplierQuotes}
                            setSupplierQuotes={setSupplierQuotes}
                            supplierSuggestions={supplierSuggestions}
                            setSupplierSuggestions={setSupplierSuggestions}
                            adCampaigns={adCampaigns}
                            setAdCampaigns={setAdCampaigns}
                            influencerMarketingPlan={influencerMarketingPlan}
                            setInfluencerMarketingPlan={setInfluencerMarketingPlan}
                            customerSupportPlaybook={customerSupportPlaybook}
                            setCustomerSupportPlaybook={setCustomerSupportPlaybook}
                            packagingExperience={packagingExperience}
                            setPackagingExperience={setPackagingExperience}
                            legalChecklist={legalChecklist}
                            setLegalChecklist={setLegalChecklist}
                            socialMediaCalendar={socialMediaCalendar}
                            setSocialMediaCalendar={setSocialMediaCalendar}
                            photographyPlan={photographyPlan}
                            setPhotographyPlan={setPhotographyPlan}
                            abTestPlan={abTestPlan}
                            setAbTestPlan={setAbTestPlan}
                            emailFunnel={emailFunnel}
                            setEmailFunnel={setEmailFunnel}
                            pressRelease={pressRelease}
                            setPressRelease={setPressRelease}
                            onPlanModified={onPlanModified}
                            onBack={() => setCurrentStep(3)}
                        />
                    )}
                </div>
            </main>
            <Footer />
            {showVentures && (
                <MyVenturesDashboard
                    ventures={savedVentures}
                    onLoad={loadVenture}
                    onRename={renameVenture}
                    onDelete={deleteVenture}
                    onClose={() => setShowVentures(false)}
                />
            )}
             {showScout && (
                <ProductScout
                    onClose={() => setShowScout(false)}
                    onSelectIdea={handleSelectScoutIdea}
                />
            )}
        </div>
    );
};

export default App;