import React, { useState, useCallback, useEffect } from 'react';
import { ProductPlan, ProductVariant, RegenerateableSection, MarketingKickstart, CompetitiveAnalysis, FinancialProjections } from './types';
import { generateProductPlan, generateLogo, generateCompetitiveAnalysis, regeneratePlanSection, generateMarketingKickstart, generateFinancialAssumptions } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductPlanCard from './components/ProductPlanCard';
import CompetitiveAnalysisCard from './components/CompetitiveAnalysisCard';
import MarketingKickstartCard from './components/MarketingKickstartCard';
import FinancialProjectionsCard from './components/FinancialProjectionsCard';
import ProgressBar from './components/ProgressBar';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [productIdea, setProductIdea] = useState<string>('');
  const [productPlan, setProductPlan] = useState<ProductPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlanSaved, setIsPlanSaved] = useState<boolean>(false);
  const [savedPlanExists, setSavedPlanExists] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<CompetitiveAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState<boolean>(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoStyle, setLogoStyle] = useState<string>('Minimalist');
  const [logoColor, setLogoColor] = useState<string>('Default');
  
  const [isRegenerating, setIsRegenerating] = useState<Record<RegenerateableSection, boolean>>({
    description: false,
    variants: false,
    tags: false,
  });

  const [marketingPlan, setMarketingPlan] = useState<MarketingKickstart | null>(null);
  const [isGeneratingMarketing, setIsGeneratingMarketing] = useState<boolean>(false);
  const [marketingError, setMarketingError] = useState<string | null>(null);

  const [financials, setFinancials] = useState<FinancialProjections | null>(null);
  const [isGeneratingFinancials, setIsGeneratingFinancials] = useState<boolean>(false);
  const [financialsError, setFinancialsError] = useState<string | null>(null);


  const LOCAL_STORAGE_KEY = 'ecommerceProductPlan';

  useEffect(() => {
    if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
      setSavedPlanExists(true);
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
    setLogoError(null);
    setAnalysis(null);
    setAnalysisError(null);
    setMarketingPlan(null);
    setMarketingError(null);
    setFinancials(null);
    setFinancialsError(null);
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
      setIsPlanSaved(false);
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
      setError('Failed to generate a product plan. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [productIdea, isLoading, inputError]);

  const handleNavigateToMarket = useCallback(async () => {
    if (!productIdea.trim() || isAnalyzing) return;
    setCurrentStep(3);
    setIsAnalyzing(true);
    setAnalysisError(null);
    if (!analysis) { // Only fetch if we don't have data
      try {
          const result = await generateCompetitiveAnalysis(productIdea);
          setAnalysis(result);
      } catch (err) {
          console.error(err);
          setAnalysisError('Failed to generate competitive analysis. Please try again.');
      } finally {
          setIsAnalyzing(false);
      }
    } else {
        setIsAnalyzing(false);
    }
  }, [productIdea, isAnalyzing, analysis]);

  const handleNavigateToLaunchpad = useCallback(async () => {
    if (!productPlan) return;
    setCurrentStep(4);

    if (!marketingPlan && !financials) { // Only fetch if we don't have data
        setIsGeneratingMarketing(true);
        setIsGeneratingFinancials(true);
        setMarketingError(null);
        setFinancialsError(null);
        try {
            const [marketingResult, financialResult] = await Promise.all([
                generateMarketingKickstart(productPlan),
                generateFinancialAssumptions(productPlan)
            ]);
            setMarketingPlan(marketingResult);
            setFinancials({
                ...financialResult,
                sellingPriceCents: productPlan.priceCents,
                estimatedMonthlySales: 50,
            });
        } catch (err) {
            console.error(err);
            const errorMessage = 'Failed to generate launchpad assets. Please try again.';
            setMarketingError(errorMessage);
            setFinancialsError(errorMessage);
        } finally {
            setIsGeneratingMarketing(false);
            setIsGeneratingFinancials(false);
        }
    }
}, [productPlan, marketingPlan, financials]);


  const handleUpdatePlan = useCallback(async (updatedVariants: ProductVariant[]) => {
    if (!productIdea.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setLogoError(null);

    try {
      const plan = await generateProductPlan(productIdea, updatedVariants);
      setProductPlan(plan);
      setIsPlanSaved(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update the product plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [productIdea, isLoading]);

  const handleRegenerateSection = useCallback(async (section: RegenerateableSection) => {
    if (!productPlan || isLoading) return;
    setIsRegenerating(prev => ({ ...prev, [section]: true }));
    setError(null);
    try {
      const regeneratedPart = await regeneratePlanSection(productIdea, productPlan, section);
      setProductPlan(prevPlan => {
        if (!prevPlan) return null;
        const newPlan = { ...prevPlan, ...regeneratedPart };
        if (section === 'variants' && newPlan.variants) {
          newPlan.stock = newPlan.variants.reduce((acc, v) => acc + v.stock, 0);
          if (newPlan.variants.length > 0) {
            newPlan.priceCents = newPlan.variants.reduce((acc, v) => acc + v.priceCents, 0) / newPlan.variants.length;
          }
        }
        return newPlan;
      });
      setIsPlanSaved(false);
    } catch (err) {
      console.error(`Failed to regenerate ${section}:`, err);
      setError(`Failed to regenerate ${section}. Please try again.`);
    } finally {
      setIsRegenerating(prev => ({ ...prev, [section]: false }));
    }
  }, [productPlan, productIdea, isLoading]);

  const handlePlanChange = (updatedPlan: ProductPlan) => {
    setProductPlan(updatedPlan);
    setIsPlanSaved(false);
  };
  
  const handleSavePlan = useCallback(() => {
    if (productPlan) {
      const dataToSave = { plan: productPlan, logoImageUrl: logoImageUrl };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      setIsPlanSaved(true);
      setSavedPlanExists(true);
    }
  }, [productPlan, logoImageUrl]);

  const handleLoadPlan = useCallback(() => {
    const savedPlanJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedPlanJSON) {
      const data = JSON.parse(savedPlanJSON) as { plan: ProductPlan, logoImageUrl: string | null };
      resetAllOutputs();
      setProductPlan(data.plan);
      setProductIdea(data.plan.productTitle);
      setLogoImageUrl(data.logoImageUrl || null);
      setIsPlanSaved(true);
      setError(null);
      setCurrentStep(2);
    }
  }, []);

  const handleGenerateLogo = useCallback(async () => {
    if (!productPlan || isGeneratingLogo) return;

    setIsGeneratingLogo(true);
    setLogoError(null);
    try {
      const imageUrl = await generateLogo(productPlan.productTitle, logoStyle, logoColor);
      setLogoImageUrl(imageUrl);
    } catch (err) {
      console.error(err);
      setLogoError('Logo generation failed.');
    } finally {
      setIsGeneratingLogo(false);
    }
  }, [productPlan, isGeneratingLogo, logoStyle, logoColor]);

  const handleStartOver = () => {
    setProductIdea('');
    resetAllOutputs();
    setCurrentStep(1);
  };

  const examplePrompts = ["Handmade leather wallets", "Smart gadgets for the garage", "Gourmet BBQ sauces", "Customizable wooden toys"];
  const handleExampleClick = (prompt: string) => { setProductIdea(prompt); setInputError(null); };

  const steps = ["Idea", "Blueprint", "Market", "Launchpad"];
  
  const LoadingSpinner = ({message}: {message: string}) => (
      <div className="flex justify-center items-center flex-col gap-4 p-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
        <svg className="animate-spin h-8 w-8 text-slate-600 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
      </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="w-full max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Turn Your Idea into a Plan</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Describe a product you'd like to sell, and our AI will generate a detailed business plan.</p>
            <form onSubmit={handleGeneratePlan} className="space-y-2">
              <div>
                <Input type="text" value={productIdea} onChange={handleProductIdeaChange} placeholder="e.g., 'A durable, stylish backpack for tech-savvy dads'" className="text-lg" disabled={isLoading} isInvalid={!!inputError} aria-invalid={!!inputError} aria-describedby="input-error"/>
                {inputError && <p id="input-error" className="text-red-500 text-sm text-left mt-1">{inputError}</p>}
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2 pb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 self-center">Try an example:</span>
                {examplePrompts.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => handleExampleClick(prompt)} className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">{prompt}</button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                <Button type="submit" disabled={isLoading || !productIdea.trim() || !!inputError} className="w-full sm:w-auto">
                  {isLoading ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</>) : ('Generate Plan')}
                </Button>
                {savedPlanExists && (<Button type="button" variant="outline" onClick={handleLoadPlan} disabled={isLoading} className="w-full sm:w-auto">Load Saved Plan</Button>)}
              </div>
            </form>
          </div>
        );
      case 2:
        return productPlan && (
          <div className="w-full max-w-4xl space-y-8">
            <div className="flex justify-end"><Button onClick={handleSavePlan} disabled={isPlanSaved} variant={isPlanSaved ? "outline" : "default"} className="px-4 py-2 text-sm">{isPlanSaved ? '✔ Plan Saved' : 'Save Plan'}</Button></div>
            <ProductPlanCard plan={productPlan} logoImageUrl={logoImageUrl} isLoading={isLoading} isGeneratingLogo={isGeneratingLogo} isRegenerating={isRegenerating} logoError={logoError} onGenerateLogo={handleGenerateLogo} onUpdatePlan={handleUpdatePlan} onPlanChange={handlePlanChange} onRegenerateSection={handleRegenerateSection} logoStyle={logoStyle} onLogoStyleChange={setLogoStyle} logoColor={logoColor} onLogoColorChange={setLogoColor} />
            <div className="flex justify-between items-center"><Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button><Button onClick={handleNavigateToMarket} disabled={isAnalyzing}>{'Next: Analyze Market'}</Button></div>
          </div>
        );
      case 3:
        return (
          <div className="w-full max-w-4xl space-y-8">
            {analysisError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert"><p>{analysisError}</p></div>}
            {isAnalyzing && <LoadingSpinner message="Analyzing market intelligence..." />}
            {analysis && !isAnalyzing && <CompetitiveAnalysisCard analysis={analysis} />}
            <div className="flex justify-between items-center"><Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button><Button onClick={handleNavigateToLaunchpad} disabled={!analysis || isAnalyzing}>{'Next: Plan Launch'}</Button></div>
          </div>
        );
      case 4:
          const launchpadLoading = isGeneratingMarketing || isGeneratingFinancials;
          return (
            <div className="w-full max-w-4xl space-y-8">
              {marketingError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert"><p>{marketingError}</p></div>}
              {launchpadLoading && <LoadingSpinner message="Building your launchpad..." />}
              {!launchpadLoading && (
                <>
                  {marketingPlan && <MarketingKickstartCard marketingPlan={marketingPlan} />}
                  {financials && productPlan && <FinancialProjectionsCard financials={financials} onFinancialsChange={setFinancials} currency={productPlan.currency}/>}
                </>
              )}
              <div className="flex justify-between items-center pt-8">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
                <Button onClick={handleStartOver} size="default">Start a New Plan</Button>
              </div>
            </div>
          );
      default:
        return <div>Invalid Step</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-200">
      <Header />
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