import React, { useState, useMemo } from 'react';
import { NextStepItem } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface NextStepsCardProps {
  items: NextStepItem[];
  onToggle: (index: number) => void;
  onAddTask: (text: string, category: string, priority: 'High' | 'Medium' | 'Low') => void;
  onEditTask: (index: number, text: string) => void;
  onDeleteTask: (index: number) => void;
}

const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);


const NextStepsCard: React.FC<NextStepsCardProps> = ({ items, onToggle, onAddTask, onEditTask, onDeleteTask }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('General');
    const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editedText, setEditedText] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const completedCount = items.filter(item => item.completed).length;
    const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
    
    const taskCategories = ["General", "Sourcing & Production", "Legal & Compliance", "Marketing & Sales", "Launch Prep"];

    const groupedItems = useMemo(() => {
        const priorityOrder: { [key in 'High' | 'Medium' | 'Low']: number } = { 'High': 1, 'Medium': 2, 'Low': 3 };
        const groups: Record<string, { item: NextStepItem, originalIndex: number }[]> = {};
        
        items.forEach((item, index) => {
            const category = item.category || 'General';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push({ item, originalIndex: index });
        });

        // Sort items within each group by priority
        for (const category in groups) {
            groups[category].sort((a, b) => {
                const priorityA = priorityOrder[a.item.priority] || 4;
                const priorityB = priorityOrder[b.item.priority] || 4;
                return priorityA - priorityB;
            });
        }

        const categoryOrder = ["Sourcing & Production", "Legal & Compliance", "Marketing & Sales", "Launch Prep", "General"];
        const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
            const indexA = categoryOrder.indexOf(a);
            const indexB = categoryOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
        return sortedGroups;
    }, [items]);

    const handleAddTask = () => {
        if (newTaskText.trim()) {
            onAddTask(newTaskText.trim(), newTaskCategory, newTaskPriority);
            setNewTaskText('');
            setIsAdding(false);
            setNewTaskCategory('General');
            setNewTaskPriority('Medium');
        }
    };

    const handleEditStart = (index: number, text: string) => {
        setEditingIndex(index);
        setEditedText(text);
    };

    const handleEditSave = () => {
        if (editingIndex !== null && editedText.trim()) {
            onEditTask(editingIndex, editedText.trim());
            setEditingIndex(null);
            setEditedText('');
        }
    };
    
    const handleToggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !(prev[category] ?? true) // Default to true (expanded)
        }));
    };

    const getPriorityClasses = (priority?: 'High' | 'Medium' | 'Low') => {
        switch (priority) {
            case 'High':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'Medium':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            case 'Low':
                return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300';
            default:
                return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">Your Action Plan</CardTitle>
                <CardDescription>A personalized checklist to get your business off the ground.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress Bar */}
                {items.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{completedCount} of {items.length} completed</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className="bg-slate-800 dark:bg-slate-200 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                        </div>
                    </div>
                )}


                {/* Checklist */}
                 <div className="space-y-2">
                    {groupedItems.map(([category, itemsWithIndices]) => {
                        const isExpanded = expandedCategories[category] ?? true;
                        return (
                            <div key={category} className="border border-slate-200 dark:border-slate-700 rounded-lg transition-all duration-300">
                                <div
                                    className="flex justify-between items-center p-4 cursor-pointer select-none"
                                    onClick={() => handleToggleCategory(category)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToggleCategory(category); }}
                                    aria-expanded={isExpanded}
                                >
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{category}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500">{itemsWithIndices.length} items</span>
                                        <ChevronDownIcon className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                        {itemsWithIndices.map(({ item, originalIndex }) => (
                                            editingIndex === originalIndex ? (
                                                <div key={originalIndex} className="flex items-center gap-2 p-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
                                                    <Input 
                                                        value={editedText}
                                                        onChange={(e) => setEditedText(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                                                        autoFocus
                                                        className="h-9"
                                                    />
                                                    <Button size="sm" onClick={handleEditSave}>Save</Button>
                                                    <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>Cancel</Button>
                                                </div>
                                            ) : (
                                            <div key={originalIndex} className="group flex items-center p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                                <input
                                                    id={`step-${originalIndex}`}
                                                    type="checkbox"
                                                    checked={item.completed}
                                                    onChange={() => onToggle(originalIndex)}
                                                    className="w-5 h-5 text-slate-800 bg-slate-300 border-slate-400 rounded focus:ring-slate-600 dark:focus:ring-slate-400 dark:ring-offset-slate-900 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 flex-shrink-0"
                                                />
                                                <label htmlFor={`step-${originalIndex}`} className={`ml-3 flex-grow text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-2 ${item.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                                                    {item.priority && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityClasses(item.priority)}`}>
                                                            {item.priority}
                                                        </span>
                                                    )}
                                                    <span>{item.text}</span>
                                                </label>
                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditStart(originalIndex, item.text)} className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white" aria-label="Edit task">
                                                        <PencilIcon />
                                                    </button>
                                                    <button onClick={() => onDeleteTask(originalIndex)} className="p-1 text-slate-500 hover:text-red-500" aria-label="Delete task">
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
                
                 {/* Add Item Section */}
                <div>
                    {isAdding ? (
                         <div className="flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
                            <Input 
                                placeholder="Add a new task..."
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                autoFocus
                                className="h-9 flex-grow"
                            />
                             <select 
                                value={newTaskPriority} 
                                onChange={(e) => setNewTaskPriority(e.target.value as 'High' | 'Medium' | 'Low')} 
                                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus-visible:ring-slate-500"
                            >
                                <option value="High">High Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="Low">Low Priority</option>
                            </select>
                            <select 
                                value={newTaskCategory} 
                                onChange={(e) => setNewTaskCategory(e.target.value)} 
                                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus-visible:ring-slate-500"
                            >
                                {taskCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleAddTask}>Add</Button>
                                <Button size="sm" variant="outline" onClick={() => { setIsAdding(false); setNewTaskText(''); setNewTaskCategory('General'); setNewTaskPriority('Medium'); }}>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
                            + Add Item
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default NextStepsCard;