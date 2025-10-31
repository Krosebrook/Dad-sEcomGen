import React, { useState, useMemo } from 'react';
import { NextStepItem } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface NextStepsCardProps {
  items: NextStepItem[];
  onToggle: (index: number) => void;
  onAddTask: (text: string, category: string) => void;
  onEditTask: (index: number, text: string) => void;
  onDeleteTask: (index: number) => void;
}

const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);


const NextStepsCard: React.FC<NextStepsCardProps> = ({ items, onToggle, onAddTask, onEditTask, onDeleteTask }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('General');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editedText, setEditedText] = useState('');

    const completedCount = items.filter(item => item.completed).length;
    const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
    
    const taskCategories = ["General", "Sourcing & Production", "Legal & Compliance", "Marketing & Sales", "Launch Prep"];

    const groupedItems = useMemo(() => {
        const groups: Record<string, { item: NextStepItem, originalIndex: number }[]> = {};
        items.forEach((item, index) => {
            const category = item.category || 'General';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push({ item, originalIndex: index });
        });
        
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
            onAddTask(newTaskText.trim(), newTaskCategory);
            setNewTaskText('');
            setIsAdding(false);
            setNewTaskCategory('General');
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
                 <div className="space-y-6">
                    {groupedItems.map(([category, itemsWithIndices]) => (
                        <div key={category}>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">{category}</h3>
                            <div className="space-y-3">
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
                                        <label htmlFor={`step-${originalIndex}`} className={`ml-3 flex-grow text-slate-800 dark:text-slate-200 cursor-pointer ${item.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                                            {item.text}
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
                        </div>
                    ))}
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
                                value={newTaskCategory} 
                                onChange={(e) => setNewTaskCategory(e.target.value)} 
                                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus-visible:ring-slate-500"
                            >
                                {taskCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleAddTask}>Add</Button>
                                <Button size="sm" variant="outline" onClick={() => { setIsAdding(false); setNewTaskText(''); setNewTaskCategory('General'); }}>Cancel</Button>
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