import React, { useState } from 'react';
import { ContentStrategy } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ContentStrategyCardProps {
    contentStrategy: ContentStrategy | null;
    onGenerate: () => Promise<void>;
    onChange: (strategy: ContentStrategy) => void;
    isLoading?: boolean;
}

const ContentStrategyCard: React.FC<ContentStrategyCardProps> = ({
    contentStrategy,
    onGenerate,
    onChange,
    isLoading = false,
}) => {
    const [expandedPillar, setExpandedPillar] = useState<number | null>(null);

    const updateItemStatus = (index: number, newStatus: 'Draft' | 'Scheduled' | 'Published') => {
        if (!contentStrategy) return;

        const updatedCalendar = [...contentStrategy.contentCalendar];
        updatedCalendar[index] = { ...updatedCalendar[index], status: newStatus };

        onChange({
            ...contentStrategy,
            contentCalendar: updatedCalendar,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Published':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Scheduled':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Blog Post':
                return '=�';
            case 'Video':
                return '<�';
            case 'Infographic':
                return '=�';
            case 'Social Media':
                return '=�';
            case 'Email Campaign':
                return '=�';
            default:
                return '=�';
        }
    };

    if (!contentStrategy) {
        return (
            <Card className="p-6">
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                        Content Strategy & Calendar
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Generate a comprehensive content strategy with a 90-day content calendar,
                        content pillars, and distribution plan.
                    </p>
                    <Button onClick={onGenerate} disabled={isLoading}>
                        {isLoading ? 'Generating...' : 'Generate Content Strategy'}
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                    Content Strategy & Calendar
                </h3>
                <Button onClick={onGenerate} disabled={isLoading} variant="secondary" size="sm">
                    {isLoading ? 'Regenerating...' : 'Regenerate'}
                </Button>
            </div>

            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Strategy Overview</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {contentStrategy.overview}
                </p>
            </div>

            <div className="mb-6">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Content Pillars</h4>
                <div className="grid gap-3">
                    {contentStrategy.contentPillars.map((pillar, index) => (
                        <div
                            key={index}
                            className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                        >
                            <button
                                onClick={() => setExpandedPillar(expandedPillar === index ? null : index)}
                                className="w-full p-4 text-left bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex justify-between items-center"
                            >
                                <div>
                                    <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                                        {pillar.pillar}
                                    </h5>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        {pillar.description}
                                    </p>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform ${
                                        expandedPillar === index ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {expandedPillar === index && (
                                <div className="p-4 bg-white dark:bg-slate-900">
                                    <h6 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Topic Ideas:
                                    </h6>
                                    <ul className="space-y-1">
                                        {pillar.topics.map((topic, topicIndex) => (
                                            <li
                                                key={topicIndex}
                                                className="text-sm text-slate-600 dark:text-slate-400 flex items-start"
                                            >
                                                <span className="mr-2">"</span>
                                                <span>{topic}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    90-Day Content Calendar
                </h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">
                                    Content
                                </th>
                                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">
                                    Platform
                                </th>
                                <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {contentStrategy.contentCalendar.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        {new Date(item.publishDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-medium text-slate-800 dark:text-slate-200">
                                                {item.title}
                                            </div>
                                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                Keywords: {item.targetKeywords.join(', ')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        <span className="flex items-center gap-2">
                                            <span>{getTypeIcon(item.type)}</span>
                                            <span>{item.type}</span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        {item.platform}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={item.status}
                                            onChange={(e) =>
                                                updateItemStatus(
                                                    index,
                                                    e.target.value as 'Draft' | 'Scheduled' | 'Published'
                                                )
                                            }
                                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(
                                                item.status
                                            )}`}
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Published">Published</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Distribution Channels</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contentStrategy.distributionChannels.map((channel, index) => (
                        <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                                    {channel.channel}
                                </h5>
                                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                                    {channel.frequency}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{channel.notes}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default ContentStrategyCard;
