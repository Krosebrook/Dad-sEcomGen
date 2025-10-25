import React, { useState, useCallback, useEffect } from 'react';
import { ProductPlan, ProductVariant } from './types';
import { generateProductPlan, generateLogo } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductPlanCard from './components/ProductPlanCard';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';

const App: React.FC = () => {
  const [productIdea, setProductIdea] = useState<string>('');
  const [productPlan, setProductPlan] = useState<ProductPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlanSaved, setIsPlanSaved] = useState<boolean>(false);
  const [savedPlanExists, setSavedPlanExists] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // State for logo generation
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState<boolean>(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoStyle, setLogoStyle] = useState<string>('Minimalist');
  const [logoColor, setLogoColor] = useState<string>('Default');

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

  const handleGeneratePlan = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productIdea.trim() || isLoading || inputError) return;

    setIsLoading(true);
    setError(null);
    setProductPlan(null);
    setLogoImageUrl(null);
    setLogoError(null);

    try {
      const plan = await generateProductPlan(productIdea);
      setProductPlan(plan);
      setIsPlanSaved(false);
    } catch (err) {
      console.error(err);
      setError('Failed to generate a product plan. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [productIdea, isLoading, inputError]);

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

  const handlePlanChange = (updatedPlan: ProductPlan) => {
    setProductPlan(updatedPlan);
    setIsPlanSaved(false);
  };
  
  const handleSavePlan = useCallback(() => {
    if (productPlan) {
      const dataToSave = {
        plan: productPlan,
        logoImageUrl: logoImageUrl,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      setIsPlanSaved(true);
      setSavedPlanExists(true);
    }
  }, [productPlan, logoImageUrl]);

  const handleLoadPlan = useCallback(() => {
    const savedPlanJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedPlanJSON) {
      const data = JSON.parse(savedPlanJSON) as { plan: ProductPlan, logoImageUrl: string | null };
      setProductPlan(data.plan);
      setLogoImageUrl(data.logoImageUrl || null);
      setIsPlanSaved(true);
      setError(null);
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

  const examplePrompts = [
    "Handmade leather wallets",
    "Smart gadgets for the garage",
    "Gourmet BBQ sauces",
    "Customizable wooden toys",
  ];

  const handleExampleClick = (prompt: string) => {
    setProductIdea(prompt);
    setInputError(null);
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
        <div className="w-full max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Turn Your Idea into a Plan
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Describe a product you'd like to sell, and our AI will generate a detailed business plan including pricing, variants, and marketing tags.
          </p>

          <form onSubmit={handleGeneratePlan} className="space-y-2">
            <div>
              <Input
                type="text"
                value={productIdea}
                onChange={handleProductIdeaChange}
                placeholder="e.g., 'A durable, stylish backpack for tech-savvy dads'"
                className="text-lg"
                disabled={isLoading}
                isInvalid={!!inputError}
                aria-invalid={!!inputError}
                aria-describedby="input-error"
              />
              {inputError && <p id="input-error" className="text-red-500 text-sm text-left mt-1">{inputError}</p>}
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2 pb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 self-center">Try an example:</span>
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
                {isLoading && !isGeneratingLogo ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate Product Plan'
                )}
              </Button>
              {savedPlanExists && (
                 <Button type="button" variant="outline" onClick={handleLoadPlan} disabled={isLoading} className="w-full sm:w-auto">
                    Load Saved Plan
                 </Button>
              )}
            </div>
          </form>
        </div>

        <div className="w-full max-w-4xl mt-12">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
              <p>{error}</p>
            </div>
          )}
          {productPlan && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={handleSavePlan} disabled={isPlanSaved} variant={isPlanSaved ? "outline" : "default"} className="px-4 py-2 text-sm">
                  {isPlanSaved ? '✔ Plan Saved' : 'Save Plan'}
                </Button>
              </div>
              <ProductPlanCard 
                plan={productPlan}
                logoImageUrl={logoImageUrl}
                isLoading={isLoading && !isGeneratingLogo}
                isGeneratingLogo={isGeneratingLogo}
                logoError={logoError}
                onGenerateLogo={handleGenerateLogo}
                onUpdatePlan={handleUpdatePlan}
                onPlanChange={handlePlanChange}
                logoStyle={logoStyle}
                onLogoStyleChange={setLogoStyle}
                logoColor={logoColor}
                onLogoColorChange={setLogoColor}
               />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;