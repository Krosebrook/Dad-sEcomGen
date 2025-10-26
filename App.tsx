import React, { useState, useCallback, useEffect } from 'react';
import { ProductPlan, MarketingKickstart, CompetitiveAnalysis, FinancialProjections, NextStepItem, SavedVenture, ChatMessage } from './types';
import { generateProductPlan } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import ProgressBar from './components/ProgressBar';
import Step1Idea from './components/steps/Step1Idea';
import Step2Blueprint from './components/steps/Step2Blueprint';
import Step3Market from './components/steps/Step3Market';
import Step4Launchpad from './components/steps/Step4Launchpad';
import MyVenturesDashboard from './components/MyVenturesDashboard';


const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [productIdea, setProductIdea] = useState<string>('');
  const [productPlan, setProductPlan] = useState<ProductPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlanSaved, setIsPlanSaved] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Multi-venture state
  const [ventures, setVentures] = useState<SavedVenture[]>([]);
  const [currentVentureId, setCurrentVentureId] = useState<string | null>(null);
  const [isDashboardVisible, setIsDashboardVisible] = useState<boolean>(false);

  const [analysis, setAnalysis] = useState<CompetitiveAnalysis | null>(null);
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [marketingPlan, setMarketingPlan] = useState<MarketingKickstart | null>(null);
  const [financials, setFinancials] = useState<FinancialProjections | null>(null);
  const [nextSteps, setNextSteps] = useState<NextStepItem[] | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[] | null>(null);


  const VENTURES_STORAGE_KEY = 'myVentures';

  useEffect(() => {
    try {
      const savedVenturesJSON = localStorage.getItem(VENTURES_STORAGE_KEY);
      if (savedVenturesJSON) {
        const savedVentures = JSON.parse(savedVenturesJSON);
        setVentures(savedVentures);
      }
    } catch (e) {
      console.error("Failed to load ventures from storage:", e);
      setVentures([]);
    }
  }, []);

  const handleProductIdeaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductIdea(value);

    const validationRegex = /^[a-zA-Z0-9\s]*$/;
    if (validationRegex.test(value)) {
      setInputError(null);
    } else {
      setInputError('Only letters, numbers, and spaces are allowed.');
    }
  };
  
  const resetAllOutputs = () => {
    setProductPlan(null);
    setLogoImageUrl(null);
    setAnalysis(null);
    setMarketingPlan(null);
    setFinancials(null);
    setNextSteps(null);
    setChatHistory(null);
    setCurrentVentureId(null);
    setIsPlanSaved(false);
  };

  const handleGeneratePlan = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productIdea.trim() || isLoading || inputError) return;

    setIsLoading(true);
    setError(null);
    resetAllOutputs();

    try {
      const plan = await generateProductPlan(productIdea);
      setProductPlan(plan);
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
      setError('Failed to generate a product plan. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [productIdea, isLoading, inputError]);
  
  const handlePlanChange = (updatedPlan: ProductPlan) => {
    setProductPlan(updatedPlan);
    setIsPlanSaved(false);
  };

  const handlePlanModified = useCallback(() => {
    setIsPlanSaved(false);
  }, []);
  
  const handleSaveVenture = useCallback(() => {
    if (!productPlan) return;

    let ventureName = '';
    let ventureToUpdate: SavedVenture | undefined;

    if (currentVentureId) {
        ventureToUpdate = ventures.find(v => v.id === currentVentureId);
        ventureName = ventureToUpdate?.name || productPlan.productTitle;
    } else {
        ventureName = prompt("Enter a name for your new venture:", productPlan.productTitle) || '';
        if (!ventureName) return; // User cancelled
    }

    const ventureData = { 
        plan: productPlan, 
        logoImageUrl,
        analysis,
        marketingPlan,
        financials,
        nextSteps,
        chatHistory
    };

    let newVentures: SavedVenture[];
    let newVentureId = currentVentureId;

    if (ventureToUpdate) {
        // Update existing venture
        const updatedVenture = { ...ventureToUpdate, name: ventureName, lastModified: new Date().toISOString(), data: ventureData };
        newVentures = ventures.map(v => v.id === currentVentureId ? updatedVenture : v);
    } else {
        // Create new venture
        newVentureId = Date.now().toString();
        const newVenture: SavedVenture = {
            id: newVentureId,
            name: ventureName,
            lastModified: new Date().toISOString(),
            data: ventureData
        };
        newVentures = [...ventures, newVenture];
    }
    
    setVentures(newVentures);
    setCurrentVentureId(newVentureId);
    localStorage.setItem(VENTURES_STORAGE_KEY, JSON.stringify(newVentures));
    setIsPlanSaved(true);

  }, [productPlan, logoImageUrl, analysis, marketingPlan, financials, nextSteps, chatHistory, ventures, currentVentureId]);


  const handleLoadVenture = useCallback((ventureId: string) => {
    const ventureToLoad = ventures.find(v => v.id === ventureId);
    if (ventureToLoad) {
      const data = ventureToLoad.data;
      resetAllOutputs();
      setProductPlan(data.plan);
      setProductIdea(data.plan.productTitle);
      setLogoImageUrl(data.logoImageUrl || null);
      setAnalysis(data.analysis || null);
      setMarketingPlan(data.marketingPlan || null);
      setFinancials(data.financials || null);
      setNextSteps(data.nextSteps || null);
      setChatHistory(data.chatHistory || null);
      setCurrentVentureId(ventureToLoad.id);
      setIsPlanSaved(true);
      setError(null);
      setCurrentStep(2); // Start at the blueprint step
      setIsDashboardVisible(false);
    }
  }, [ventures]);

  const handleRenameVenture = (ventureId: string, newName: string) => {
    const newVentures = ventures.map(v => v.id === ventureId ? { ...v, name: newName, lastModified: new Date().toISOString() } : v);
    setVentures(newVentures);
    localStorage.setItem(VENTURES_STORAGE_KEY, JSON.stringify(newVentures));
  };
  
  const handleDeleteVenture = (ventureId: string) => {
    if (confirm("Are you sure you want to delete this venture? This action cannot be undone.")) {
        const newVentures = ventures.filter(v => v.id !== ventureId);
        setVentures(newVentures);
        localStorage.setItem(VENTURES_STORAGE_KEY, JSON.stringify(newVentures));
        if (currentVentureId === ventureId) {
            handleStartOver();
        }
    }
  };

  const handleStartOver = () => {
    setProductIdea('');
    resetAllOutputs();
    setCurrentStep(1);
  };

  const handleExampleClick = (prompt: string) => { setProductIdea(prompt); setInputError(null); };

  const steps = ["Idea", "Blueprint", "Market", "Launchpad"];
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Idea
            productIdea={productIdea}
            onProductIdeaChange={handleProductIdeaChange}
            handleGeneratePlan={handleGeneratePlan}
            isLoading={isLoading}
            inputError={inputError}
            handleExampleClick={handleExampleClick}
          />
        );
      case 2:
        return productPlan && (
          <Step2Blueprint
            plan={productPlan}
            productIdea={productIdea}
            onPlanChange={handlePlanChange}
            logoImageUrl={logoImageUrl}
            setLogoImageUrl={setLogoImageUrl}
            onSavePlan={handleSaveVenture}
            isPlanSaved={isPlanSaved}
            onNavigateToMarket={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <Step3Market
            productIdea={productIdea}
            analysis={analysis}
            setAnalysis={setAnalysis}
            onNavigateToLaunchpad={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        );
      case 4:
          return productPlan && (
            <Step4Launchpad
                productPlan={productPlan}
                marketingPlan={marketingPlan}
                setMarketingPlan={setMarketingPlan}
                financials={financials}
                setFinancials={setFinancials}
                nextSteps={nextSteps}
                setNextSteps={setNextSteps}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                onBack={() => setCurrentStep(3)}
                onStartOver={handleStartOver}
                isPlanSaved={isPlanSaved}
                onSavePlan={handleSaveVenture}
                onPlanModified={handlePlanModified}
                logoImageUrl={logoImageUrl}
                analysis={analysis}
            />
          );
      default:
        return <div>Invalid Step</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-200">
      <Header onShowVentures={() => setIsDashboardVisible(true)} hasVentures={ventures.length > 0} />
       {isDashboardVisible && (
        <MyVenturesDashboard
          ventures={ventures}
          onLoad={handleLoadVenture}
          onRename={handleRenameVenture}
          onDelete={handleDeleteVenture}
          onClose={() => setIsDashboardVisible(false)}
        />
      )}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
        <ProgressBar currentStep={currentStep} steps={steps} />
        {error && (
            <div className="w-full max-w-3xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center mb-8" role="alert">
              <p>{error}</p>
            </div>
        )}
        {renderStepContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
