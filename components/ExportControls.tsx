import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ProductPlan, CompetitiveAnalysis, MarketingKickstart, FinancialProjections, NextStepItem } from '../types';
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
        const { productPlan, analysis, marketingPlan, financials, nextSteps } = props;
        let md = `# ${productPlan.productTitle}\n\n`;

        // Product Plan
        md += `## Product Blueprint\n\n`;
        md += `**Description:**\n${productPlan.description}\n\n`;
        md += `| Price | SKU | Stock | Currency |\n`;
        md += `|---|---|---|---|\n`;
        md += `| ${formatCurrency(productPlan.priceCents, productPlan.currency)} | ${productPlan.sku} | ${productPlan.stock} | ${productPlan.currency} |\n\n`;
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

        // Marketing Kickstart
        if (marketingPlan) {
            md += `## Marketing Kickstart\n\n`;
            md += `### Social Media Posts\n`;
            marketingPlan.socialMediaPosts.forEach(p => {
                md += `**${p.platform}:**\n${p.postText}\nHashtags: ${p.hashtags.join(' ')}\n\n`;
            });
            md += `### Ad Copy\n`;
            marketingPlan.adCopy.forEach(a => {
                md += `**${a.platform}:**\n- Headlines: ${a.headlines.join(' | ')}\n- Descriptions: ${a.descriptions.join(' | ')}\n\n`;
            });
            md += `### Launch Email\n`;
            md += `**Subject:** ${marketingPlan.launchEmail.subject}\n**Body:**\n${marketingPlan.launchEmail.body}\n\n`;
        }
        
        // Financials
        if (financials) {
            md += `## Financial Projections\n\n`;
            md += `| Metric | Value |\n`;
            md += `|---|---|\n`;
            md += `| Selling Price | ${formatCurrency(financials.sellingPriceCents, productPlan.currency)} |\n`;
            md += `| COGS | ${formatCurrency(financials.costOfGoodsSoldCents, productPlan.currency)} |\n`;
            md += `| Monthly Sales | ${financials.estimatedMonthlySales} units |\n`;
            md += `| Marketing Budget | ${formatCurrency(financials.monthlyMarketingBudgetCents, productPlan.currency)} |\n\n`;
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
                const height = pdfWidth / ratio;
                let position = 0;
                let remainingHeight = canvasHeight * (pdfWidth / canvasWidth);

                while (remainingHeight > 0) {
                    pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, canvasHeight * (pdfWidth/canvasWidth));
                    remainingHeight -= pdfHeight;
                    position += pdfHeight;
                    if (remainingHeight > 0) {
                        pdf.addPage();
                    }
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
                 <div id="pdf-export-template">
                    <PdfExportTemplate {...props} />
                </div>
            </div>
        </>
    );
};

export default ExportControls;
