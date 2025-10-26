import React from 'react';
import { ProductPlan, CompetitiveAnalysis, MarketingKickstart, FinancialProjections, NextStepItem } from '../types';

interface PdfExportTemplateProps {
    productPlan: ProductPlan;
    logoImageUrl: string | null;
    analysis: CompetitiveAnalysis | null;
    marketingPlan: MarketingKickstart | null;
    financials: FinancialProjections | null;
    nextSteps: NextStepItem[] | null;
}

const formatCurrency = (cents: number, currency: string = 'USD') => {
  if (isNaN(cents)) return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
        <h2 className="text-2xl font-bold border-b-2 border-gray-800 pb-2 mb-4">{title}</h2>
        {children}
    </div>
);

const PdfExportTemplate: React.FC<PdfExportTemplateProps> = ({
    productPlan,
    logoImageUrl,
    analysis,
    marketingPlan,
    financials,
    nextSteps,
}) => {
    return (
        <div className="bg-white text-gray-800 p-12 font-sans" style={{ width: '210mm' }}>
            {/* Cover Page */}
            <div className="flex flex-col items-center justify-center text-center mb-16" style={{ height: '297mm', pageBreakAfter: 'always' }}>
                {logoImageUrl && <img src={logoImageUrl} alt="logo" className="w-48 h-48 object-contain mb-8" />}
                <h1 className="text-5xl font-bold mb-4">{productPlan.productTitle}</h1>
                <p className="text-2xl text-gray-600">E-commerce Business Plan</p>
                <p className="mt-auto text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Product Blueprint */}
            <Section title="Product Blueprint">
                <p className="whitespace-pre-wrap text-base mb-6">{productPlan.description}</p>
                <table className="w-full text-left border-collapse mb-6">
                    <thead><tr className="bg-gray-100"><th className="p-2">Price</th><th className="p-2">SKU</th><th className="p-2">Stock</th><th className="p-2">Currency</th></tr></thead>
                    <tbody><tr><td className="p-2 border">{formatCurrency(productPlan.priceCents, productPlan.currency)}</td><td className="p-2 border">{productPlan.sku}</td><td className="p-2 border">{productPlan.stock}</td><td className="p-2 border">{productPlan.currency}</td></tr></tbody>
                </table>
                {productPlan.variants.length > 0 && (
                    <>
                    <h3 className="text-xl font-semibold mb-2">Variants</h3>
                    <table className="w-full text-left border-collapse mb-6">
                        <thead><tr className="bg-gray-100"><th className="p-2">Title</th><th className="p-2">SKU</th><th className="p-2">Price</th><th className="p-2">Stock</th></tr></thead>
                        <tbody>{productPlan.variants.map(v => (<tr key={v.sku}><td className="p-2 border">{v.title}</td><td className="p-2 border">{v.sku}</td><td className="p-2 border">{formatCurrency(v.priceCents, productPlan.currency)}</td><td className="p-2 border">{v.stock}</td></tr>))}</tbody>
                    </table>
                    </>
                )}
                <h3 className="text-xl font-semibold mb-2">Tags</h3>
                <p>{productPlan.tags.join(', ')}</p>
            </Section>

            {/* Market Intelligence */}
            {analysis && (
                 <Section title="Market Intelligence">
                    <p className="mb-4"><strong>Opportunity Score:</strong> {analysis.opportunityScore}/10</p>
                    <p className="mb-6"><strong>Market Summary:</strong> {analysis.marketSummary}</p>
                    <h3 className="text-xl font-semibold mb-2">Competitors</h3>
                    {analysis.competitors.map((c, i) => (<div key={i} className="mb-4 p-2 border rounded"><p><strong>{c.name}</strong> (Price: {c.estimatedPriceRange})</p><p>Strengths: {c.strengths.join(', ')}</p><p>Weaknesses: {c.weaknesses.join(', ')}</p></div>))}
                    <h3 className="text-xl font-semibold mb-2 mt-6">Differentiation Strategies</h3>
                    <ul className="list-disc list-inside">{analysis.differentiationStrategies.map((s, i) => (<li key={i}>{s}</li>))}</ul>
                </Section>
            )}

            {/* Marketing Kickstart */}
            {marketingPlan && (
                <Section title="Marketing Kickstart">
                    <h3 className="text-xl font-semibold mb-2">Social Media Posts</h3>
                    {marketingPlan.socialMediaPosts.map((p, i) => (<div key={i} className="mb-4 p-2 border rounded"><strong>{p.platform}:</strong><p className="whitespace-pre-wrap">{p.postText}</p><p><em>Hashtags: {p.hashtags.join(' ')}</em></p></div>))}
                    <h3 className="text-xl font-semibold mb-2 mt-6">Ad Copy</h3>
                    {marketingPlan.adCopy.map((a, i) => (<div key={i} className="mb-4 p-2 border rounded"><strong>{a.platform}:</strong><p>Headlines: {a.headlines.join(' | ')}</p><p>Descriptions: {a.descriptions.join(' | ')}</p></div>))}
                    <h3 className="text-xl font-semibold mb-2 mt-6">Launch Email</h3>
                    <div className="p-2 border rounded"><p><strong>Subject:</strong> {marketingPlan.launchEmail.subject}</p><p className="whitespace-pre-wrap mt-2">{marketingPlan.launchEmail.body}</p></div>
                </Section>
            )}
            
            {/* Financials & Action Plan */}
            <div style={{ pageBreakBefore: 'always' }}>
                {financials && (
                    <Section title="Financial Projections">
                        <table className="w-full text-left border-collapse">
                            <thead><tr className="bg-gray-100"><th className="p-2">Metric</th><th className="p-2">Value</th></tr></thead>
                            <tbody>
                                <tr><td className="p-2 border">Selling Price</td><td className="p-2 border">{formatCurrency(financials.sellingPriceCents, productPlan.currency)}</td></tr>
                                <tr><td className="p-2 border">Cost of Goods Sold (per unit)</td><td className="p-2 border">{formatCurrency(financials.costOfGoodsSoldCents, productPlan.currency)}</td></tr>
                                <tr><td className="p-2 border">Estimated Monthly Sales</td><td className="p-2 border">{financials.estimatedMonthlySales} units</td></tr>
                                <tr><td className="p-2 border">Monthly Marketing Budget</td><td className="p-2 border">{formatCurrency(financials.monthlyMarketingBudgetCents, productPlan.currency)}</td></tr>
                            </tbody>
                        </table>
                    </Section>
                )}
                {nextSteps && (
                    <Section title="Action Plan">
                        <ul className="list-none space-y-2">{nextSteps.map((s, i) => (<li key={i} className="flex items-center"><span className="inline-block w-5 h-5 border-2 border-gray-800 mr-3">{s.completed ? '✔' : ''}</span>{s.text}</li>))}</ul>
                    </Section>
                )}
            </div>
        </div>
    );
};

export default PdfExportTemplate;
