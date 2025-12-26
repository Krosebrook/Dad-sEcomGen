import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { productScoutService, SavedSearch, PriceAlert } from '../services/productScoutService';
import { useAuth } from '../contexts/AuthContext';

interface EnhancedProductScoutCardProps {
  ventureId?: string;
}

export function EnhancedProductScoutCard({ ventureId }: EnhancedProductScoutCardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'alerts'>('search');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchForm, setSearchForm] = useState({
    name: '',
    keywords: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minRating: '4.0',
  });

  const [alertForm, setAlertForm] = useState({
    productAsin: '',
    productTitle: '',
    targetPrice: '',
    currentPrice: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [searches, alerts] = await Promise.all([
        productScoutService.getSavedSearches(user.id),
        productScoutService.getPriceAlerts(user.id),
      ]);
      setSavedSearches(searches);
      setPriceAlerts(alerts);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!user || !searchForm.name) {
      setError('Please provide a search name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        keywords: searchForm.keywords || undefined,
        category: searchForm.category || undefined,
        minPrice: searchForm.minPrice ? parseFloat(searchForm.minPrice) : undefined,
        maxPrice: searchForm.maxPrice ? parseFloat(searchForm.maxPrice) : undefined,
        minRating: searchForm.minRating ? parseFloat(searchForm.minRating) : undefined,
      };

      await productScoutService.createSavedSearch({
        user_id: user.id,
        venture_id: ventureId,
        search_name: searchForm.name,
        filters,
      });

      setSearchForm({
        name: '',
        keywords: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        minRating: '4.0',
      });

      await loadData();
      setActiveTab('saved');
    } catch (err) {
      setError('Failed to save search');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!user || !alertForm.productAsin || !alertForm.targetPrice) {
      setError('Please provide product ASIN and target price');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await productScoutService.createPriceAlert({
        user_id: user.id,
        venture_id: ventureId,
        product_asin: alertForm.productAsin,
        product_title: alertForm.productTitle || undefined,
        target_price: parseFloat(alertForm.targetPrice),
        current_price: alertForm.currentPrice ? parseFloat(alertForm.currentPrice) : undefined,
        is_active: true,
      });

      setAlertForm({
        productAsin: '',
        productTitle: '',
        targetPrice: '',
        currentPrice: '',
      });

      await loadData();
    } catch (err) {
      setError('Failed to create price alert');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      setLoading(true);
      await productScoutService.deleteSavedSearch(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete search');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      setLoading(true);
      await productScoutService.deletePriceAlert(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete alert');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAlert = async (id: string, isActive: boolean) => {
    try {
      setLoading(true);
      await productScoutService.updatePriceAlert(id, { is_active: !isActive });
      await loadData();
    } catch (err) {
      setError('Failed to update alert');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">Please sign in to use Enhanced Product Scout features</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Enhanced Product Scout</h2>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'search'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          New Search
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'saved'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Saved Searches ({savedSearches.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'alerts'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Price Alerts ({priceAlerts.filter(a => a.is_active).length})
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="searchName">Search Name*</Label>
            <Input
              id="searchName"
              value={searchForm.name}
              onChange={(e) => setSearchForm({ ...searchForm, name: e.target.value })}
              placeholder="e.g., Kitchen Gadgets Under $50"
            />
          </div>

          <div>
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              value={searchForm.keywords}
              onChange={(e) => setSearchForm({ ...searchForm, keywords: e.target.value })}
              placeholder="e.g., kitchen gadget, cooking tool"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPrice">Min Price ($)</Label>
              <Input
                id="minPrice"
                type="number"
                step="0.01"
                value={searchForm.minPrice}
                onChange={(e) => setSearchForm({ ...searchForm, minPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Max Price ($)</Label>
              <Input
                id="maxPrice"
                type="number"
                step="0.01"
                value={searchForm.maxPrice}
                onChange={(e) => setSearchForm({ ...searchForm, maxPrice: e.target.value })}
                placeholder="100.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="minRating">Minimum Rating</Label>
            <select
              id="minRating"
              value={searchForm.minRating}
              onChange={(e) => setSearchForm({ ...searchForm, minRating: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="3.0">3+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="4.0">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          <Button onClick={handleSaveSearch} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Search'}
          </Button>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-3">
          {savedSearches.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No saved searches yet</p>
          ) : (
            savedSearches.map((search) => (
              <div
                key={search.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{search.search_name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {search.filters.keywords && (
                        <p>Keywords: {search.filters.keywords}</p>
                      )}
                      {(search.filters.minPrice || search.filters.maxPrice) && (
                        <p>
                          Price: ${search.filters.minPrice || '0'} - $
                          {search.filters.maxPrice || 'any'}
                        </p>
                      )}
                      {search.filters.minRating && (
                        <p>Min Rating: {search.filters.minRating}+ stars</p>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Last used: {new Date(search.last_used_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteSearch(search.id)}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold mb-2">Create Price Alert</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="productAsin">Product ASIN*</Label>
                <Input
                  id="productAsin"
                  value={alertForm.productAsin}
                  onChange={(e) => setAlertForm({ ...alertForm, productAsin: e.target.value })}
                  placeholder="e.g., B08N5WRWNW"
                />
              </div>
              <div>
                <Label htmlFor="productTitle">Product Title</Label>
                <Input
                  id="productTitle"
                  value={alertForm.productTitle}
                  onChange={(e) => setAlertForm({ ...alertForm, productTitle: e.target.value })}
                  placeholder="Optional product name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="targetPrice">Target Price ($)*</Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.01"
                    value={alertForm.targetPrice}
                    onChange={(e) => setAlertForm({ ...alertForm, targetPrice: e.target.value })}
                    placeholder="29.99"
                  />
                </div>
                <div>
                  <Label htmlFor="currentPrice">Current Price ($)</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    step="0.01"
                    value={alertForm.currentPrice}
                    onChange={(e) => setAlertForm({ ...alertForm, currentPrice: e.target.value })}
                    placeholder="39.99"
                  />
                </div>
              </div>
              <Button onClick={handleCreateAlert} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {priceAlerts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No price alerts set</p>
            ) : (
              priceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${
                    alert.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {alert.product_title || alert.product_asin}
                        </h3>
                        {alert.is_active && (
                          <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-gray-600">ASIN: {alert.product_asin}</p>
                        <p className="text-gray-600">
                          Target: ${alert.target_price.toFixed(2)}
                          {alert.current_price && (
                            <span className="ml-2">
                              Current: ${alert.current_price.toFixed(2)}
                            </span>
                          )}
                        </p>
                        {alert.alert_triggered_at && (
                          <p className="text-green-600 font-medium">
                            Alert triggered on{' '}
                            {new Date(alert.alert_triggered_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleToggleAlert(alert.id, alert.is_active)}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        {alert.is_active ? 'Pause' : 'Activate'}
                      </Button>
                      <Button
                        onClick={() => handleDeleteAlert(alert.id)}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
