import React from 'react';
import { ProductPlan, CompetitiveAnalysis, MarketingKickstart, FinancialProjections, NextStepItem, SeoStrategy, AdCampaign, InfluencerMarketingPlan, CustomerSupportPlaybook, PackagingExperience, LegalChecklist, SocialMediaCalendar, ProductPhotographyPlan, ABTestPlan, EmailFunnel, PressRelease } from '../types';

interface PdfExportTemplateProps {
    productPlan: ProductPlan;
    logoImageUrl: string | null;
    analysis: CompetitiveAnalysis | null;
    marketingPlan: MarketingKickstart | null;
    financials: FinancialProjections | null;
    nextSteps: NextStepItem[] | null;
    seoStrategy: SeoStrategy | null;
    adCampaigns: AdCampaign[] | null;
    influencerMarketingPlan: InfluencerMarketingPlan | null;
    customerSupportPlaybook: CustomerSupportPlaybook | null;
    packagingExperience: PackagingExperience | null;
    legalChecklist: LegalChecklist | null;
    socialMediaCalendar: SocialMediaCalendar | null;
    photographyPlan: ProductPhotographyPlan | null;
    abTestPlan: ABTestPlan | null;
    emailFunnel: EmailFunnel | null;
    pressRelease: PressRelease | null;
}

const formatCurrency = (cents: number, currency: string = 'USD') => {
  if (isNaN(cents)) return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
};

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`mb-8 ${className}`} style={{ pageBreakInside: 'avoid' }}>
        <h2 className="text-2xl font-bold border-b-2 border-gray-800 pb-2 mb-4">{title}</h2>
        {children}
    </div>
);

const PdfExportTemplate: React.FC<PdfExportTemplateProps> = (props) => {
    const {
        productPlan, logoImageUrl, analysis, marketingPlan, financials, nextSteps,
        seoStrategy, adCampaigns, influencerMarketingPlan, customerSupportPlaybook, packagingExperience, legalChecklist,
        socialMediaCalendar, photographyPlan, abTestPlan, emailFunnel, pressRelease
    } = props;

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
                 <h3 className="text-xl font-semibold mb-2">Specifications</h3>
                <div className="p-2 border rounded mb-6">
                    <p><strong>Materials:</strong> {productPlan.materials.join(', ')}</p>
                    <p><strong>Dimensions:</strong> {productPlan.dimensions}</p>
                    <p><strong>Weight:</strong> {productPlan.weightGrams}g</p>
                </div>
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
            
             {/* SEO & Content Strategy */}
            {seoStrategy && (
                <Section title="SEO & Content Strategy" className="break-before-page">
                    <p className="mb-6"><strong>Strategy Summary:</strong> {seoStrategy.strategySummary}</p>
                    <h3 className="text-xl font-semibold mb-2">Keyword Analysis</h3>
                    <table className="w-full text-left border-collapse mb-6 text-sm">
                        <thead><tr className="bg-gray-100"><th className="p-2">Keyword</th><th className="p-2">Competition</th><th className="p-2">Searches</th><th className="p-2">Relevance</th></tr></thead>
                        <tbody>{seoStrategy.keywordAnalysis.map((kw, i) => (<tr key={i}><td className="p-2 border">{kw.keyword}</td><td className="p-2 border">{kw.competition}</td><td className="p-2 border">{kw.monthlySearches}</td><td className="p-2 border">{kw.relevance}</td></tr>))}</tbody>
                    </table>
                    <h3 className="text-xl font-semibold mb-2 mt-6">Content Angle Ideas</h3>
                    {seoStrategy.contentAngleIdeas.map((idea, i) => (<div key={i} className="mb-2"><p><strong>{idea.title}:</strong> {idea.description}</p></div>))}
                </Section>
            )}


            {/* Marketing Kickstart */}
            {marketingPlan && (
                <Section title="Marketing Kickstart" className="break-before-page">
                    <h3 className="text-xl font-semibold mb-2">Social Media Posts</h3>
                    {marketingPlan.socialMediaPosts.map((p, i) => (
                    <div key={i} className="mb-4 p-2 border rounded">
                        <strong>{p.platform}:</strong>
                        {p.postTextVariations && p.postTextVariations.map((text, j) => (
                            <div key={j} className="mt-2 pl-2 border-l-2">
                                <p className="font-semibold text-sm">Variation {j + 1}</p>
                                <p className="whitespace-pre-wrap">{text}</p>
                            </div>
                        ))}
                        <p className="mt-2"><em>Hashtags: {p.hashtags.join(' ')}</em></p>
                    </div>
                    ))}
                    <h3 className="text-xl font-semibold mb-2 mt-6">Ad Copy</h3>
                    {marketingPlan.adCopy.map((a, i) => (
                    <div key={i} className="mb-4 p-2 border rounded">
                        <strong>{a.platform}:</strong>
                        {a.variations && a.variations.map((v, j) => (
                            <div key={j} className="mt-2 pl-2 border-l-2">
                                <p className="font-semibold text-sm">Variation {j + 1}</p>
                                <p>Headlines: {v.headlines.join(' | ')}</p>
                                <p>Descriptions: {v.descriptions.join(' | ')}</p>
                            </div>
                        ))}
                    </div>
                    ))}
                    <h3 className="text-xl font-semibold mb-2 mt-6">Launch Email</h3>
                    <div className="p-2 border rounded"><p><strong>Subject:</strong> {marketingPlan.launchEmail.subject}</p><p className="whitespace-pre-wrap mt-2">{marketingPlan.launchEmail.body}</p></div>
                </Section>
            )}

            {socialMediaCalendar && (
                <Section title="Social Media Calendar" className="break-before-page">
                    {socialMediaCalendar.weeks.map(week => (
                        <div key={week.weekNumber} className="mb-4">
                            <h3 className="text-xl font-semibold mb-2">Week {week.weekNumber}: {week.theme}</h3>
                            <table className="w-full text-left border-collapse text-sm">
                                <thead><tr className="bg-gray-100"><th className="p-2">Day</th><th className="p-2">Platform</th><th className="p-2">Idea</th></tr></thead>
                                <tbody>
                                    {week.posts.map((post, i) => (
                                        <tr key={i}><td className="p-2 border">{post.day}</td><td className="p-2 border">{post.platform}</td><td className="p-2 border">{post.idea}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </Section>
            )}

            {emailFunnel && (
                <Section title="Email Marketing Funnel" className="break-before-page">
                    {emailFunnel.emails.map((email, i) => (
                        <div key={i} className="mb-6 p-2 border rounded">
                            <h3 className="text-xl font-semibold">{email.name}</h3>
                            <p><strong>Timing:</strong> {email.timing}</p>
                            <p><strong>Subject:</strong> {email.subject}</p>
                            <div className="mt-2 pt-2 border-t"><p className="whitespace-pre-wrap">{email.body}</p></div>
                        </div>
                    ))}
                </Section>
            )}

             {/* Ad Campaigns */}
            {adCampaigns && (
                <Section title="Ad Campaign Strategy">
                     {adCampaigns.map((c, i) => (
                        <div key={i} className="mb-6 p-2 border rounded">
                            <h3 className="text-xl font-semibold">{c.platform} - {c.campaignName}</h3>
                            <p><strong>Objective:</strong> {c.objective}</p>
                            {c.adSets.map((as, j) => (
                                <div key={j} className="mt-2 pl-4 border-l-2">
                                    <h4 className="font-semibold">{as.adSetName}</h4>
                                    <p><strong>Targeting:</strong> {as.targetingSummary}</p>
                                    <p><strong>Budget:</strong> {formatCurrency(as.dailyBudgetCents)}/day</p>
                                    <p><strong>Creative Notes:</strong></p>
                                    <ul className="list-disc list-inside pl-4">
                                        {as.adCreativeNotes.map((note, k) => <li key={k}>{note}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                     ))}
                </Section>
            )}

            {influencerMarketingPlan && (
                <Section title="Influencer Marketing Plan" className="break-before-page">
                    <p><strong>Target Tiers:</strong> {influencerMarketingPlan.influencerTiers.join(', ')}</p>
                    <p><strong>KPIs to Track:</strong> {influencerMarketingPlan.kpiToTrack.join(', ')}</p>
                    <h3 className="text-xl font-semibold mt-4 mb-2">Outreach Template</h3>
                    <pre className="p-2 border rounded bg-gray-50 whitespace-pre-wrap font-sans">{influencerMarketingPlan.outreachTemplate}</pre>
                    <h3 className="text-xl font-semibold mt-4 mb-2">Campaign Ideas</h3>
                    <ul className="list-disc list-inside">
                        {influencerMarketingPlan.campaignIdeas.map((idea, i) => <li key={i}><strong>{idea.ideaName}:</strong> {idea.description}</li>)}
                    </ul>
                </Section>
            )}
            
            <div style={{ pageBreakBefore: 'always' }}>
                {photographyPlan && (
                    <Section title="Product Photography Plan">
                        {photographyPlan.shotList.map((shot, i) => (
                            <div key={i} className="mb-4 p-2 border rounded">
                                <h3 className="text-lg font-semibold">{shot.type}: {shot.description}</h3>
                                <p><strong>Direction:</strong> {shot.creativeDirection}</p>
                            </div>
                        ))}
                    </Section>
                )}

                {abTestPlan && (
                    <Section title="A/B Testing Ideas">
                        {abTestPlan.tests.map((test, i) => (
                            <div key={i} className="mb-4 p-2 border rounded">
                                <h3 className="text-lg font-semibold">Test: {test.element}</h3>
                                <p><strong>Hypothesis:</strong> {test.hypothesis}</p>
                                <ul className="list-disc list-inside pl-4">
                                    {test.variations.map((v, j) => <li key={j}><strong>{v.name}:</strong> {v.description}</li>)}
                                </ul>
                            </div>
                        ))}
                    </Section>
                )}

                 {/* Customer Support */}
                {customerSupportPlaybook && (
                    <Section title="Customer Support Playbook">
                        <p><strong>Tone of Voice:</strong> {customerSupportPlaybook.toneOfVoice}</p>
                        <p><strong>Return Policy Summary:</strong> {customerSupportPlaybook.returnPolicySummary}</p>
                        <h3 className="text-xl font-semibold mt-4 mb-2">FAQs</h3>
                        {customerSupportPlaybook.faq.map((f, i) => <div key={i} className="mb-2"><p><strong>Q: {f.question}</strong></p><p>A: {f.answer}</p></div>)}
                        <h3 className="text-xl font-semibold mt-4 mb-2">Sample Responses</h3>
                        {customerSupportPlaybook.sampleResponses.map((r, i) => <div key={i} className="mb-2"><p><strong>Scenario: {r.scenario}</strong></p><p className="italic">"{r.response}"</p></div>)}
                    </Section>
                )}

                 {/* Packaging */}
                {packagingExperience && (
                    <Section title="Packaging & Unboxing">
                        <p><strong>Theme:</strong> {packagingExperience.theme}</p>
                        <p><strong>Box Description:</strong> {packagingExperience.boxDescription}</p>
                        <h3 className="text-xl font-semibold mt-4 mb-2">Inside Elements</h3>
                        <ul className="list-disc list-inside">
                            {packagingExperience.insideBoxElements.map((el, i) => <li key={i}>{el}</li>)}
                        </ul>
                        <p className="mt-2"><strong>Sustainability:</strong> {packagingExperience.sustainabilityNotes}</p>
                    </Section>
                )}
            </div>

            {pressRelease && (
                <Section title="Press Release" className="break-before-page">
                    <div className="p-2 border rounded font-serif">
                        <p className="text-center font-bold">FOR IMMEDIATE RELEASE</p>
                        <h3 className="text-2xl font-bold text-center mt-4">{pressRelease.headline}</h3>
                        <p className="text-lg text-center text-gray-600 mb-4">{pressRelease.subheadline}</p>
                        <p className="text-sm font-semibold">{pressRelease.dateline}</p>
                        <p className="whitespace-pre-wrap mt-2">{pressRelease.introduction}</p>
                        <p className="whitespace-pre-wrap mt-2">{pressRelease.body}</p>
                        <h4 className="font-bold mt-4">About [Your Company]</h4>
                        <p className="text-sm whitespace-pre-wrap">{pressRelease.boilerplate}</p>
                        <h4 className="font-bold mt-4">Contact:</h4>
                        <p className="text-sm whitespace-pre-wrap">{pressRelease.contactInfo}</p>
                        <p className="text-center font-bold mt-4">###</p>
                    </div>
                </Section>
            )}

            <div style={{ pageBreakBefore: 'always' }}>
                {/* Financials */}
                {financials && (
                    <Section title="Financial Projections">
                        <table className="w-full text-left border-collapse mb-6">
                            <thead><tr className="bg-gray-100"><th className="p-2">Metric</th><th className="p-2">Value</th></tr></thead>
                            <tbody>
                                <tr><td className="p-2 border">Selling Price</td><td className="p-2 border">{formatCurrency(financials.sellingPriceCents, productPlan.currency)}</td></tr>
                                <tr><td className="p-2 border">Cost of Goods Sold (per unit)</td><td className="p-2 border">{formatCurrency(financials.costOfGoodsSoldCents, productPlan.currency)}</td></tr>
                                <tr><td className="p-2 border">Transaction Fee</td><td className="p-2 border">{financials.transactionFeePercent || 0}%</td></tr>
                                <tr><td className="p-2 border">Monthly Fixed Costs</td><td className="p-2 border">{formatCurrency(financials.monthlyFixedCostsCents || 0, productPlan.currency)}</td></tr>
                                <tr><td className="p-2 border">Estimated Monthly Sales</td><td className="p-2 border">{financials.estimatedMonthlySales} units</td></tr>
                                <tr><td className="p-2 border">Monthly Marketing Budget</td><td className="p-2 border">{formatCurrency(financials.monthlyMarketingBudgetCents, productPlan.currency)}</td></tr>
                            </tbody>
                        </table>
                        {(financials.shippingOptions || []).length > 0 && (
                            <>
                                <h3 className="text-xl font-semibold mt-4 mb-2">Shipping Options</h3>
                                <ul className="list-disc list-inside">
                                    {(financials.shippingOptions || []).map((opt, i) => (
                                        <li key={i}>{opt.name} ({opt.deliveryTime}): <strong>{formatCurrency(opt.costCents, productPlan.currency)}</strong></li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </Section>
                )}

                {/* Legal Checklist */}
                {legalChecklist && (
                    <Section title="Legal & Compliance Checklist">
                        <p className="p-2 bg-yellow-100 border border-yellow-300 rounded mb-4"><strong>Disclaimer:</strong> {legalChecklist.disclaimer}</p>
                        {legalChecklist.checklistItems.map((item, i) => (
                            <div key={i} className="mb-2">
                                <p><strong>{item.item} {item.isCritical ? '(Critical)' : ''}</strong></p>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </Section>
                )}
                
                {/* Action Plan */}
                {nextSteps && (
                    <Section title="Action Plan">
                        <ul className="list-none space-y-2">{nextSteps.map((s, i) => (<li key={i} className="flex items-center"><span className="inline-block w-5 h-5 border-2 border-gray-800 mr-3 text-center leading-tight">{s.completed ? '✔' : ''}</span>{s.text}</li>))}</ul>
                    </Section>
                )}
            </div>
        </div>
    );
};

export default PdfExportTemplate;