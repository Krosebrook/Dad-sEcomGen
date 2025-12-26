import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import {
  inventoryService,
  InventoryItem,
  Supplier,
  InventoryTransaction,
  TransactionType,
} from '../services/inventoryService';
import { useAuth } from '../contexts/AuthContext';

interface InventoryManagementCardProps {
  ventureId: string;
}

export function InventoryManagementCard({ ventureId }: InventoryManagementCardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'suppliers' | 'alerts'>('inventory');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);

  const [itemForm, setItemForm] = useState({
    productName: '',
    sku: '',
    description: '',
    category: '',
    quantity: '',
    reorderPoint: '',
    reorderQuantity: '',
    unitCost: '',
    sellingPrice: '',
    supplierId: '',
    location: '',
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    leadTimeDays: '14',
    minimumOrderQty: '1',
    minimumOrderValue: '0',
    paymentTerms: '',
  });

  const [transactionForm, setTransactionForm] = useState({
    itemId: '',
    type: 'restock' as TransactionType,
    quantity: '',
    unitCost: '',
    referenceNumber: '',
    notes: '',
  });

  useEffect(() => {
    if (ventureId && user) {
      loadData();
    }
  }, [ventureId, user]);

  const loadData = async () => {
    if (!ventureId || !user) return;

    try {
      setLoading(true);
      const [itemsData, suppliersData, lowStock] = await Promise.all([
        inventoryService.getInventoryItems(ventureId, true),
        inventoryService.getSuppliers(ventureId, true),
        inventoryService.getLowStockItems(ventureId),
      ]);
      setItems(itemsData);
      setSuppliers(suppliersData);
      setLowStockItems(lowStock);
    } catch (err) {
      setError('Failed to load inventory data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (itemId: string) => {
    try {
      const transactionsData = await inventoryService.getTransactions(itemId);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Failed to load transactions', err);
    }
  };

  const handleCreateItem = async () => {
    if (!user || !itemForm.productName || !itemForm.sku) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await inventoryService.createInventoryItem({
        venture_id: ventureId,
        user_id: user.id,
        supplier_id: itemForm.supplierId || undefined,
        product_name: itemForm.productName,
        sku: itemForm.sku,
        description: itemForm.description || undefined,
        category: itemForm.category || undefined,
        current_quantity: parseInt(itemForm.quantity || '0'),
        reorder_point: parseInt(itemForm.reorderPoint || '10'),
        reorder_quantity: parseInt(itemForm.reorderQuantity || '50'),
        unit_cost: parseFloat(itemForm.unitCost || '0'),
        selling_price: parseFloat(itemForm.sellingPrice || '0'),
        location: itemForm.location || undefined,
        is_active: true,
      });

      setItemForm({
        productName: '',
        sku: '',
        description: '',
        category: '',
        quantity: '',
        reorderPoint: '',
        reorderQuantity: '',
        unitCost: '',
        sellingPrice: '',
        supplierId: '',
        location: '',
      });

      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create inventory item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async () => {
    if (!user || !supplierForm.name) {
      setError('Please provide supplier name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await inventoryService.createSupplier({
        venture_id: ventureId,
        user_id: user.id,
        supplier_name: supplierForm.name,
        contact_name: supplierForm.contactName || undefined,
        contact_email: supplierForm.contactEmail || undefined,
        contact_phone: supplierForm.contactPhone || undefined,
        address: supplierForm.address || undefined,
        lead_time_days: parseInt(supplierForm.leadTimeDays),
        minimum_order_quantity: parseInt(supplierForm.minimumOrderQty),
        minimum_order_value: parseFloat(supplierForm.minimumOrderValue),
        payment_terms: supplierForm.paymentTerms || undefined,
        is_active: true,
      });

      setSupplierForm({
        name: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        leadTimeDays: '14',
        minimumOrderQty: '1',
        minimumOrderValue: '0',
        paymentTerms: '',
      });

      await loadData();
    } catch (err) {
      setError('Failed to create supplier');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!transactionForm.itemId || !transactionForm.quantity) {
      setError('Please select item and quantity');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await inventoryService.createTransaction({
        item_id: transactionForm.itemId,
        transaction_type: transactionForm.type,
        quantity: parseInt(transactionForm.quantity),
        unit_cost: transactionForm.unitCost ? parseFloat(transactionForm.unitCost) : undefined,
        reference_number: transactionForm.referenceNumber || undefined,
        notes: transactionForm.notes || undefined,
        transaction_date: new Date().toISOString(),
      });

      setTransactionForm({
        itemId: '',
        type: 'restock',
        quantity: '',
        unitCost: '',
        referenceNumber: '',
        notes: '',
      });

      await loadData();
      if (selectedItem) {
        await loadTransactions(selectedItem);
      }
    } catch (err) {
      setError('Failed to create transaction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setLoading(true);
      await inventoryService.deleteInventoryItem(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      setLoading(true);
      await inventoryService.deleteSupplier(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete supplier');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransactions = async (itemId: string) => {
    setSelectedItem(itemId);
    await loadTransactions(itemId);
  };

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">Please sign in to use Inventory Management</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'inventory'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Inventory ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'suppliers'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Suppliers ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'alerts'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Low Stock Alerts ({lowStockItems.length})
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold mb-4">Add New Item</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="productName">Product Name*</Label>
                  <Input
                    id="productName"
                    value={itemForm.productName}
                    onChange={(e) => setItemForm({ ...itemForm, productName: e.target.value })}
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU*</Label>
                  <Input
                    id="sku"
                    value={itemForm.sku}
                    onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                    placeholder="Unique SKU"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="quantity">Current Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={itemForm.reorderPoint}
                    onChange={(e) => setItemForm({ ...itemForm, reorderPoint: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="reorderQty">Reorder Quantity</Label>
                  <Input
                    id="reorderQty"
                    type="number"
                    value={itemForm.reorderQuantity}
                    onChange={(e) => setItemForm({ ...itemForm, reorderQuantity: e.target.value })}
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="unitCost">Unit Cost ($)</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    value={itemForm.unitCost}
                    onChange={(e) => setItemForm({ ...itemForm, unitCost: e.target.value })}
                    placeholder="10.00"
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price ($)</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={itemForm.sellingPrice}
                    onChange={(e) => setItemForm({ ...itemForm, sellingPrice: e.target.value })}
                    placeholder="25.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <select
                  id="supplier"
                  value={itemForm.supplierId}
                  onChange={(e) => setItemForm({ ...itemForm, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.supplier_name}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={handleCreateItem} disabled={loading} className="w-full">
                {loading ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold mb-4">Record Transaction</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="transItem">Item*</Label>
                <select
                  id="transItem"
                  value={transactionForm.itemId}
                  onChange={(e) => setTransactionForm({ ...transactionForm, itemId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.product_name} ({item.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="transType">Type*</Label>
                  <select
                    id="transType"
                    value={transactionForm.type}
                    onChange={(e) =>
                      setTransactionForm({ ...transactionForm, type: e.target.value as TransactionType })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="restock">Restock</option>
                    <option value="sale">Sale</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="return">Return</option>
                    <option value="damage">Damage</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="transQty">Quantity*</Label>
                  <Input
                    id="transQty"
                    type="number"
                    value={transactionForm.quantity}
                    onChange={(e) => setTransactionForm({ ...transactionForm, quantity: e.target.value })}
                    placeholder="10"
                  />
                </div>
              </div>

              <Button onClick={handleCreateTransaction} disabled={loading} className="w-full">
                {loading ? 'Recording...' : 'Record Transaction'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Inventory Items</h3>
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No inventory items</p>
            ) : (
              items.map((item) => {
                const isLowStock = item.current_quantity <= item.reorder_point;
                return (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg ${
                      isLowStock ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{item.product_name}</h4>
                          {isLowStock && (
                            <span className="px-2 py-1 text-xs bg-red-600 text-white rounded-full">
                              Low Stock
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">SKU: {item.sku}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Quantity:</p>
                            <p className="font-medium">{item.current_quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Reorder Point:</p>
                            <p className="font-medium">{item.reorder_point}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Unit Cost:</p>
                            <p className="font-medium">${item.unit_cost.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Selling Price:</p>
                            <p className="font-medium">${item.selling_price.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewTransactions(item.id)}
                          variant="outline"
                          size="sm"
                        >
                          History
                        </Button>
                        <Button
                          onClick={() => handleDeleteItem(item.id)}
                          variant="outline"
                          size="sm"
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedItem && transactions.length > 0 && (
            <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Transaction History</h3>
                <Button onClick={() => setSelectedItem(null)} variant="outline" size="sm">
                  Close
                </Button>
              </div>
              <div className="space-y-2">
                {transactions.map((trans) => (
                  <div key={trans.id} className="p-2 bg-white rounded text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">{trans.transaction_type}</span>
                      <span>{new Date(trans.transaction_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600">Quantity: {trans.quantity}</p>
                    {trans.notes && <p className="text-gray-600 text-xs">{trans.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold mb-4">Add New Supplier</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="supplierName">Supplier Name*</Label>
                <Input
                  id="supplierName"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={supplierForm.contactName}
                    onChange={(e) =>
                      setSupplierForm({ ...supplierForm, contactName: e.target.value })
                    }
                    placeholder="Contact person"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={supplierForm.contactEmail}
                    onChange={(e) =>
                      setSupplierForm({ ...supplierForm, contactEmail: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="leadTime">Lead Time (days)</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    value={supplierForm.leadTimeDays}
                    onChange={(e) =>
                      setSupplierForm({ ...supplierForm, leadTimeDays: e.target.value })
                    }
                    placeholder="14"
                  />
                </div>
                <div>
                  <Label htmlFor="minQty">Min Order Qty</Label>
                  <Input
                    id="minQty"
                    type="number"
                    value={supplierForm.minimumOrderQty}
                    onChange={(e) =>
                      setSupplierForm({ ...supplierForm, minimumOrderQty: e.target.value })
                    }
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="minValue">Min Order Value ($)</Label>
                  <Input
                    id="minValue"
                    type="number"
                    step="0.01"
                    value={supplierForm.minimumOrderValue}
                    onChange={(e) =>
                      setSupplierForm({ ...supplierForm, minimumOrderValue: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <Button onClick={handleCreateSupplier} disabled={loading} className="w-full">
                {loading ? 'Adding...' : 'Add Supplier'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Suppliers</h3>
            {suppliers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No suppliers added</p>
            ) : (
              suppliers.map((supplier) => (
                <div key={supplier.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{supplier.supplier_name}</h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        {supplier.contact_name && <p>Contact: {supplier.contact_name}</p>}
                        {supplier.contact_email && <p>Email: {supplier.contact_email}</p>}
                        <p>Lead Time: {supplier.lead_time_days} days</p>
                        <p>Min Order: {supplier.minimum_order_quantity} units</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteSupplier(supplier.id)}
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
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-3">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800">
              {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} need restocking
            </h3>
          </div>

          {lowStockItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No low stock alerts</p>
          ) : (
            lowStockItems.map((item) => (
              <div key={item.id} className="p-4 border border-red-300 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">{item.product_name}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Current Stock:</p>
                    <p className="font-bold text-red-600">{item.current_quantity} units</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Reorder Point:</p>
                    <p className="font-medium">{item.reorder_point} units</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Suggested Reorder:</p>
                    <p className="font-medium text-green-600">{item.reorder_quantity} units</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Est. Cost:</p>
                    <p className="font-medium">
                      ${(item.reorder_quantity * item.unit_cost).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}
