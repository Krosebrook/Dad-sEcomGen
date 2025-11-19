import React from 'react';
import { ProductScorecard } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ProductScorecardCardProps {
    scorecard: ProductScorecard | null;
    onGenerate: () => Promise<void>;
    isLoading?: boolean;
}

const ProductScorecardCard: React.FC<ProductScorecardCardProps> = ({
    scorecard,
    onGenerate,
    isLoading = false,
}) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-blue-600 dark:text-blue-400';
        if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
        if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30';
        if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30';
        return 'bg-red-100 dark:bg-red-900/30';
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'High':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        }
    };

    const ScoreCircle = ({ score, label }: { score: number; label: string }) => (
        <div className="flex flex-col items-center">
            <div
                className={`w-24 h-24 rounded-full flex items-center justify-center ${getScoreBgColor(
                    score
                )} border-4 ${getScoreColor(score).replace('text-', 'border-')}`}
            >
                <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 mt-2 text-center">{label}</span>
        </div>
    );

    if (!scorecard) {
        return (
            <Card className="p-6">
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                        Product Scorecard
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Get a comprehensive evaluation of your product idea with scores across market
                        opportunity, competitive position, financial viability, and execution readiness.
                    </p>
                    <Button onClick={onGenerate} disabled={isLoading}>
                        {isLoading ? 'Analyzing...' : 'Generate Product Scorecard'}
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Product Scorecard</h3>
                <Button onClick={onGenerate} disabled={isLoading} variant="secondary" size="sm">
                    {isLoading ? 'Regenerating...' : 'Regenerate'}
                </Button>
            </div>

            <div className="text-center mb-8">
                <div className="inline-block">
                    <div
                        className={`w-32 h-32 rounded-full flex items-center justify-center ${getScoreBgColor(
                            scorecard.overallScore
                        )} border-8 ${getScoreColor(scorecard.overallScore).replace('text-', 'border-')}`}
                    >
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${getScoreColor(scorecard.overallScore)}`}>
                                {scorecard.overallScore}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Overall</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <ScoreCircle
                    score={scorecard.breakdown.marketOpportunity.score}
                    label="Market Opportunity"
                />
                <ScoreCircle
                    score={scorecard.breakdown.competitivePosition.score}
                    label="Competitive Position"
                />
                <ScoreCircle
                    score={scorecard.breakdown.financialViability.score}
                    label="Financial Viability"
                />
                <ScoreCircle
                    score={scorecard.breakdown.executionReadiness.score}
                    label="Execution Readiness"
                />
            </div>

            <div className="space-y-6 mb-8">
                {Object.entries(scorecard.breakdown).map(([key, value]) => (
                    <div
                        key={key}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-5"
                    >
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-3">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
                                    value.score
                                )} ${getScoreBgColor(value.score)}`}
                            >
                                {value.score}
                            </span>
                            {key
                                .replace(/([A-Z])/g, ' $1')
                                .trim()
                                .replace(/^./, (str) => str.toUpperCase())}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{value.details}</p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h5 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
                                     Strengths
                                </h5>
                                <ul className="space-y-1">
                                    {value.strengths.map((strength, index) => (
                                        <li
                                            key={index}
                                            className="text-sm text-slate-600 dark:text-slate-400 flex items-start"
                                        >
                                            <span className="mr-2 text-green-600 dark:text-green-500">"</span>
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                                    � Areas for Improvement
                                </h5>
                                <ul className="space-y-1">
                                    {value.improvements.map((improvement, index) => (
                                        <li
                                            key={index}
                                            className="text-sm text-slate-600 dark:text-slate-400 flex items-start"
                                        >
                                            <span className="mr-2 text-yellow-600 dark:text-yellow-500">"</span>
                                            <span>{improvement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-6">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    Strategic Recommendations
                </h4>
                <ul className="space-y-2">
                    {scorecard.recommendations.map((rec, index) => (
                        <li
                            key={index}
                            className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                        >
                            <span className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5">�</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Risk Assessment</h4>
                <div className="space-y-3">
                    {scorecard.riskFactors.map((risk, index) => (
                        <div
                            key={index}
                            className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h5 className="font-semibold text-slate-800 dark:text-slate-200">{risk.risk}</h5>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                                        risk.severity
                                    )}`}
                                >
                                    {risk.severity}
                                </span>
                            </div>
                            <div className="text-sm">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                    Mitigation:{' '}
                                </span>
                                <span className="text-slate-600 dark:text-slate-400">{risk.mitigation}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default ProductScorecardCard;
