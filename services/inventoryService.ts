import { supabase } from '../lib/supabase';

export type TransactionType = 'restock' | 'sale' | 'adjustment' | 'return' | 'damage';

export interface Supplier {
  id: string;
  venture_id: string;
  user_id: string;
  supplier_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  lead_time_days: number;
  minimum_order_quantity: number;
  minimum_order_value: number;
  payment_terms?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  venture_id: string;
  user_id: string;
  supplier_id?: string;
  product_name: string;
  sku: string;
  description?: string;
  category?: string;
  current_quantity: number;
  reorder_point: number;
  reorder_quantity: number;
  unit_cost: number;
  selling_price: number;
  location?: string;
  is_active: boolean;
  last_restock_date?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  transaction_type: TransactionType;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_number?: string;
  notes?: string;
  transaction_date: string;
  created_at: string;
}

export const inventoryService = {
  async getSuppliers(ventureId: string, activeOnly: boolean = false): Promise<Supplier[]> {
    let query = supabase
      .from('suppliers')
      .select('*')
      .eq('venture_id', ventureId);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('supplier_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSupplier(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getInventoryItems(ventureId: string, activeOnly: boolean = false): Promise<InventoryItem[]> {
    let query = supabase
      .from('inventory_items')
      .select('*')
      .eq('venture_id', ventureId);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('product_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getLowStockItems(ventureId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('venture_id', ventureId)
      .eq('is_active', true)
      .lte('current_quantity', supabase.raw('reorder_point'))
      .order('current_quantity', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createInventoryItem(
    item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>
  ): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTransactions(itemId: string): Promise<InventoryTransaction[]> {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select('*')
      .eq('item_id', itemId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTransaction(
    transaction: Omit<InventoryTransaction, 'id' | 'created_at' | 'total_cost'>
  ): Promise<InventoryTransaction> {
    const { data: transactionData, error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert(transaction)
      .select()
      .single();

    if (transactionError) throw transactionError;

    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select('current_quantity')
      .eq('id', transaction.item_id)
      .single();

    if (itemError) throw itemError;

    let newQuantity = item.current_quantity;
    if (transaction.transaction_type === 'restock' || transaction.transaction_type === 'return') {
      newQuantity += transaction.quantity;
    } else if (transaction.transaction_type === 'sale' || transaction.transaction_type === 'damage') {
      newQuantity -= transaction.quantity;
    } else if (transaction.transaction_type === 'adjustment') {
      newQuantity = transaction.quantity;
    }

    const updates: Partial<InventoryItem> = {
      current_quantity: Math.max(0, newQuantity),
    };

    if (transaction.transaction_type === 'restock') {
      updates.last_restock_date = transaction.transaction_date;
    }

    await this.updateInventoryItemQuantity(transaction.item_id, updates);

    return transactionData;
  },

  async updateInventoryItemQuantity(itemId: string, updates: Partial<InventoryItem>): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) throw error;
  },

  async getInventorySummary(ventureId: string) {
    const items = await this.getInventoryItems(ventureId, true);
    const lowStockItems = await this.getLowStockItems(ventureId);

    const totalValue = items.reduce(
      (sum, item) => sum + item.current_quantity * item.unit_cost,
      0
    );
    const totalItems = items.reduce((sum, item) => sum + item.current_quantity, 0);
    const uniqueProducts = items.length;

    return {
      totalValue,
      totalItems,
      uniqueProducts,
      lowStockCount: lowStockItems.length,
      lowStockItems,
    };
  },
};
