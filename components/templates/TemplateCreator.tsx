import React, { useState, useEffect } from 'react';
import { templateService, VentureTemplate } from '../../services/templateService';
import { useAuth } from '../../contexts/AuthContext';
import { Toast } from '../Toast';

export const TemplateCreator: React.FC = () => {
  const { user } = useAuth();
  const [myTemplates, setMyTemplates] = useState<VentureTemplate[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<VentureTemplate | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: '',
    price: 0,
    template_data: {}
  });

  useEffect(() => {
    if (user) {
      loadMyTemplates();
      loadCategories();
    }
  }, [user]);

  const loadMyTemplates = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await templateService.getMyTemplates(user.id);
      setMyTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await templateService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const templateData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        creator_id: user.id
      };

      if (editingTemplate) {
        await templateService.updateTemplate(editingTemplate.id, templateData);
        setToast({ message: 'Template updated successfully', type: 'success' });
      } else {
        await templateService.createTemplate(templateData);
        setToast({ message: 'Template created successfully', type: 'success' });
      }

      setIsCreating(false);
      setEditingTemplate(null);
      setFormData({ title: '', description: '', category: 'general', tags: '', price: 0, template_data: {} });
      loadMyTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      setToast({ message: 'Failed to save template', type: 'error' });
    }
  };

  const handleEdit = (template: VentureTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      description: template.description,
      category: template.category,
      tags: template.tags.join(', '),
      price: template.price,
      template_data: template.template_data
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await templateService.deleteTemplate(id);
      setToast({ message: 'Template deleted successfully', type: 'success' });
      loadMyTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      setToast({ message: 'Failed to delete template', type: 'error' });
    }
  };

  const handlePublishToggle = async (template: VentureTemplate) => {
    try {
      if (template.is_published) {
        await templateService.unpublishTemplate(template.id);
        setToast({ message: 'Template unpublished', type: 'success' });
      } else {
        await templateService.publishTemplate(template.id);
        setToast({ message: 'Template published successfully', type: 'success' });
      }
      loadMyTemplates();
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      setToast({ message: 'Failed to update template', type: 'error' });
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to create templates</h2>
        <p className="text-gray-600">You need to be signed in to create and manage templates</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Templates</h1>
          <p className="text-gray-600">Create and manage your venture templates</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingTemplate(null);
            setFormData({ title: '', description: '', category: 'general', tags: '', price: 0, template_data: {} });
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Create Template
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e-commerce, dropshipping, beginner"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingTemplate(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : myTemplates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-4">Create your first template to share with the community</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex-1">{template.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  template.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.is_published ? 'Published' : 'Draft'}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <span>{template.downloads_count} downloads</span>
                <span>⭐ {template.rating_average.toFixed(1)}</span>
                <span>${template.price}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handlePublishToggle(template)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  {template.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
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
