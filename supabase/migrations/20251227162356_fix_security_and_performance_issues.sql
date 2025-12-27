/*
  # Fix Security and Performance Issues

  ## Changes
  
  1. **Add Missing Indexes on Foreign Keys**
     - Add index on `documents.created_by`
     - Add index on `edge_cases.assigned_to`
     - Add index on `exports.created_by`

  2. **Optimize RLS Policies**
     - Replace `auth.uid()` with `(select auth.uid())` in all policies
     - This prevents re-evaluation on each row for better performance

  3. **Fix Function Search Path**
     - Make `update_updated_at_column` function search path immutable

  ## Performance Impact
  - Significant improvement in RLS policy evaluation
  - Better foreign key join performance
  - Reduced query planning overhead
*/

-- =====================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_edge_cases_assigned_to ON edge_cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_exports_created_by ON exports(created_by);

-- =====================================================
-- 2. FIX FUNCTION SEARCH PATH
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES FOR PRODUCTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view products in their ventures" ON products;
DROP POLICY IF EXISTS "Users can create products in their ventures" ON products;
DROP POLICY IF EXISTS "Users can update products in their ventures" ON products;
DROP POLICY IF EXISTS "Users can delete products in their ventures" ON products;

CREATE POLICY "Users can view products in their ventures"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = products.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create products in their ventures"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = products.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update products in their ventures"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = products.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = products.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete products in their ventures"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = products.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES FOR DOCUMENTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view documents in their ventures" ON documents;
DROP POLICY IF EXISTS "Users can create documents in their ventures" ON documents;
DROP POLICY IF EXISTS "Users can update documents in their ventures" ON documents;
DROP POLICY IF EXISTS "Users can delete documents in their ventures" ON documents;

CREATE POLICY "Users can view documents in their ventures"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = documents.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create documents in their ventures"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = documents.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update documents in their ventures"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = documents.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = documents.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete documents in their ventures"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = documents.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES FOR API_INTEGRATIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view API integrations in their ventures" ON api_integrations;
DROP POLICY IF EXISTS "Users can create API integrations in their ventures" ON api_integrations;
DROP POLICY IF EXISTS "Users can update API integrations in their ventures" ON api_integrations;
DROP POLICY IF EXISTS "Users can delete API integrations in their ventures" ON api_integrations;

CREATE POLICY "Users can view API integrations in their ventures"
  ON api_integrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = api_integrations.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create API integrations in their ventures"
  ON api_integrations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = api_integrations.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update API integrations in their ventures"
  ON api_integrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = api_integrations.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = api_integrations.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete API integrations in their ventures"
  ON api_integrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = api_integrations.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES FOR SCRAPED_DATA
-- =====================================================

DROP POLICY IF EXISTS "Users can view scraped data in their ventures" ON scraped_data;
DROP POLICY IF EXISTS "Users can create scraped data in their ventures" ON scraped_data;
DROP POLICY IF EXISTS "Users can delete scraped data in their ventures" ON scraped_data;

CREATE POLICY "Users can view scraped data in their ventures"
  ON scraped_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = scraped_data.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create scraped data in their ventures"
  ON scraped_data FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = scraped_data.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete scraped data in their ventures"
  ON scraped_data FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = scraped_data.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 7. OPTIMIZE RLS POLICIES FOR CRAWL_JOBS
-- =====================================================

DROP POLICY IF EXISTS "Users can view crawl jobs in their ventures" ON crawl_jobs;
DROP POLICY IF EXISTS "Users can create crawl jobs in their ventures" ON crawl_jobs;
DROP POLICY IF EXISTS "Users can update crawl jobs in their ventures" ON crawl_jobs;

CREATE POLICY "Users can view crawl jobs in their ventures"
  ON crawl_jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = crawl_jobs.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create crawl jobs in their ventures"
  ON crawl_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = crawl_jobs.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update crawl jobs in their ventures"
  ON crawl_jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = crawl_jobs.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = crawl_jobs.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 8. OPTIMIZE RLS POLICIES FOR WEBHOOKS
-- =====================================================

DROP POLICY IF EXISTS "Users can view webhooks in their ventures" ON webhooks;
DROP POLICY IF EXISTS "Users can create webhooks in their ventures" ON webhooks;
DROP POLICY IF EXISTS "Users can update webhooks in their ventures" ON webhooks;
DROP POLICY IF EXISTS "Users can delete webhooks in their ventures" ON webhooks;

CREATE POLICY "Users can view webhooks in their ventures"
  ON webhooks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = webhooks.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create webhooks in their ventures"
  ON webhooks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = webhooks.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update webhooks in their ventures"
  ON webhooks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = webhooks.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = webhooks.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete webhooks in their ventures"
  ON webhooks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = webhooks.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 9. OPTIMIZE RLS POLICIES FOR AUTOMATION_WORKFLOWS
-- =====================================================

DROP POLICY IF EXISTS "Users can view automation workflows in their ventures" ON automation_workflows;
DROP POLICY IF EXISTS "Users can create automation workflows in their ventures" ON automation_workflows;
DROP POLICY IF EXISTS "Users can update automation workflows in their ventures" ON automation_workflows;
DROP POLICY IF EXISTS "Users can delete automation workflows in their ventures" ON automation_workflows;

CREATE POLICY "Users can view automation workflows in their ventures"
  ON automation_workflows FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = automation_workflows.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create automation workflows in their ventures"
  ON automation_workflows FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = automation_workflows.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update automation workflows in their ventures"
  ON automation_workflows FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = automation_workflows.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = automation_workflows.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete automation workflows in their ventures"
  ON automation_workflows FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = automation_workflows.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 10. OPTIMIZE RLS POLICIES FOR EXPORTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view exports in their ventures" ON exports;
DROP POLICY IF EXISTS "Users can create exports in their ventures" ON exports;

CREATE POLICY "Users can view exports in their ventures"
  ON exports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = exports.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create exports in their ventures"
  ON exports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = exports.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 11. OPTIMIZE RLS POLICIES FOR DEPENDENCIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view dependencies in their ventures" ON dependencies;
DROP POLICY IF EXISTS "Users can create dependencies in their ventures" ON dependencies;
DROP POLICY IF EXISTS "Users can update dependencies in their ventures" ON dependencies;

CREATE POLICY "Users can view dependencies in their ventures"
  ON dependencies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = dependencies.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create dependencies in their ventures"
  ON dependencies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = dependencies.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update dependencies in their ventures"
  ON dependencies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = dependencies.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = dependencies.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 12. OPTIMIZE RLS POLICIES FOR EDGE_CASES
-- =====================================================

DROP POLICY IF EXISTS "Users can view edge cases in their ventures" ON edge_cases;
DROP POLICY IF EXISTS "Users can create edge cases in their ventures" ON edge_cases;
DROP POLICY IF EXISTS "Users can update edge cases in their ventures" ON edge_cases;

CREATE POLICY "Users can view edge cases in their ventures"
  ON edge_cases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = edge_cases.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create edge cases in their ventures"
  ON edge_cases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = edge_cases.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update edge cases in their ventures"
  ON edge_cases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = edge_cases.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = edge_cases.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );
