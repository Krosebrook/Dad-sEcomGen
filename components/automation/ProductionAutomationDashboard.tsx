import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as productService from '../../services/productManagementService';
import * as documentService from '../../services/documentGenerationService';
import * as scrapingService from '../../services/scrapingService';
import * as webhookService from '../../services/webhookService';
import * as exportService from '../../services/comprehensiveExportService';
import * as edgeCaseService from '../../services/edgeCaseService';
import * as dependencyService from '../../services/dependencyService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function ProductionAutomationDashboard() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [ventureId, setVentureId] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, [ventureId]);

  async function loadStats() {
    if (!ventureId) return;

    setLoading(true);
    try {
      const [productStats, edgeCaseStats, depStats] = await Promise.all([
        productService.getProductAnalytics(ventureId),
        edgeCaseService.getEdgeCaseStats(ventureId),
        dependencyService.getDependencyStats(ventureId),
      ]);

      setStats({ productStats, edgeCaseStats, depStats });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'scraping', label: 'Web Scraping', icon: '🕷️' },
    { id: 'webhooks', label: 'Webhooks', icon: '🔗' },
    { id: 'automation', label: 'Automation', icon: '⚙️' },
    { id: 'export', label: 'Export', icon: '💾' },
    { id: 'edge-cases', label: 'Edge Cases', icon: '⚠️' },
    { id: 'dependencies', label: 'Dependencies', icon: '📚' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Production Automation Platform
          </h1>
          <p className="text-gray-600">
            Complete business automation with products, documents, APIs, scraping, and more
          </p>
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'overview' && <OverviewTab stats={stats} loading={loading} />}
          {activeTab === 'products' && <ProductsTab ventureId={ventureId} />}
          {activeTab === 'documents' && <DocumentsTab ventureId={ventureId} />}
          {activeTab === 'scraping' && <ScrapingTab ventureId={ventureId} session={session} />}
          {activeTab === 'webhooks' && <WebhooksTab ventureId={ventureId} session={session} />}
          {activeTab === 'automation' && <AutomationTab ventureId={ventureId} />}
          {activeTab === 'export' && <ExportTab ventureId={ventureId} />}
          {activeTab === 'edge-cases' && <EdgeCasesTab ventureId={ventureId} />}
          {activeTab === 'dependencies' && <DependenciesTab ventureId={ventureId} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ stats, loading }: any) {
  if (loading) return <div>Loading stats...</div>;
  if (!stats) return <div>No data available</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Products</h3>
        <div className="space-y-2">
          <StatRow label="Total Products" value={stats.productStats?.totalProducts || 0} />
          <StatRow label="Active" value={stats.productStats?.activeProducts || 0} />
          <StatRow label="Total Value" value={`$${(stats.productStats?.totalValue || 0).toFixed(2)}`} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Edge Cases</h3>
        <div className="space-y-2">
          <StatRow label="Total Cases" value={stats.edgeCaseStats?.total || 0} />
          <StatRow label="Open" value={stats.edgeCaseStats?.open || 0} />
          <StatRow label="Resolved" value={stats.edgeCaseStats?.resolved || 0} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dependencies</h3>
        <div className="space-y-2">
          <StatRow label="Total" value={stats.depStats?.total || 0} />
          <StatRow label="Outdated" value={stats.depStats?.outdated || 0} />
          <StatRow label="Vulnerable" value={stats.depStats?.vulnerable || 0} />
        </div>
      </Card>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function ProductsTab({ ventureId }: { ventureId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (ventureId) loadProducts();
  }, [ventureId]);

  async function loadProducts() {
    const data = await productService.listProducts(ventureId);
    setProducts(data);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Product'}
        </Button>
      </div>

      {showForm && <ProductForm ventureId={ventureId} onSave={loadProducts} onCancel={() => setShowForm(false)} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{product.sku}</p>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-semibold">${product.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Inventory:</span>
                <span className="font-semibold">{product.inventory_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProductForm({ ventureId, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    inventory_count: 0,
    category: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await productService.createProduct({
      venture_id: ventureId,
      ...formData,
      status: 'active',
      sku: productService.generateSKU(),
    });
    onSave();
    onCancel();
  }

  return (
    <Card className="p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border rounded"
          rows={3}
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="px-4 py-2 border rounded"
            step="0.01"
            required
          />
          <input
            type="number"
            placeholder="Cost"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
            className="px-4 py-2 border rounded"
            step="0.01"
            required
          />
        </div>
        <input
          type="number"
          placeholder="Initial Inventory"
          value={formData.inventory_count}
          onChange={(e) => setFormData({ ...formData, inventory_count: parseInt(e.target.value) })}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />
        <div className="flex space-x-2">
          <Button type="submit">Create Product</Button>
          <Button type="button" onClick={onCancel} className="bg-gray-500">Cancel</Button>
        </div>
      </form>
    </Card>
  );
}

function DocumentsTab({ ventureId }: { ventureId: string }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    if (ventureId) loadDocuments();
  }, [ventureId]);

  async function loadDocuments() {
    const data = await documentService.listDocuments(ventureId);
    setDocuments(data);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Document Generation</h2>
        <Button onClick={() => setShowGenerator(!showGenerator)}>
          {showGenerator ? 'Cancel' : 'Generate Document'}
        </Button>
      </div>

      {showGenerator && <DocumentGenerator ventureId={ventureId} onGenerate={loadDocuments} />}

      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{doc.title}</h3>
                <p className="text-sm text-gray-600">{doc.type}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Created: {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded text-sm ${
                doc.status === 'final' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {doc.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DocumentGenerator({ ventureId, onGenerate }: any) {
  const [type, setType] = useState('invoice');
  const [title, setTitle] = useState('');

  async function generate() {
    await documentService.generateDocument({
      ventureId,
      type,
      title,
      content: {},
      variables: { date: new Date().toLocaleDateString() },
    });
    onGenerate();
  }

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="contract">Contract</option>
          <option value="invoice">Invoice</option>
          <option value="legal">Legal Document</option>
          <option value="report">Business Report</option>
          <option value="proposal">Proposal</option>
        </select>
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <Button onClick={generate}>Generate</Button>
      </div>
    </Card>
  );
}

function ScrapingTab({ ventureId, session }: any) {
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState<any>('competitor');
  const [scrapedData, setScrapedData] = useState<any[]>([]);

  useEffect(() => {
    if (ventureId) loadScrapedData();
  }, [ventureId]);

  async function loadScrapedData() {
    const data = await scrapingService.listScrapedData(ventureId);
    setScrapedData(data);
  }

  async function scrape() {
    if (!session?.access_token) return;
    await scrapingService.scrapeWebsite({ url, ventureId, sourceType }, session.access_token);
    loadScrapedData();
    setUrl('');
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Web Scraping</h2>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <input
            type="url"
            placeholder="Enter URL to scrape"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="competitor">Competitor Analysis</option>
            <option value="market">Market Research</option>
            <option value="product">Product Data</option>
            <option value="pricing">Pricing Monitor</option>
            <option value="trends">Trends</option>
          </select>
          <Button onClick={scrape}>Scrape Website</Button>
        </div>
      </Card>

      <div className="space-y-4">
        {scrapedData.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.data?.title || item.source_url}</h3>
                <p className="text-sm text-gray-600">{item.source_type}</p>
                <p className="text-xs text-gray-500">
                  Scraped: {new Date(item.scrape_date).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                item.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WebhooksTab({ ventureId, session }: any) {
  const [webhooks, setWebhooks] = useState<any[]>([]);

  useEffect(() => {
    if (ventureId) loadWebhooks();
  }, [ventureId]);

  async function loadWebhooks() {
    const data = await webhookService.listWebhooks(ventureId);
    setWebhooks(data);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Webhooks</h2>
      <p className="text-gray-600 mb-6">
        Configure webhooks to receive real-time notifications for events
      </p>

      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{webhook.name}</h3>
                <p className="text-sm text-gray-600">{webhook.event_type}</p>
                <p className="text-xs text-gray-500 mt-1">{webhook.url}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs ${
                  webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {webhook.status}
                </span>
                <div className="text-xs text-gray-500 mt-2">
                  {webhook.success_count} success / {webhook.failure_count} failed
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AutomationTab({ ventureId }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Automation Workflows</h2>
      <p className="text-gray-600">
        Create automated workflows to streamline your business processes
      </p>
    </div>
  );
}

function ExportTab({ ventureId }: any) {
  const [exports, setExports] = useState<any[]>([]);

  useEffect(() => {
    if (ventureId) loadExports();
  }, [ventureId]);

  async function loadExports() {
    const data = await exportService.listExports(ventureId);
    setExports(data);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Data Export</h2>
      <div className="space-y-4">
        {exports.map((exp) => (
          <Card key={exp.id} className="p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{exp.export_type}</h3>
                <p className="text-sm text-gray-600">{exp.format}</p>
              </div>
              <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                {exp.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EdgeCasesTab({ ventureId }: any) {
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    if (ventureId) loadCases();
  }, [ventureId]);

  async function loadCases() {
    const data = await edgeCaseService.listEdgeCases(ventureId);
    setCases(data);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edge Cases & Error Tracking</h2>
      <div className="space-y-4">
        {cases.map((caseItem) => (
          <Card key={caseItem.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{caseItem.title}</h3>
                <p className="text-sm text-gray-600">{caseItem.category}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs ${
                  caseItem.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  caseItem.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  caseItem.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {caseItem.severity}
                </span>
                <div className="text-xs text-gray-500 mt-1">{caseItem.status}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DependenciesTab({ ventureId }: any) {
  const [dependencies, setDependencies] = useState<any[]>([]);

  useEffect(() => {
    if (ventureId) loadDependencies();
  }, [ventureId]);

  async function loadDependencies() {
    const data = await dependencyService.listDependencies(ventureId);
    setDependencies(data);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dependencies</h2>
      <div className="space-y-4">
        {dependencies.map((dep) => (
          <Card key={dep.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{dep.package_name}</h3>
                <p className="text-sm text-gray-600">Version: {dep.version}</p>
                {dep.update_available && (
                  <p className="text-xs text-blue-600">
                    Update available: {dep.update_available}
                  </p>
                )}
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                dep.status === 'active' ? 'bg-green-100 text-green-800' :
                dep.status === 'outdated' ? 'bg-yellow-100 text-yellow-800' :
                dep.status === 'vulnerable' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {dep.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
