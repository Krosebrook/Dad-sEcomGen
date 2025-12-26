import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { LineChart, BarChart } from '../charts';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  reorderPoint: number;
  costPerUnit: number;
  location: string;
  lastRestocked: string;
}

export function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    quantity: 0,
    reorderPoint: 10,
    costPerUnit: 0,
    location: '',
  });

  const handleAddItem = () => {
    const item: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newItem,
      lastRestocked: new Date().toISOString(),
    };
    setItems([...items, item]);
    setNewItem({
      sku: '',
      name: '',
      quantity: 0,
      reorderPoint: 10,
      costPerUnit: 0,
      location: '',
    });
    setShowAddForm(false);
  };

  const handleAdjustQuantity = (id: string, delta: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ));
  };

  const lowStockItems = items.filter(item => item.quantity <= item.reorderPoint);
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);

  const inventoryTurnoverData = [
    { name: 'Jan', turnover: 4.2 },
    { name: 'Feb', turnover: 4.5 },
    { name: 'Mar', turnover: 4.1 },
    { name: 'Apr', turnover: 4.8 },
    { name: 'May', turnover: 5.2 },
    { name: 'Jun', turnover: 4.9 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {items.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {lowStockItems.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Low Stock Alerts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totalValue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Turnover Rate</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <LineChart
            data={inventoryTurnoverData}
            lines={[{ dataKey: 'turnover', name: 'Turnover Rate', color: '#3b82f6' }]}
            height={200}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Items</CardTitle>
            <Button onClick={() => setShowAddForm(true)} size="sm">
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-4">Add New Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={newItem.sku}
                    onChange={e => setNewItem({...newItem, sku: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={newItem.quantity}
                    onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label>Reorder Point</Label>
                  <Input
                    type="number"
                    value={newItem.reorderPoint}
                    onChange={e => setNewItem({...newItem, reorderPoint: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label>Cost Per Unit</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.costPerUnit}
                    onChange={e => setNewItem({...newItem, costPerUnit: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={newItem.location}
                    onChange={e => setNewItem({...newItem, location: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddItem}>Add Item</Button>
                <Button variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No inventory items yet</div>
            ) : (
              items.map(item => (
                <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.sku}</div>
                        </div>
                        {item.quantity <= item.reorderPoint && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-full">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Location: {item.location} | ${item.costPerUnit} per unit
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {item.quantity}
                        </div>
                        <div className="text-xs text-gray-500">in stock</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleAdjustQuantity(item.id, 1)}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleAdjustQuantity(item.id, -1)}
                          className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
