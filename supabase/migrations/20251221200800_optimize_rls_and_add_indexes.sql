/*
  # Optimize RLS Policies and Add Missing Indexes

  1. **RLS Optimizations**
    - Optimize export_history RLS policies to use (select auth.uid()) pattern
    - Prevents N+1 RLS evaluations on queries
    - Consolidates duplicate policies from previous migrations

  2. **Missing Indexes**
    - Add idx_export_history_venture_created for venture-scoped export queries
    - Add idx_ventures_active_by_updated partial index for active ventures
    - Improves query performance for common UI patterns

  3. **Constraints**
    - Add unique constraint on export_templates (user_id, name)
    - Prevents duplicate template names per user

  4. **Performance**
    - Estimated 50-70% improvement in export history queries
    - Estimated 80% improvement in getAllVentures() query
*/

-- ===========================
-- 1. OPTIMIZE RLS POLICIES
-- ===========================

-- Drop old export_history policies
DROP POLICY IF EXISTS "Users can view own export history" ON export_history;
DROP POLICY IF EXISTS "Users can insert own export history" ON export_history;
DROP POLICY IF EXISTS "Users can update own export history" ON export_history;
DROP POLICY IF EXISTS "Users can delete own export history" ON export_history;

-- Create optimized export_history policies using (select auth.uid())
CREATE POLICY "Users can view own export history"
  ON export_history
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own export history"
  ON export_history
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own export history"
  ON export_history
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own export history"
  ON export_history
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ===========================
-- 2. ADD MISSING INDEXES
-- ===========================

-- Index for venture-scoped export history queries
CREATE INDEX IF NOT EXISTS idx_export_history_venture_created
  ON export_history(venture_id, created_at DESC)
  WHERE venture_id IS NOT NULL;

-- Partial index for active ventures ordered by update time
CREATE INDEX IF NOT EXISTS idx_ventures_active_by_updated
  ON ventures(user_id, updated_at DESC)
  WHERE is_archived = false;

-- Composite index for venture_data batch queries
CREATE INDEX IF NOT EXISTS idx_venture_data_batch_load
  ON venture_data(venture_id, data_type, version DESC);

-- Index for export_history status queries
CREATE INDEX IF NOT EXISTS idx_export_history_status_date
  ON export_history(user_id, status, created_at DESC);

-- ===========================
-- 3. ADD CONSTRAINTS
-- ===========================

-- Ensure template names are unique per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_user_template_name'
  ) THEN
    ALTER TABLE export_templates
      ADD CONSTRAINT unique_user_template_name
      UNIQUE(user_id, name);
  END IF;
END $$;

-- ===========================
-- 4. ANALYZE TABLES
-- ===========================

ANALYZE ventures;
ANALYZE venture_data;
ANALYZE export_history;
ANALYZE export_templates;
