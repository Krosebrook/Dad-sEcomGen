import React, { useState, useCallback } from 'react';
import { ProductPlan, ProductVariant, RegenerateableSection, BrandIdentityKit } from '../../types';
import { generateLogo, regeneratePlanSection, generateProductPlan, generateBrandIdentity } from '../../services/geminiService';
import ProductPlanCard from '../ProductPlanCard';
import BrandIdentityCard from '../BrandIdentityCard';
import { Button } from '../ui/Button';

interface Step2BlueprintProps {
    plan: ProductPlan;
    productIdea: string;
    brandVoice: string;
    onPlanChange: (updatedPlan: ProductPlan) => void;
    logoImageUrl: string | null;
    setLogoImageUrl: (url: string | null) => void;
    brandKit: BrandIdentityKit | null;
    setBrandKit: (kit: BrandIdentityKit | null) => void;
    onSavePlan: () => void;
    isPlanSaved: boolean;
    onNavigateToMarket: () => void;
    onBack: () => void;
}

const Step2Blueprint: React.FC<Step2BlueprintProps> = ({
    plan,
    productIdea,
    brandVoice,
    onPlanChange,
    logoImageUrl,
    setLogoImageUrl,
    brandKit,
    setBrandKit,
    onSavePlan,
    isPlanSaved,
    onNavigateToMarket,
    onBack,
}) => {
    const [isGeneratingLogo, setIsGeneratingLogo] = useState<boolean>(false);
    const [logoError, setLogoError] = useState<string | null>(null);
    const [logoStyle, setLogoStyle] = useState<string>('Minimalist');
    const [logoColor, setLogoColor] = useState<string>('Default');
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [isRegenerating, setIsRegenerating] = useState<Record<RegenerateableSection, boolean>>({
        description: false,
        variants: false,
        tags: false,
    });
    const [isGeneratingKit, setIsGeneratingKit] = useState<boolean>(false);

    const handleGenerateLogo = useCallback(async () => {
        if (!plan || isGeneratingLogo) return;

        setIsGeneratingLogo(true);
        setLogoError(null);
        try {
            const imageUrl = await generateLogo(plan.productTitle, logoStyle, logoColor);
            setLogoImageUrl(imageUrl);
        } catch (err) {
            console.error(err);
            setLogoError('Logo generation failed.');
        } finally {
            setIsGeneratingLogo(false);
        }
    }, [plan, isGeneratingLogo, logoStyle, logoColor, setLogoImageUrl]);

    const handleGenerateKit = useCallback(async () => {
        if (!plan || isGeneratingKit) return;
        setIsGeneratingKit(true);
        try {
            const kit = await generateBrandIdentity(plan, brandVoice);
            setBrandKit(kit);
        } catch (err) {
            console.error(err);
            // Optionally, set an error state to show the user
        } finally {
            setIsGeneratingKit(false);
        }
    }, [plan, isGeneratingKit, brandVoice, setBrandKit]);

    const handleRegenerateSection = useCallback(async (section: RegenerateableSection) => {
        if (!plan) return;
        setIsRegenerating(prev => ({ ...prev, [section]: true }));
        try {
            const regeneratedPart = await regeneratePlanSection(productIdea, plan, section, brandVoice);
            const newPlan = { ...plan, ...regeneratedPart };
            if (section === 'variants' && newPlan.variants) {
                newPlan.stock = newPlan.variants.reduce((acc, v) => acc + v.stock, 0);
                if (newPlan.variants.length > 0) {
                    newPlan.priceCents = newPlan.variants.reduce((acc, v) => acc + v.priceCents, 0) / newPlan.variants.length;
                }
            }
            onPlanChange(newPlan);
        } catch (err) {
            console.error(`Failed to regenerate ${section}:`, err);
            // You might want to show an error to the user here
        } finally {
            setIsRegenerating(prev => ({ ...prev, [section]: false }));
        }
    }, [plan, productIdea, onPlanChange, brandVoice]);
    
    const handleUpdatePlan = useCallback(async (updatedVariants: ProductVariant[]) => {
    if (!productIdea.trim()) return;

    setIsUpdating(true);
    setLogoError(null);

    try {
      const { plan: newPlan } = await generateProductPlan(productIdea, brandVoice, updatedVariants);
      onPlanChange(newPlan);
    } catch (err) {
      console.error(err);
      // You might want to show an error to the user here
    } finally {
      setIsUpdating(false);
    }
  }, [productIdea, onPlanChange, brandVoice]);


    return (
        <div className="w-full max-w-4xl space-y-8 animate-fade-in">
            <div className="flex justify-end">
                <Button onClick={onSavePlan} disabled={isPlanSaved} variant={isPlanSaved ? "outline" : "default"} className="px-4 py-2 text-sm">
                    {isPlanSaved ? '✔ Plan Saved' : 'Save Plan'}
                </Button>
            </div>
            <ProductPlanCard
                plan={plan}
                logoImageUrl={logoImageUrl}
                isLoading={isUpdating}
                isGeneratingLogo={isGeneratingLogo}
                isRegenerating={isRegenerating}
                logoError={logoError}
                onGenerateLogo={handleGenerateLogo}
                onUpdatePlan={handleUpdatePlan}
                onPlanChange={onPlanChange}
                onRegenerateSection={handleRegenerateSection}
                logoStyle={logoStyle}
                onLogoStyleChange={setLogoStyle}
                logoColor={logoColor}
                onLogoColorChange={setLogoColor}
            />

            {logoImageUrl && !brandKit && (
                 <div className="text-center">
                    <Button onClick={handleGenerateKit} disabled={isGeneratingKit}>
                         {isGeneratingKit ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Kit...
                            </>
                        ) : (
                            '✨ Generate Brand Identity Kit'
                        )}
                    </Button>
                </div>
            )}
           
            {brandKit && <BrandIdentityCard brandKit={brandKit} />}

            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={onNavigateToMarket}>{'Next: Analyze Market'}</Button>
            </div>
        </div>
    );
};

export default Step2Blueprint;