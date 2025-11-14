import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ProductPlan, CompetitiveAnalysis, MarketingKickstart, FinancialProjections, NextStepItem, SeoStrategy, AdCampaign, InfluencerMarketingPlan, CustomerSupportPlaybook, PackagingExperience, LegalChecklist, SocialMediaCalendar, ProductPhotographyPlan, ABTestPlan, EmailFunnel, PressRelease } from '../types';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import PdfExportTemplate from './PdfExportTemplate';

interface ExportControlsProps {
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

const ExportControls: React.FC<ExportControlsProps> = (props) => {
    const [isCopying, setIsCopying] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const generateMarkdown = () => {
        const { productPlan, analysis, marketingPlan, financials, nextSteps, seoStrategy, adCampaigns, influencerMarketingPlan, customerSupportPlaybook, packagingExperience, legalChecklist, socialMediaCalendar, photographyPlan, abTestPlan, emailFunnel, pressRelease } = props;
        let md = `# ${productPlan.productTitle}\n\n`;

        // Product Plan
        md += `## Product Blueprint\n\n`;
        md += `**Description:**\n${productPlan.description}\n\n`;
        md += `| Price | SKU | Stock | Currency |\n`;
        md += `|---|---|---|---|\n`;
        md += `| ${formatCurrency(productPlan.priceCents, productPlan.currency)} | ${productPlan.sku} | ${productPlan.stock} | ${productPlan.currency} |\n\n`;
        
        md += `### Product Specifications\n`;
        md += `- **Materials:** ${productPlan.materials.join(', ')}\n`;
        md += `- **Dimensions:** ${productPlan.dimensions}\n`;
        md += `- **Weight:** ${productPlan.weightGrams}g\n\n`;

        if (productPlan.variants.length > 0) {
            md += `**Variants:**\n`;
            md += `| Title | SKU | Price | Stock |\n`;
            md += `|---|---|---|---|\n`;
            productPlan.variants.forEach(v => {
                md += `| ${v.title} | ${v.sku} | ${formatCurrency(v.priceCents, productPlan.currency)} | ${v.stock} |\n`;
            });
            md += `\n`;
        }
        md += `**Tags:** ${productPlan.tags.join(', ')}\n\n`;

        // Competitive Analysis
        if (analysis) {
            md += `## Market Intelligence\n\n`;
            md += `**Opportunity Score:** ${analysis.opportunityScore}/10\n\n`;
            md += `**Market Summary:**\n${analysis.marketSummary}\n\n`;
            md += `**Competitors:**\n`;
            analysis.competitors.forEach(c => {
                md += `- **${c.name}** (Price: ${c.estimatedPriceRange})\n`;
                md += `  - Strengths: ${c.strengths.join(', ')}\n`;
                md += `  - Weaknesses: ${c.weaknesses.join(', ')}\n`;
            });
            md += `\n**Differentiation Strategies:**\n`;
            analysis.differentiationStrategies.forEach(s => (md += `- ${s}\n`));
            md += `\n`;
        }

        // SEO Strategy
        if (seoStrategy) {
            md += `## SEO & Content Strategy\n\n`;
            md += `**Strategy Summary:**\n${seoStrategy.strategySummary}\n\n`;
            md += `### Keyword Analysis\n`;
            md += `| Keyword | Competition | Monthly Searches | Relevance |\n`;
            md += `|---|---|---|---|\n`;
            seoStrategy.keywordAnalysis.forEach(kw => {
                md += `| ${kw.keyword} | ${kw.competition} | ${kw.monthlySearches} | ${kw.relevance} |\n`;
            });
            md += `\n`;
            md += `### Content Angle Ideas\n`;
            seoStrategy.contentAngleIdeas.forEach(idea => {
                md += `- **${idea.title}**: ${idea.description}\n`;
            });
            md += `\n`;
        }

        // Marketing Kickstart
        if (marketingPlan) {
            md += `## Marketing Kickstart\n\n`;
            md += `### Social Media Posts\n`;
            marketingPlan.socialMediaPosts.forEach(p => {
                md += `**${p.platform}:**\n`;
                if(p.postTextVariations) {
                    p.postTextVariations.forEach((text, i) => {
                        md += `\n*Variation ${i + 1}:*\n${text}\n`;
                    });
                }
                md += `\nHashtags: ${p.hashtags.join(' ')}\n\n`;
            });
            md += `### Ad Copy\n`;
            marketingPlan.adCopy.forEach(a => {
                md += `**${a.platform}:**\n`;
                if(a.variations) {
                    a.variations.forEach((v, i) => {
                        md += `- **Variation ${i + 1}**\n`;
                        md += `  - Headlines: ${v.headlines.join(' | ')}\n`;
                        md += `  - Descriptions: ${v.descriptions.join(' | ')}\n`;
                    });
                }
                md += `\n`;
            });
            md += `### Launch Email\n`;
            md += `**Subject:** ${marketingPlan.launchEmail.subject}\n**Body:**\n${marketingPlan.launchEmail.body}\n\n`;
        }
        
        // Social Media Calendar
        if (socialMediaCalendar) {
            md += `## Social Media Calendar\n\n`;
            socialMediaCalendar.weeks.forEach(week => {
                md += `### Week ${week.weekNumber}: ${week.theme}\n`;
                week.posts.forEach(post => {
                    md += `- **${post.day} (${post.platform}):** ${post.idea}\n`;
                });
                md += `\n`;
            });
        }
        
        // Email Funnel
        if (emailFunnel) {
            md += `## Email Funnel\n\n`;
            emailFunnel.emails.forEach(email => {
                md += `### ${email.name}\n`;
                md += `**Timing:** ${email.timing}\n`;
                md += `**Subject:** ${email.subject}\n`;
                md += `**Body:**\n${email.body}\n\n`;
            });
        }

        // Ad Campaigns
        if (adCampaigns) {
            md += `## Ad Campaign Strategy\n\n`;
            adCampaigns.forEach(c => {
                md += `### ${c.platform} - ${c.campaignName}\n`;
                md += `**Objective:** ${c.objective}\n\n`;
                c.adSets.forEach(as => {
                    md += `#### Ad Set: ${as.adSetName}\n`;
                    md += `- **Targeting:** ${as.targetingSummary}\n`;
                    md += `- **Daily Budget:** ${formatCurrency(as.dailyBudgetCents)}\n`;
                    md += `- **Creative Notes:**\n`;
                    as.adCreativeNotes.forEach(note => (md += `  - ${note}\n`));
                });
                md += `\n`;
            });
        }

        // Influencer Marketing
        if (influencerMarketingPlan) {
            md += `## Influencer Marketing Plan\n\n`;
            md += `**Target Tiers:** ${influencerMarketingPlan.influencerTiers.join(', ')}\n`;
            md += `**KPIs to Track:** ${influencerMarketingPlan.kpiToTrack.join(', ')}\n\n`;
            md += `### Outreach Template\n\`\`\`\n${influencerMarketingPlan.outreachTemplate}\n\`\`\`\n\n`;
            md += `### Campaign Ideas\n`;
            influencerMarketingPlan.campaignIdeas.forEach(idea => {
                md += `- **${idea.ideaName}:** ${idea.description}\n`;
            });
            md += `\n`;
        }
        
        // Photography Plan
        if (photographyPlan) {
            md += `## Product Photography Plan\n\n`;
            photographyPlan.shotList.forEach(shot => {
                md += `### ${shot.type}: ${shot.description}\n`;
                md += `**Direction:** ${shot.creativeDirection}\n\n`;
            });
        }
        
        // A/B Testing
        if (abTestPlan) {
            md += `## A/B Testing Ideas\n\n`;
            abTestPlan.tests.forEach(test => {
                md += `### Test: ${test.element}\n`;
                md += `**Hypothesis:** ${test.hypothesis}\n`;
                test.variations.forEach(v => {
                    md += `- **${v.name}:** ${v.description}\n`;
                });
                md += `\n`;
            });
        }

        // Financials
        if (financials) {
            md += `## Financial Projections\n\n`;
            md += `| Metric | Value |\n`;
            md += `|---|---|\n`;
            md += `| Selling Price | ${formatCurrency(financials.sellingPriceCents, productPlan.currency)} |\n`;
            md += `| COGS | ${formatCurrency(financials.costOfGoodsSoldCents, productPlan.currency)} |\n`;
            md += `| Transaction Fee | ${financials.transactionFeePercent || 0}% |\n`;
            md += `| Monthly Fixed Costs | ${formatCurrency(financials.monthlyFixedCostsCents || 0, productPlan.currency)} |\n`;
            md += `| Monthly Sales | ${financials.estimatedMonthlySales} units |\n`;
            md += `| Marketing Budget | ${formatCurrency(financials.monthlyMarketingBudgetCents, productPlan.currency)} |\n\n`;
            if (financials.shippingOptions && financials.shippingOptions.length > 0) {
                md += `**Shipping Options:**\n`;
                financials.shippingOptions.forEach(opt => {
                    md += `- ${opt.name} (${opt.deliveryTime}): ${formatCurrency(opt.costCents, productPlan.currency)}\n`;
                });
                md += '\n';
            }
        }

        // Customer Support
        if (customerSupportPlaybook) {
            md += `## Customer Support Playbook\n\n`;
            md += `**Tone of Voice:** ${customerSupportPlaybook.toneOfVoice}\n`;
            md += `**Return Policy Summary:** ${customerSupportPlaybook.returnPolicySummary}\n\n`;
            md += `### FAQs\n`;
            customerSupportPlaybook.faq.forEach(f => {
                md += `**Q: ${f.question}**\nA: ${f.answer}\n\n`;
            });
            md += `### Sample Responses\n`;
            customerSupportPlaybook.sampleResponses.forEach(r => {
                md += `**Scenario: ${r.scenario}**\n> ${r.response}\n\n`;
            });
        }

        // Packaging
        if (packagingExperience) {
            md += `## Packaging & Unboxing Experience\n\n`;
            md += `**Theme:** ${packagingExperience.theme}\n`;
            md += `**Box:** ${packagingExperience.boxDescription}\n`;
            md += `**Inside Elements:**\n`;
            packagingExperience.insideBoxElements.forEach(el => (md += `- ${el}\n`));
            md += `\n**Sustainability:** ${packagingExperience.sustainabilityNotes}\n\n`;
        }

        // Press Release
        if (pressRelease) {
            md += `## Press Release\n\n`;
            md += `**FOR IMMEDIATE RELEASE**\n\n`;
            md += `### ${pressRelease.headline}\n`;
            md += `#### ${pressRelease.subheadline}\n\n`;
            md += `${pressRelease.dateline} - ${pressRelease.introduction}\n\n`;
            md += `${pressRelease.body}\n\n`;
            md += `**About [Your Company]**\n${pressRelease.boilerplate}\n\n`;
            md += `**Contact:**\n${pressRelease.contactInfo}\n\n`;
            md += `###\n\n`;
        }

        // Legal
        if (legalChecklist) {
            md += `## Legal & Compliance Checklist\n\n`;
            md += `> **Disclaimer:** ${legalChecklist.disclaimer}\n\n`;
            legalChecklist.checklistItems.forEach(item => {
                md += `### ${item.item} ${item.isCritical ? '(Critical)' : ''}\n`;
                md += `${item.description}\n\n`;
            });
        }

        // Next Steps
        if (nextSteps) {
            md += `## Action Plan\n\n`;
            nextSteps.forEach(s => (md += `- [${s.completed ? 'x' : ' '}] ${s.text}\n`));
        }

        return md;
    };


    const handleCopyMarkdown = () => {
        setIsCopying(true);
        const markdown = generateMarkdown();
        navigator.clipboard.writeText(markdown).then(() => {
            setTimeout(() => setIsCopying(false), 2000);
        }).catch(err => {
            console.error('Failed to copy markdown:', err);
            setIsCopying(false);
        });
    };

    const handleExportPdf = () => {
        setIsExporting(true);
        const input = document.getElementById('pdf-export-template');
        if (input) {
            html2canvas(input, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                let totalPDFPages = Math.ceil(canvasHeight * (pdfWidth / canvasWidth) / pdfHeight);
                let pageCanvas = document.createElement('canvas');
                let pageCtx = pageCanvas.getContext('2d');
                pageCanvas.width = canvasWidth;
                pageCanvas.height = (pdfHeight / pdfWidth) * canvasWidth;

                for (let i = 0; i < totalPDFPages; i++) {
                    let sourceY = i * pageCanvas.height;
                    pageCtx?.drawImage(canvas, 0, sourceY, canvasWidth, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height);
                    let pageImgData = pageCanvas.toDataURL('image/png');
                    if (i > 0) {
                        pdf.addPage();
                    }
                    pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                }

                pdf.save(`${props.productPlan.slug}.pdf`);
                setIsExporting(false);
            }).catch(err => {
                console.error("Failed to export PDF:", err);
                setIsExporting(false);
            });
        }
    };


    return (
        <>
            <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Export Your Plan</h3>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={handleCopyMarkdown} disabled={isCopying}>
                            {isCopying ? 'Copied!' : 'Copy as Markdown'}
                        </Button>
                        <Button onClick={handleExportPdf} disabled={isExporting}>
                            {isExporting ? 'Exporting...' : 'Export as PDF'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <div className="hidden">
                 <div id="pdf-export-template" style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <PdfExportTemplate {...props} />
                </div>
            </div>
        </>
    );
};

export default ExportControls;