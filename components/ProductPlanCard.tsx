import React, { useState, useEffect } from 'react';
import { ProductPlan, ProductVariant, RegenerateableSection } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';

interface ProductPlanCardProps {
  plan: ProductPlan;
  logoImageUrl: string | null;
  isLoading: boolean;
  isGeneratingLogo: boolean;
  isRegenerating: Record<RegenerateableSection, boolean>;
  logoError: string | null;
  onGenerateLogo: () => void;
  onUpdatePlan: (variants: ProductVariant[]) => void;
  onPlanChange: (plan: ProductPlan) => void;
  onRegenerateSection: (section: RegenerateableSection) => void;
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

const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
);

const ReloadIcon: React.FC<{ className?: string, isSpinning?: boolean }> = ({ className, isSpinning }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} ${isSpinning ? 'animate-spin' : ''}`}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
);


const ProductPlanCard: React.FC<ProductPlanCardProps> = ({ 
  plan, 
  logoImageUrl, 
  isLoading,
  isGeneratingLogo,
  isRegenerating, 
  logoError, 
  onGenerateLogo,
  onUpdatePlan,
  onPlanChange,
  onRegenerateSection,
  logoStyle,
  onLogoStyleChange,
  logoColor,
  onLogoColorChange
}) => {
  const [isVariantsExpanded, setIsVariantsExpanded] = useState(true);
  const [editableVariants, setEditableVariants] = useState<ProductVariant[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [editingField, setEditingField] = useState<keyof ProductPlan | null>(null);
  const [editedContent, setEditedContent] = useState<string | number>('');

  useEffect(() => {
    setEditableVariants(plan.variants.map(v => ({...v})));
    setHasChanges(false);
  }, [plan]);

  const handleVariantChange = (index: number, field: 'priceCents' | 'stock', value: string) => {
    const newVariants = [...editableVariants];
    const variantToUpdate = { ...newVariants[index] };

    if (field === 'priceCents') {
      const priceValue = parseFloat(value);
      variantToUpdate.priceCents = isNaN(priceValue) ? 0 : Math.round(priceValue * 100);
    } else if (field === 'stock') {
      const stockValue = parseInt(value, 10);
      variantToUpdate.stock = isNaN(stockValue) ? 0 : stockValue;
    }
    
    newVariants[index] = variantToUpdate;
    setEditableVariants(newVariants);
    setHasChanges(JSON.stringify(newVariants) !== JSON.stringify(plan.variants));
  };

  const handleUpdateClick = () => {
    if (hasChanges) {
      onUpdatePlan(editableVariants);
    }
  };

  const handleEditStart = (field: keyof ProductPlan, currentContent: string | number | string[]) => {
    if (isLoading || isGeneratingLogo) return;
    setEditingField(field);
    if (Array.isArray(currentContent)) {
        setEditedContent(currentContent.join(', '));
    } else {
        setEditedContent(currentContent);
    }
  };

  const handleEditSave = () => {
    if (!editingField) return;
    let finalContent: any = editedContent;

    if (editingField === 'materials') {
        finalContent = typeof editedContent === 'string' 
            ? editedContent.split(',').map(s => s.trim()).filter(Boolean) 
            : [];
    } else if (editingField === 'weightGrams') {
        finalContent = Number(editedContent) || 0;
    }
    
    const updatedPlan = { ...plan, [editingField]: finalContent };
    onPlanChange(updatedPlan);
    setEditingField(null);
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditedContent('');
  };

  const overallLoading = isLoading || isGeneratingLogo || Object.values(isRegenerating).some(v => v);

  const logoStyles = ['Minimalist', 'Bold', 'Abstract', 'Geometric', 'Vintage', 'Hand-drawn'];
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
                          disabled={isGeneratingLogo || isLoading}
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
                          disabled={isGeneratingLogo || isLoading}
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
                 <Button onClick={onGenerateLogo} disabled={isGeneratingLogo || isLoading} size="sm" className="w-full text-xs px-3 py-1.5">
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
          <div className="flex-grow w-full">
            {editingField === 'productTitle' ? (
              <div className="space-y-2">
                  <Input
                    type="text"
                    value={editedContent as string}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="text-2xl md:text-3xl font-semibold h-auto py-1"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleEditSave} size="sm">Save</Button>
                    <Button onClick={handleEditCancel} variant="outline" size="sm">Cancel</Button>
                  </div>
              </div>
            ) : (
              <div 
                className="group flex items-start gap-2 cursor-pointer" 
                onClick={() => handleEditStart('productTitle', plan.productTitle)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEditStart('productTitle', plan.productTitle); }}
              >
                <CardTitle className="text-2xl md:text-3xl">{plan.productTitle}</CardTitle>
                <PencilIcon className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 mt-2 flex-shrink-0" />
              </div>
            )}
            <CardDescription>/{plan.slug}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Description</h3>
            <button
                onClick={() => onRegenerateSection('description')}
                disabled={overallLoading}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
                aria-label="Regenerate description"
            >
                <ReloadIcon isSpinning={isRegenerating.description} />
            </button>
             {editingField !== 'description' && (
              <button 
                className="group"
                onClick={() => handleEditStart('description', plan.description)}
                aria-label="Edit description"
              >
                <PencilIcon className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
              </button>
             )}
          </div>
          {editingField === 'description' ? (
             <div className="space-y-2">
                <Textarea
                  value={editedContent as string}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[200px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button onClick={handleEditSave} size="sm">Save</Button>
                  <Button onClick={handleEditCancel} variant="outline" size="sm">Cancel</Button>
                </div>
            </div>
          ) : (
             <p 
              className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap cursor-pointer"
              onClick={() => handleEditStart('description', plan.description)}
             >{plan.description}</p>
          )}
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

        {/* Product Specifications Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Product Specifications</h3>
            <div className="space-y-4">
                {/* Materials */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300">Materials</h4>
                        <button onClick={() => onRegenerateSection('materials')} disabled={overallLoading} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50" aria-label="Regenerate materials">
                            <ReloadIcon isSpinning={isRegenerating.materials} />
                        </button>
                        {editingField !== 'materials' && (
                            <button className="group" onClick={() => handleEditStart('materials', plan.materials)} aria-label="Edit materials">
                                <PencilIcon className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                            </button>
                        )}
                    </div>
                    {editingField === 'materials' ? (
                        <div className="space-y-2">
                            <Input value={editedContent as string} onChange={(e) => setEditedContent(e.target.value)} placeholder="e.g., Cotton, Leather, Recycled Polyester" autoFocus />
                            <div className="flex gap-2"><Button onClick={handleEditSave} size="sm">Save</Button><Button onClick={handleEditCancel} variant="outline" size="sm">Cancel</Button></div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {(plan.materials || []).map((material, index) => (
                                <span key={index} className="bg-slate-200 text-slate-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">{material}</span>
                            ))}
                        </div>
                    )}
                </div>
                {/* Dimensions & Weight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Dimensions</h4>
                            {editingField !== 'dimensions' && (
                                <button className="group" onClick={() => handleEditStart('dimensions', plan.dimensions)} aria-label="Edit dimensions">
                                    <PencilIcon className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                                </button>
                            )}
                        </div>
                        {editingField === 'dimensions' ? (
                            <div className="space-y-2">
                                <Input value={editedContent as string} onChange={(e) => setEditedContent(e.target.value)} placeholder="e.g., 15cm x 10cm x 5cm" autoFocus />
                                <div className="flex gap-2"><Button onClick={handleEditSave} size="sm">Save</Button><Button onClick={handleEditCancel} variant="outline" size="sm">Cancel</Button></div>
                            </div>
                        ) : (
                            <p className="text-slate-600 dark:text-slate-400">{plan.dimensions || 'N/A'}</p>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Weight</h4>
                            {editingField !== 'weightGrams' && (
                                <button className="group" onClick={() => handleEditStart('weightGrams', plan.weightGrams)} aria-label="Edit weight">
                                    <PencilIcon className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                                </button>
                            )}
                        </div>
                        {editingField === 'weightGrams' ? (
                            <div className="space-y-2">
                                <Input type="number" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} placeholder="e.g., 500" autoFocus />
                                <div className="flex gap-2"><Button onClick={handleEditSave} size="sm">Save</Button><Button onClick={handleEditCancel} variant="outline" size="sm">Cancel</Button></div>
                            </div>
                        ) : (
                            <p className="text-slate-600 dark:text-slate-400">{plan.weightGrams > 0 ? `${plan.weightGrams} g` : 'N/A'}</p>
                        )}
                    </div>
                </div>
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
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Product Variants</h3>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRegenerateSection('variants');
                    }}
                    disabled={overallLoading}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
                    aria-label="Regenerate variants"
                >
                    <ReloadIcon isSpinning={isRegenerating.variants} />
                </button>
              </div>
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
              <div id="variants-section" className="overflow-x-auto mt-2 space-y-3">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="p-3 font-semibold">Variant</th>
                      <th className="p-3 font-semibold">SKU</th>
                      <th className="p-3 font-semibold">Price ({plan.currency})</th>
                      <th className="p-3 font-semibold text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableVariants.map((variant, index) => (
                      <tr key={variant.sku} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="p-2">{variant.title}</td>
                        <td className="p-2 font-mono">{variant.sku}</td>
                        <td className="p-2">
                          <Input 
                            type="number"
                            value={variant.priceCents / 100}
                            onChange={(e) => handleVariantChange(index, 'priceCents', e.target.value)}
                            className="h-9 w-24"
                            disabled={isLoading}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="p-2 text-right">
                           <Input 
                            type="number"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                            className="h-9 w-24"
                            disabled={isLoading}
                            min="0"
                            step="1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                 {hasChanges && (
                  <div className="flex justify-end items-center gap-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                    <p className="text-sm text-slate-600 dark:text-slate-300">You have unsaved variant changes.</p>
                    <Button onClick={handleUpdateClick} disabled={isLoading} size="sm">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        'Update Plan with New Variants'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tags Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Marketing Tags</h3>
            <button
                onClick={() => onRegenerateSection('tags')}
                disabled={overallLoading}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
                aria-label="Regenerate marketing tags"
            >
                <ReloadIcon isSpinning={isRegenerating.tags} />
            </button>
          </div>
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