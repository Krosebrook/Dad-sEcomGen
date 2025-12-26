import React, { useState, useEffect } from 'react';
import { templateService, VentureTemplate, TemplateFilters } from '../../services/templateService';
import { useAuth } from '../../contexts/AuthContext';
import { Toast } from '../Toast';

export const TemplateMarketplace: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<VentureTemplate[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filters, setFilters] = useState<TemplateFilters>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadCategories();
    loadTemplates();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const data = await templateService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateService.getTemplates(filters);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setToast({ message: 'Failed to load templates', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const data = await templateService.searchTemplates(searchQuery);
        setTemplates(data);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      loadTemplates();
    }
  };

  const handlePurchase = async (template: VentureTemplate) => {
    if (!user) {
      setToast({ message: 'Please sign in to download templates', type: 'error' });
      return;
    }

    try {
      const hasPurchased = await templateService.hasPurchased(template.id, user.id);
      if (hasPurchased) {
        setToast({ message: 'You already own this template', type: 'error' });
        return;
      }

      await templateService.purchaseTemplate(template.id, user.id, template.price);
      setToast({ message: 'Template downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Purchase failed:', error);
      setToast({ message: 'Failed to download template', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Marketplace</h1>
        <p className="text-gray-600">Browse and download venture templates created by the community</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search templates..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={filters.category || 'all'}
            onChange={(e) => setFilters({ ...filters, category: e.target.value === 'all' ? undefined : e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
            ))}
          </select>

          <select
            value={filters.maxPrice !== undefined ? filters.maxPrice : 'all'}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value === 'all' ? undefined : Number(e.target.value) })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Any Price</option>
            <option value="0">Free Only</option>
            <option value="10">Under $10</option>
            <option value="25">Under $25</option>
            <option value="50">Under $50</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4" />
              <div className="h-6 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">{template.title}</h3>
                  {template.is_featured && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Featured</span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= template.rating_average ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm text-gray-600">({template.rating_count})</span>
                  </div>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{template.downloads_count} downloads</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    {template.price === 0 ? 'Free' : `$${template.price}`}
                  </div>
                  <button
                    onClick={() => handlePurchase(template)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
