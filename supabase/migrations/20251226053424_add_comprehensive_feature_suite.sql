/*
  # Comprehensive Feature Suite - All Options A-E

  ## Overview
  This migration adds five major feature suites to enhance the e-commerce planning platform:
  - Enhanced Product Scout (saved searches, price tracking)
  - Financial Planning Suite (break-even, cash flow projections)
  - Marketing Plan Generator (content calendar, ad campaigns)
  - Inventory Management (stock tracking, reorder alerts)
  - Analytics & Reporting (performance dashboard, custom reports)

  ## 1. Product Scout Enhancement Tables
  
  ### saved_product_searches
  - Stores user's saved search criteria for quick access
  - Links to ventures for context
  - Includes filters as JSONB for flexibility
  
  ### product_price_history
  - Tracks historical pricing data for products
  - Enables trend analysis and price tracking
  
  ### price_alerts
  - User-configured price alerts for products
  - Triggers notifications when target price is reached

  ## 2. Financial Planning Tables
  
  ### financial_projections
  - Comprehensive financial modeling data
  - Supports multiple projection types (revenue, expense, profit)
  
  ### break_even_analysis
  - Break-even point calculations
  - Links fixed/variable costs to pricing strategy
  
  ### cash_flow_forecasts
  - Monthly cash flow projections
  - Tracks revenue, expenses, and net cash flow

  ## 3. Marketing Plan Tables
  
  ### marketing_campaigns
  - Campaign management across platforms
  - Budget tracking and status monitoring
  
  ### content_calendar
  - Content scheduling and planning
  - Multi-platform support
  
  ### ad_budget_tracking
  - Detailed ad performance metrics
  - ROI calculation and optimization

  ## 4. Inventory Management Tables
  
  ### suppliers
  - Supplier contact and lead time information
  - Links to inventory items
  
  ### inventory_items
  - Product stock tracking
  - Reorder point automation
  
  ### inventory_transactions
  - Complete transaction history
  - Supports stock adjustments and auditing

  ## 5. Analytics & Reporting Tables
  
  ### analytics_events
  - Event tracking for user actions
  - Flexible event_data structure
  
  ### performance_metrics
  - Time-series performance data
  - Supports custom metric types
  
  ### custom_reports
  - User-defined report configurations
  - Saved report templates

  ## Security
  - RLS enabled on all tables
  - Policies enforce user ownership and venture access
  - Authenticated users only
*/

-- ============================================================================
-- OPTION A: ENHANCED PRODUCT SCOUT
-- ============================================================================

-- Saved product searches for quick access
CREATE TABLE IF NOT EXISTS saved_product_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
  search_name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product price history for tracking
CREATE TABLE IF NOT EXISTS product_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_asin text NOT NULL,
  product_title text,
  price numeric(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  marketplace text DEFAULT 'amazon',
  recorded_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Price alerts for users
CREATE TABLE IF NOT EXISTS price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_id uuid REFERENCES ventures(id) ON DELETE SET NULL,
  product_asin text NOT NULL,
  product_title text,
  target_price numeric(10, 2) NOT NULL,
  current_price numeric(10, 2),
  is_active boolean DEFAULT true,
  alert_triggered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- OPTION B: FINANCIAL PLANNING SUITE
-- ============================================================================

-- Financial projections (revenue, expenses, profit forecasts)
CREATE TABLE IF NOT EXISTS financial_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  projection_name text NOT NULL,
  projection_type text NOT NULL CHECK (projection_type IN ('revenue', 'expense', 'profit', 'custom')),
  time_period text NOT NULL CHECK (time_period IN ('monthly', 'quarterly', 'yearly')),
  projection_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Break-even analysis
CREATE TABLE IF NOT EXISTS break_even_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_name text NOT NULL,
  fixed_costs numeric(12, 2) NOT NULL DEFAULT 0,
  variable_cost_per_unit numeric(10, 2) NOT NULL DEFAULT 0,
  price_per_unit numeric(10, 2) NOT NULL DEFAULT 0,
  break_even_units numeric(12, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN (price_per_unit - variable_cost_per_unit) > 0 
      THEN fixed_costs / (price_per_unit - variable_cost_per_unit)
      ELSE 0
    END
  ) STORED,
  break_even_revenue numeric(12, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN (price_per_unit - variable_cost_per_unit) > 0 
      THEN (fixed_costs / (price_per_unit - variable_cost_per_unit)) * price_per_unit
      ELSE 0
    END
  ) STORED,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cash flow forecasts
CREATE TABLE IF NOT EXISTS cash_flow_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  forecast_name text NOT NULL,
  month_year date NOT NULL,
  revenue numeric(12, 2) DEFAULT 0,
  cost_of_goods numeric(12, 2) DEFAULT 0,
  operating_expenses numeric(12, 2) DEFAULT 0,
  marketing_expenses numeric(12, 2) DEFAULT 0,
  other_expenses numeric(12, 2) DEFAULT 0,
  total_expenses numeric(12, 2) GENERATED ALWAYS AS (
    cost_of_goods + operating_expenses + marketing_expenses + other_expenses
  ) STORED,
  net_cash_flow numeric(12, 2) GENERATED ALWAYS AS (
    revenue - (cost_of_goods + operating_expenses + marketing_expenses + other_expenses)
  ) STORED,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- OPTION C: MARKETING PLAN GENERATOR
-- ============================================================================

-- Marketing campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_name text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('facebook', 'instagram', 'google', 'tiktok', 'pinterest', 'email', 'other')),
  campaign_type text DEFAULT 'awareness' CHECK (campaign_type IN ('awareness', 'consideration', 'conversion', 'retention')),
  budget numeric(10, 2) DEFAULT 0,
  spent numeric(10, 2) DEFAULT 0,
  start_date date NOT NULL,
  end_date date,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'paused', 'completed', 'cancelled')),
  goals text,
  target_audience jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Content calendar
CREATE TABLE IF NOT EXISTS content_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  content_type text NOT NULL CHECK (content_type IN ('post', 'story', 'video', 'blog', 'email', 'ad')),
  title text NOT NULL,
  description text,
  platform text NOT NULL,
  scheduled_date timestamptz NOT NULL,
  published_date timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'cancelled')),
  content_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ad budget tracking and performance
CREATE TABLE IF NOT EXISTS ad_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  spent numeric(10, 2) DEFAULT 0,
  revenue numeric(10, 2) DEFAULT 0,
  ctr numeric(5, 2) GENERATED ALWAYS AS (
    CASE WHEN impressions > 0 THEN (clicks::numeric / impressions::numeric * 100) ELSE 0 END
  ) STORED,
  cpc numeric(10, 2) GENERATED ALWAYS AS (
    CASE WHEN clicks > 0 THEN spent / clicks ELSE 0 END
  ) STORED,
  roi numeric(10, 2) GENERATED ALWAYS AS (
    CASE WHEN spent > 0 THEN ((revenue - spent) / spent * 100) ELSE 0 END
  ) STORED,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- OPTION D: INVENTORY MANAGEMENT
-- ============================================================================

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  address text,
  lead_time_days integer DEFAULT 14,
  minimum_order_quantity integer DEFAULT 1,
  minimum_order_value numeric(10, 2) DEFAULT 0,
  payment_terms text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory items
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  sku text NOT NULL,
  description text,
  category text,
  current_quantity integer DEFAULT 0,
  reorder_point integer DEFAULT 10,
  reorder_quantity integer DEFAULT 50,
  unit_cost numeric(10, 2) DEFAULT 0,
  selling_price numeric(10, 2) DEFAULT 0,
  location text,
  is_active boolean DEFAULT true,
  last_restock_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(venture_id, sku)
);

-- Inventory transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('restock', 'sale', 'adjustment', 'return', 'damage')),
  quantity integer NOT NULL,
  unit_cost numeric(10, 2),
  total_cost numeric(10, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  reference_number text,
  notes text,
  transaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- OPTION E: ANALYTICS & REPORTING
-- ============================================================================

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_category text DEFAULT 'general' CHECK (event_category IN ('general', 'product', 'marketing', 'financial', 'inventory')),
  event_data jsonb DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  metric_category text DEFAULT 'general' CHECK (metric_category IN ('general', 'financial', 'marketing', 'inventory', 'customer')),
  metric_value numeric(15, 2) NOT NULL,
  metric_unit text,
  date date NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Custom reports
CREATE TABLE IF NOT EXISTS custom_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_name text NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('financial', 'marketing', 'inventory', 'comprehensive', 'custom')),
  report_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_favorite boolean DEFAULT false,
  last_generated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Product Scout indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_product_searches(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_searches_venture ON saved_product_searches(venture_id);
CREATE INDEX IF NOT EXISTS idx_price_history_asin ON product_price_history(product_asin, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_active ON price_alerts(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_price_alerts_asin ON price_alerts(product_asin) WHERE is_active = true;

-- Financial Planning indexes
CREATE INDEX IF NOT EXISTS idx_financial_projections_venture ON financial_projections(venture_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_break_even_venture ON break_even_analysis(venture_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cash_flow_venture_date ON cash_flow_forecasts(venture_id, month_year DESC);

-- Marketing indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_venture_status ON marketing_campaigns(venture_id, status, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_content_calendar_venture_date ON content_calendar(venture_id, scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_ad_performance_campaign_date ON ad_performance(campaign_id, date DESC);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_venture ON suppliers(venture_id, is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_venture_sku ON inventory_items(venture_id, sku);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory_items(venture_id, current_quantity) WHERE current_quantity <= reorder_point;
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(item_id, transaction_date DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_venture ON analytics_events(venture_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_venture_date ON performance_metrics(venture_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type, date DESC);
CREATE INDEX IF NOT EXISTS idx_custom_reports_venture ON custom_reports(venture_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE saved_product_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE break_even_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

-- Product Scout Policies
CREATE POLICY "Users can view own saved searches"
  ON saved_product_searches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved searches"
  ON saved_product_searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches"
  ON saved_product_searches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON saved_product_searches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view price history"
  ON product_price_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own price alerts"
  ON price_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own price alerts"
  ON price_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own price alerts"
  ON price_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own price alerts"
  ON price_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Financial Planning Policies
CREATE POLICY "Users can view own financial projections"
  ON financial_projections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own financial projections"
  ON financial_projections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial projections"
  ON financial_projections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial projections"
  ON financial_projections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own break-even analysis"
  ON break_even_analysis FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own break-even analysis"
  ON break_even_analysis FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own break-even analysis"
  ON break_even_analysis FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own break-even analysis"
  ON break_even_analysis FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own cash flow forecasts"
  ON cash_flow_forecasts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cash flow forecasts"
  ON cash_flow_forecasts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cash flow forecasts"
  ON cash_flow_forecasts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cash flow forecasts"
  ON cash_flow_forecasts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Marketing Policies
CREATE POLICY "Users can view own campaigns"
  ON marketing_campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns"
  ON marketing_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON marketing_campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON marketing_campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content calendar"
  ON content_calendar FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own content calendar"
  ON content_calendar FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content calendar"
  ON content_calendar FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own content calendar"
  ON content_calendar FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view ad performance for own campaigns"
  ON ad_performance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      WHERE marketing_campaigns.id = ad_performance.campaign_id
      AND marketing_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ad performance for own campaigns"
  ON ad_performance FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      WHERE marketing_campaigns.id = ad_performance.campaign_id
      AND marketing_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ad performance for own campaigns"
  ON ad_performance FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      WHERE marketing_campaigns.id = ad_performance.campaign_id
      AND marketing_campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      WHERE marketing_campaigns.id = ad_performance.campaign_id
      AND marketing_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ad performance for own campaigns"
  ON ad_performance FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      WHERE marketing_campaigns.id = ad_performance.campaign_id
      AND marketing_campaigns.user_id = auth.uid()
    )
  );

-- Inventory Policies
CREATE POLICY "Users can view own suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own inventory items"
  ON inventory_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own inventory items"
  ON inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory items"
  ON inventory_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory items"
  ON inventory_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view transactions for own inventory"
  ON inventory_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inventory_items
      WHERE inventory_items.id = inventory_transactions.item_id
      AND inventory_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions for own inventory"
  ON inventory_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inventory_items
      WHERE inventory_items.id = inventory_transactions.item_id
      AND inventory_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update transactions for own inventory"
  ON inventory_transactions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inventory_items
      WHERE inventory_items.id = inventory_transactions.item_id
      AND inventory_items.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inventory_items
      WHERE inventory_items.id = inventory_transactions.item_id
      AND inventory_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transactions for own inventory"
  ON inventory_transactions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inventory_items
      WHERE inventory_items.id = inventory_transactions.item_id
      AND inventory_items.user_id = auth.uid()
    )
  );

-- Analytics Policies
CREATE POLICY "Users can view own analytics events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own performance metrics"
  ON performance_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own performance metrics"
  ON performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance metrics"
  ON performance_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own performance metrics"
  ON performance_metrics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own custom reports"
  ON custom_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom reports"
  ON custom_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom reports"
  ON custom_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom reports"
  ON custom_reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);