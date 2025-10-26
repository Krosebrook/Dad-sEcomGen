import React, { useState, useCallback } from 'react';
import { ProductPlan, ProductVariant, RegenerateableSection } from '../../types';
import { generateLogo, regeneratePlanSection, generateProductPlan } from '../../services/geminiService';
import ProductPlanCard from '../ProductPlanCard';
import { Button } from '../ui/Button';

interface Step2BlueprintProps {
    plan: ProductPlan;
    productIdea: string;
    brandVoice: string;
    onPlanChange: (updatedPlan: ProductPlan) => void;
    logoImageUrl: string | null;
    setLogoImageUrl: (url: string | null) => void;
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
      const plan = await generateProductPlan(productIdea, brandVoice, updatedVariants);
      onPlanChange(plan);
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
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={onNavigateToMarket}>{'Next: Analyze Market'}</Button>
            </div>
        </div>
    );
};

export default Step2Blueprint;