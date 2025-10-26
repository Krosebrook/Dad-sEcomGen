import React, { useState } from 'react';
import { SavedVenture } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface MyVenturesDashboardProps {
    ventures: SavedVenture[];
    onLoad: (ventureId: string) => void;
    onRename: (ventureId: string, newName: string) => void;
    onDelete: (ventureId: string) => void;
    onClose: () => void;
}

const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const MyVenturesDashboard: React.FC<MyVenturesDashboardProps> = ({ ventures, onLoad, onRename, onDelete, onClose }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    const handleRenameStart = (venture: SavedVenture) => {
        setEditingId(venture.id);
        setNewName(venture.name);
    };

    const handleRenameSave = () => {
        if (editingId && newName.trim()) {
            onRename(editingId, newName.trim());
            setEditingId(null);
            setNewName('');
        }
    };
    
    const handleRenameCancel = () => {
        setEditingId(null);
        setNewName('');
    }

    const sortedVentures = [...ventures].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-100 dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Ventures</h2>
                    <p className="text-slate-500 dark:text-slate-400">Load, rename, or delete your saved business plans.</p>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4">
                    {sortedVentures.length === 0 ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8">You haven't saved any ventures yet.</p>
                    ) : (
                        sortedVentures.map(venture => (
                            <div key={venture.id} className="bg-white dark:bg-slate-800/50 p-4 rounded-lg flex items-center justify-between gap-4">
                                {editingId === venture.id ? (
                                    <div className="flex-grow flex items-center gap-2">
                                        <Input 
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()}
                                            autoFocus
                                            className="h-9"
                                        />
                                        <Button size="sm" onClick={handleRenameSave}>Save</Button>
                                        <Button size="sm" variant="outline" onClick={handleRenameCancel}>Cancel</Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">{venture.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Product: {venture.data.plan.productTitle} &middot; Last modified: {new Date(venture.lastModified).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                             <Button size="sm" variant="outline" onClick={() => handleRenameStart(venture)} aria-label={`Rename ${venture.name}`}>
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => onDelete(venture.id)} aria-label={`Delete ${venture.name}`}>
                                                <TrashIcon className="h-4 w-4 text-red-500" />
                                            </Button>
                                            <Button size="sm" onClick={() => onLoad(venture.id)}>Load</Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
                
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-right">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
};

export default MyVenturesDashboard;
