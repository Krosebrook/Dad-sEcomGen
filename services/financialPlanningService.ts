import { supabase } from '../lib/supabase';

export interface FinancialProjection {
  id: string;
  venture_id: string;
  user_id: string;
  projection_name: string;
  projection_type: 'revenue' | 'expense' | 'profit' | 'custom';
  time_period: 'monthly' | 'quarterly' | 'yearly';
  projection_data: Array<{
    period: string;
    value: number;
    notes?: string;
  }>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BreakEvenAnalysis {
  id: string;
  venture_id: string;
  user_id: string;
  analysis_name: string;
  fixed_costs: number;
  variable_cost_per_unit: number;
  price_per_unit: number;
  break_even_units: number;
  break_even_revenue: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CashFlowForecast {
  id: string;
  venture_id: string;
  user_id: string;
  forecast_name: string;
  month_year: string;
  revenue: number;
  cost_of_goods: number;
  operating_expenses: number;
  marketing_expenses: number;
  other_expenses: number;
  total_expenses: number;
  net_cash_flow: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const financialPlanningService = {
  async getProjections(ventureId: string): Promise<FinancialProjection[]> {
    const { data, error } = await supabase
      .from('financial_projections')
      .select('*')
      .eq('venture_id', ventureId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createProjection(
    projection: Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>
  ): Promise<FinancialProjection> {
    const { data, error } = await supabase
      .from('financial_projections')
      .insert(projection)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProjection(id: string, updates: Partial<FinancialProjection>): Promise<FinancialProjection> {
    const { data, error } = await supabase
      .from('financial_projections')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProjection(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_projections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getBreakEvenAnalyses(ventureId: string): Promise<BreakEvenAnalysis[]> {
    const { data, error } = await supabase
      .from('break_even_analysis')
      .select('*')
      .eq('venture_id', ventureId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createBreakEvenAnalysis(
    analysis: Omit<BreakEvenAnalysis, 'id' | 'created_at' | 'updated_at' | 'break_even_units' | 'break_even_revenue'>
  ): Promise<BreakEvenAnalysis> {
    const { data, error } = await supabase
      .from('break_even_analysis')
      .insert(analysis)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBreakEvenAnalysis(id: string, updates: Partial<BreakEvenAnalysis>): Promise<BreakEvenAnalysis> {
    const { data, error } = await supabase
      .from('break_even_analysis')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBreakEvenAnalysis(id: string): Promise<void> {
    const { error } = await supabase
      .from('break_even_analysis')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCashFlowForecasts(ventureId: string): Promise<CashFlowForecast[]> {
    const { data, error } = await supabase
      .from('cash_flow_forecasts')
      .select('*')
      .eq('venture_id', ventureId)
      .order('month_year', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createCashFlowForecast(
    forecast: Omit<CashFlowForecast, 'id' | 'created_at' | 'updated_at' | 'total_expenses' | 'net_cash_flow'>
  ): Promise<CashFlowForecast> {
    const { data, error } = await supabase
      .from('cash_flow_forecasts')
      .insert(forecast)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCashFlowForecast(id: string, updates: Partial<CashFlowForecast>): Promise<CashFlowForecast> {
    const { data, error } = await supabase
      .from('cash_flow_forecasts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCashFlowForecast(id: string): Promise<void> {
    const { error } = await supabase
      .from('cash_flow_forecasts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  calculateBreakEven(fixedCosts: number, variableCostPerUnit: number, pricePerUnit: number) {
    const contributionMargin = pricePerUnit - variableCostPerUnit;
    if (contributionMargin <= 0) {
      return { units: 0, revenue: 0, isViable: false };
    }
    const units = fixedCosts / contributionMargin;
    const revenue = units * pricePerUnit;
    return { units: Math.ceil(units), revenue, isViable: true };
  },
};
