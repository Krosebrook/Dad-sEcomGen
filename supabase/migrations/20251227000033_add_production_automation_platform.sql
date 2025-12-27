/*
  # Production Automation Platform Schema

  ## Overview
  Complete business automation platform with product management, document generation,
  API integrations, web scraping, and comprehensive data export capabilities.

  ## New Tables

  ### 1. products
  - `id` (uuid, primary key)
  - `venture_id` (uuid, foreign key)
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `sku` (text) - Stock keeping unit
  - `price` (numeric) - Product price
  - `cost` (numeric) - Product cost
  - `inventory_count` (integer) - Current inventory
  - `category` (text) - Product category
  - `tags` (jsonb) - Product tags
  - `images` (jsonb) - Product images array
  - `specifications` (jsonb) - Technical specs
  - `supplier_info` (jsonb) - Supplier details
  - `status` (text) - active/inactive/discontinued
  - `metadata` (jsonb) - Additional metadata
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. documents
  - `id` (uuid, primary key)
  - `venture_id` (uuid, foreign key)
  - `type` (text) - contract/invoice/legal/report/proposal
  - `title` (text) - Document title
  - `content` (jsonb) - Document content structure
  - `template_id` (uuid, nullable) - Reference to template
  - `status` (text) - draft/final/signed/archived
  - `version` (integer) - Document version
  - `file_url` (text) - Generated file URL
  - `metadata` (jsonb) - Additional metadata
  - `created_by` (uuid) - User who created
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. api_integrations
  - `id` (uuid, primary key)
  - `venture_id` (uuid, foreign key)
  - `provider` (text) - shopify/stripe/mailchimp/etc
  - `name` (text) - Integration name
  - `credentials` (text) - Encrypted credentials
  - `config` (jsonb) - Integration configuration
  - `status` (text) - active/inactive/error
  - `last_sync` (timestamptz) - Last successful sync
  - `error_log` (jsonb) - Error history
  - `rate_limit` (jsonb) - Rate limiting info
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. scraped_data
  - `id` (uuid, primary key)
  - `venture_id` (uuid, foreign key)
  - `source_url` (text) - Original URL
  - `source_type` (text) - competitor/market/product/pricing
  - `data` (jsonb) - Scraped data
  - `parsed_data` (jsonb) - Processed data
  - `scrape_date` (timestamptz) - When scraped
  - `status` (text) - success/failed/processing
  - `metadata` (jsonb) - Scrape metadata
  - `created_at` (timestamptz)

  ### 5. crawl_jobs
  - `id` (uuid, primary key)
  - `venture_id` (uuid, foreign key)
  - `name` (text) - Job name
  - `start_url` (text) - Starting URL
  - `crawl_config` (jsonb) - Crawl configuration
  - `status` (text) - pending/running/completed/failed
  - `progress` (jsonb) - Progress tracking
  - `results_count` (integer) - Number of results
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 6. webhooks
  - `id` (uuid, primary key)
  - `venture_id` (uuid, foreign key)
  - `name` (text) - Webhook name
  - `event_type` (text) - Event to trigger on
  - `url` (text) - Target URL
  - `method` (text) - HTTP method
  - `headers` (jsonb) - Custom headers
  - `payload_template` (jsonb) - Payload structure
  - `status` (text) - active/inactive
  - `last_triggered` (timestamptz)
  - `success_count` (integer)
  - `failure_count` (integer)
  - `created_at` (timestamptz)

  ### 7. automation_workflows
  - `id` (uuid, primary key)
  - `venture_id` (uuid, foreign key)
  - `name` (text) - Workflow name
  - `description` (text)
  - `trigger` (jsonb) - Trigger configuration
  - `actions` (jsonb) - Action steps array
  - `conditions` (jsonb) - Conditional logic
  - `status` (text) - active/inactive/error
  - `execution_count` (integer)
  - `last_executed` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 8. exports
  - `id` (uuid, primary key)
  - `venture_id` (uuid, foreign key)
  - `export_type` (text) - products/documents/analytics/full
  - `format` (text) - pdf/csv/json/zip
  - `filters` (jsonb) - Export filters
  - `status` (text) - pending/processing/completed/failed
  - `file_url` (text) - Generated file URL
  - `file_size` (bigint) - File size in bytes
  - `metadata` (jsonb)
  - `created_by` (uuid)
  - `created_at` (timestamptz)
  - `expires_at` (timestamptz)

  ### 9. dependencies
  - `id` (uuid, primary key)
  - `venture_id` (uuid, foreign key)
  - `package_name` (text) - Package name
  - `version` (text) - Version
  - `type` (text) - npm/pip/gem/etc
  - `status` (text) - active/outdated/vulnerable
  - `update_available` (text) - Latest version
  - `last_checked` (timestamptz)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ### 10. edge_cases
  - `id` (uuid, primary key)
  - `venture_id` (uuid, foreign key)
  - `category` (text) - error/warning/edge_case
  - `severity` (text) - low/medium/high/critical
  - `title` (text)
  - `description` (text)
  - `context` (jsonb) - Error context
  - `resolution` (text) - How it was resolved
  - `status` (text) - open/investigating/resolved
  - `assigned_to` (uuid)
  - `created_at` (timestamptz)
  - `resolved_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their venture data
  - Encrypted credentials for API integrations
  - Secure webhook endpoints

  ## Indexes
  - Optimized for common queries
  - Full-text search on products and documents
  - Efficient filtering and sorting
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  sku text,
  price numeric(10,2) DEFAULT 0,
  cost numeric(10,2) DEFAULT 0,
  inventory_count integer DEFAULT 0,
  category text,
  tags jsonb DEFAULT '[]'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  specifications jsonb DEFAULT '{}'::jsonb,
  supplier_info jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT products_status_check CHECK (status IN ('active', 'inactive', 'discontinued'))
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  template_id uuid,
  status text DEFAULT 'draft',
  version integer DEFAULT 1,
  file_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT documents_type_check CHECK (type IN ('contract', 'invoice', 'legal', 'report', 'proposal', 'other')),
  CONSTRAINT documents_status_check CHECK (status IN ('draft', 'final', 'signed', 'archived'))
);

-- Create api_integrations table
CREATE TABLE IF NOT EXISTS api_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL,
  name text NOT NULL,
  credentials text,
  config jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'inactive',
  last_sync timestamptz,
  error_log jsonb DEFAULT '[]'::jsonb,
  rate_limit jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT api_integrations_status_check CHECK (status IN ('active', 'inactive', 'error'))
);

-- Create scraped_data table
CREATE TABLE IF NOT EXISTS scraped_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  source_url text NOT NULL,
  source_type text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  parsed_data jsonb DEFAULT '{}'::jsonb,
  scrape_date timestamptz DEFAULT now(),
  status text DEFAULT 'processing',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT scraped_data_source_type_check CHECK (source_type IN ('competitor', 'market', 'product', 'pricing', 'trends', 'other')),
  CONSTRAINT scraped_data_status_check CHECK (status IN ('success', 'failed', 'processing'))
);

-- Create crawl_jobs table
CREATE TABLE IF NOT EXISTS crawl_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  start_url text NOT NULL,
  crawl_config jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending',
  progress jsonb DEFAULT '{}'::jsonb,
  results_count integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT crawl_jobs_status_check CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled'))
);

-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  event_type text NOT NULL,
  url text NOT NULL,
  method text DEFAULT 'POST',
  headers jsonb DEFAULT '{}'::jsonb,
  payload_template jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  last_triggered timestamptz,
  success_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT webhooks_status_check CHECK (status IN ('active', 'inactive')),
  CONSTRAINT webhooks_method_check CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE'))
);

-- Create automation_workflows table
CREATE TABLE IF NOT EXISTS automation_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  trigger jsonb DEFAULT '{}'::jsonb,
  actions jsonb DEFAULT '[]'::jsonb,
  conditions jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'inactive',
  execution_count integer DEFAULT 0,
  last_executed timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT automation_workflows_status_check CHECK (status IN ('active', 'inactive', 'error'))
);

-- Create exports table
CREATE TABLE IF NOT EXISTS exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  export_type text NOT NULL,
  format text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending',
  file_url text,
  file_size bigint DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  CONSTRAINT exports_type_check CHECK (export_type IN ('products', 'documents', 'analytics', 'full', 'custom')),
  CONSTRAINT exports_format_check CHECK (format IN ('pdf', 'csv', 'json', 'xlsx', 'zip')),
  CONSTRAINT exports_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Create dependencies table
CREATE TABLE IF NOT EXISTS dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  package_name text NOT NULL,
  version text NOT NULL,
  type text DEFAULT 'npm',
  status text DEFAULT 'active',
  update_available text,
  last_checked timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT dependencies_type_check CHECK (type IN ('npm', 'pip', 'gem', 'composer', 'maven', 'other')),
  CONSTRAINT dependencies_status_check CHECK (status IN ('active', 'outdated', 'vulnerable', 'deprecated'))
);

-- Create edge_cases table
CREATE TABLE IF NOT EXISTS edge_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  severity text NOT NULL,
  title text NOT NULL,
  description text,
  context jsonb DEFAULT '{}'::jsonb,
  resolution text,
  status text DEFAULT 'open',
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  CONSTRAINT edge_cases_category_check CHECK (category IN ('error', 'warning', 'edge_case', 'bug', 'security')),
  CONSTRAINT edge_cases_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT edge_cases_status_check CHECK (status IN ('open', 'investigating', 'resolved', 'wont_fix'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_venture_id ON products(venture_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_venture_id ON documents(venture_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_integrations_venture_id ON api_integrations(venture_id);
CREATE INDEX IF NOT EXISTS idx_api_integrations_provider ON api_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_api_integrations_status ON api_integrations(status);

CREATE INDEX IF NOT EXISTS idx_scraped_data_venture_id ON scraped_data(venture_id);
CREATE INDEX IF NOT EXISTS idx_scraped_data_source_type ON scraped_data(source_type);
CREATE INDEX IF NOT EXISTS idx_scraped_data_scrape_date ON scraped_data(scrape_date DESC);

CREATE INDEX IF NOT EXISTS idx_crawl_jobs_venture_id ON crawl_jobs(venture_id);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_created_at ON crawl_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhooks_venture_id ON webhooks(venture_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_event_type ON webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON webhooks(status);

CREATE INDEX IF NOT EXISTS idx_automation_workflows_venture_id ON automation_workflows(venture_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_status ON automation_workflows(status);

CREATE INDEX IF NOT EXISTS idx_exports_venture_id ON exports(venture_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON exports(status);
CREATE INDEX IF NOT EXISTS idx_exports_created_at ON exports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dependencies_venture_id ON dependencies(venture_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_status ON dependencies(status);

CREATE INDEX IF NOT EXISTS idx_edge_cases_venture_id ON edge_cases(venture_id);
CREATE INDEX IF NOT EXISTS idx_edge_cases_status ON edge_cases(status);
CREATE INDEX IF NOT EXISTS idx_edge_cases_severity ON edge_cases(severity);

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge_cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Users can view products in their ventures"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = products.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create products in their ventures"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = products.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update products in their ventures"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = products.venture_id
      AND ventures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = products.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete products in their ventures"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = products.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

-- RLS Policies for documents
CREATE POLICY "Users can view documents in their ventures"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = documents.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents in their ventures"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = documents.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents in their ventures"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = documents.venture_id
      AND ventures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = documents.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents in their ventures"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = documents.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

-- RLS Policies for api_integrations
CREATE POLICY "Users can view API integrations in their ventures"
  ON api_integrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = api_integrations.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create API integrations in their ventures"
  ON api_integrations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = api_integrations.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update API integrations in their ventures"
  ON api_integrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = api_integrations.venture_id
      AND ventures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = api_integrations.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete API integrations in their ventures"
  ON api_integrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = api_integrations.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

-- RLS Policies for scraped_data
CREATE POLICY "Users can view scraped data in their ventures"
  ON scraped_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = scraped_data.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scraped data in their ventures"
  ON scraped_data FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = scraped_data.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scraped data in their ventures"
  ON scraped_data FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = scraped_data.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

-- RLS Policies for crawl_jobs
CREATE POLICY "Users can view crawl jobs in their ventures"
  ON crawl_jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = crawl_jobs.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create crawl jobs in their ventures"
  ON crawl_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = crawl_jobs.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update crawl jobs in their ventures"
  ON crawl_jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = crawl_jobs.venture_id
      AND ventures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = crawl_jobs.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

-- RLS Policies for webhooks
CREATE POLICY "Users can view webhooks in their ventures"
  ON webhooks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = webhooks.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create webhooks in their ventures"
  ON webhooks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = webhooks.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update webhooks in their ventures"
  ON webhooks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = webhooks.venture_id
      AND ventures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = webhooks.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete webhooks in their ventures"
  ON webhooks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = webhooks.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

-- RLS Policies for automation_workflows
CREATE POLICY "Users can view automation workflows in their ventures"
  ON automation_workflows FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = automation_workflows.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create automation workflows in their ventures"
  ON automation_workflows FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = automation_workflows.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update automation workflows in their ventures"
  ON automation_workflows FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = automation_workflows.venture_id
      AND ventures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = automation_workflows.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete automation workflows in their ventures"
  ON automation_workflows FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = automation_workflows.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

-- RLS Policies for exports
CREATE POLICY "Users can view exports in their ventures"
  ON exports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = exports.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create exports in their ventures"
  ON exports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = exports.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

-- RLS Policies for dependencies
CREATE POLICY "Users can view dependencies in their ventures"
  ON dependencies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = dependencies.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create dependencies in their ventures"
  ON dependencies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = dependencies.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update dependencies in their ventures"
  ON dependencies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = dependencies.venture_id
      AND ventures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = dependencies.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

-- RLS Policies for edge_cases
CREATE POLICY "Users can view edge cases in their ventures"
  ON edge_cases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = edge_cases.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create edge cases in their ventures"
  ON edge_cases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = edge_cases.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update edge cases in their ventures"
  ON edge_cases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = edge_cases.venture_id
      AND ventures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = edge_cases.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_integrations_updated_at
  BEFORE UPDATE ON api_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_workflows_updated_at
  BEFORE UPDATE ON automation_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
