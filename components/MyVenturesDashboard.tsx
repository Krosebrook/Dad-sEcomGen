import React, { useState, useMemo } from 'react';
import { SavedVenture } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import PriceHistoryChart from './PriceHistoryChart';

interface MyVenturesDashboardProps {
    ventures: SavedVenture[];
    onLoad: (ventureId: string) => void;
    onRename: (ventureId: string, newName: string) => void;
    onDelete: (ventureId: string) => void;
    onClose: () => void;
}

// Icons
const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
);

const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
);

type SortKey = 'name' | 'lastModified' | 'id';
type SortOrder = 'asc' | 'desc';

const MyVenturesDashboard: React.FC<MyVenturesDashboardProps> = ({ ventures, onLoad, onRename, onDelete, onClose }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('lastModified');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder(key === 'name' ? 'asc' : 'desc');
        }
    };

    const filteredAndSortedVentures = useMemo(() => {
        const filtered = ventures.filter(venture =>
            venture.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filtered.sort((a, b) => {
            let comparison = 0;
            if (sortKey === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortKey === 'lastModified') {
                comparison = new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
            } else { // 'id' for date created
                comparison = parseInt(b.id) - parseInt(a.id);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [ventures, sortKey, sortOrder, searchQuery]);
    
    const SortButton: React.FC<{ sortKeyName: SortKey, label: string }> = ({ sortKeyName, label }) => (
        <button
            onClick={() => handleSort(sortKeyName)}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full transition-colors font-semibold ${
                sortKey === sortKeyName
                ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900'
                : 'bg-white hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
            }`}
        >
            {label}
            {sortKey === sortKeyName && (
                sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />
            )}
        </button>
    );

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
                     <div className="mt-4">
                        <Input 
                            type="search"
                            placeholder="Search by venture name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full"
                        />
                    </div>
                </div>

                <div className="p-4 flex items-center justify-start gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-200/50 dark:bg-slate-800/50">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sort by:</span>
                    <SortButton sortKeyName="lastModified" label="Last Modified" />
                    <SortButton sortKeyName="name" label="Name" />
                    <SortButton sortKeyName="id" label="Date Created" />
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4">
                    {filteredAndSortedVentures.length === 0 ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                            {searchQuery ? `No ventures found for "${searchQuery}".` : "You haven't saved any ventures yet."}
                        </p>
                    ) : (
                        filteredAndSortedVentures.map(venture => (
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
                                            {venture.data.priceHistory && venture.data.priceHistory.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                    <PriceHistoryChart 
                                                        data={venture.data.priceHistory} 
                                                        currency={venture.data.plan.currency}
                                                    />
                                                </div>
                                            )}
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