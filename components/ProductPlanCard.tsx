import React, { useState } from 'react';
import { ProductPlan } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';

interface ProductPlanCardProps {
  plan: ProductPlan;
  logoImageUrl: string | null;
  isGeneratingLogo: boolean;
  logoError: string | null;
  onGenerateLogo: () => void;
  logoStyle: string;
  onLogoStyleChange: (style: string) => void;
  logoColor: string;
  onLogoColorChange: (color: string) => void;
}

const formatCurrency = (cents: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
};

const ProductPlanCard: React.FC<ProductPlanCardProps> = ({ 
  plan, 
  logoImageUrl, 
  isGeneratingLogo, 
  logoError, 
  onGenerateLogo,
  logoStyle,
  onLogoStyleChange,
  logoColor,
  onLogoColorChange
}) => {
  const [isVariantsExpanded, setIsVariantsExpanded] = useState(false);

  const logoStyles = ['Minimalist', 'Bold', 'Abstract'];
  const logoColors = ['Default', 'Cool-Tones', 'Warm-Tones', 'Monochrome'];

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-shrink-0 w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center text-center p-2">
            {logoImageUrl ? (
              <img src={logoImageUrl} alt={`${plan.productTitle} logo`} className="w-full h-full object-contain rounded-md" />
            ) : (
              <div className="w-full space-y-2">
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Style</label>
                    <div className="flex flex-wrap gap-1 justify-center mt-1">
                      {logoStyles.map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => onLogoStyleChange(style)}
                          disabled={isGeneratingLogo}
                          className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                            logoStyle === style
                              ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900'
                              : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                   <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Color</label>
                    <div className="flex flex-wrap gap-1 justify-center mt-1">
                      {logoColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => onLogoColorChange(color)}
                          disabled={isGeneratingLogo}
                          className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                            logoColor === color
                              ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900'
                              : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600'
                          }`}
                        >
                          {color.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                 <Button onClick={onGenerateLogo} disabled={isGeneratingLogo} size="sm" className="w-full text-xs px-3 py-1.5">
                  {isGeneratingLogo ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Generate Logo'
                  )}
                </Button>
                {logoError && <p className="text-xs text-red-500">{logoError}</p>}
              </div>
            )}
          </div>
          <div className="flex-grow">
            <CardTitle className="text-2xl md:text-3xl">{plan.productTitle}</CardTitle>
            <CardDescription>/{plan.slug}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Description</h3>
          <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{plan.description}</p>
        </div>

        {/* Core Info Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400">Price</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(plan.priceCents, plan.currency)}</div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400">Base SKU</div>
            <div className="text-xl font-mono text-slate-900 dark:text-white">{plan.sku}</div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400">Stock</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{plan.stock}</div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400">Currency</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{plan.currency}</div>
          </div>
        </div>

        {/* Variants Section */}
        {plan.variants && plan.variants.length > 0 && (
          <div>
            <div
              className="flex justify-between items-center cursor-pointer select-none"
              onClick={() => setIsVariantsExpanded(!isVariantsExpanded)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsVariantsExpanded(!isVariantsExpanded); }}
              aria-expanded={isVariantsExpanded}
              aria-controls="variants-section"
            >
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Product Variants</h3>
              <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                <span>{isVariantsExpanded ? 'Hide' : 'Show'} ({plan.variants.length})</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`ml-1 h-5 w-5 transition-transform duration-200 ${isVariantsExpanded ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {isVariantsExpanded && (
              <div id="variants-section" className="overflow-x-auto mt-2">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="p-3 font-semibold">Variant</th>
                      <th className="p-3 font-semibold">SKU</th>
                      <th className="p-3 font-semibold">Price</th>
                      <th className="p-3 font-semibold text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.variants.map((variant, index) => (
                      <tr key={index} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="p-3">{variant.title}</td>
                        <td className="p-3 font-mono">{variant.sku}</td>
                        <td className="p-3">{formatCurrency(variant.priceCents, plan.currency)}</td>
                        <td className="p-3 text-right">{variant.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tags Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Marketing Tags</h3>
          <div className="flex flex-wrap gap-2">
            {plan.tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPlanCard;