/*
  # Fix Security and Performance Issues (v2)

  ## Overview
  Comprehensive fix for all identified security and performance issues including:
  - Missing indexes on foreign keys
  - RLS policy performance optimization
  - Unused index cleanup
  - Function search path security

  ## Changes

  ### 1. Add Missing Foreign Key Indexes
  - activity_log.user_id
  - feature_analytics.venture_id
  - venture_collaborators.invited_by
  - venture_collaborators.user_id

  ### 2. Optimize RLS Policies
  Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row

  ### 3. Remove Unused Indexes
  Drop indexes that are not being used to reduce maintenance overhead

  ### 4. Fix Function Security
  Set explicit search_path on functions to prevent search path hijacking attacks

  ## Security Impact
  - Improved query performance (foreign key indexes)
  - Better RLS policy performance at scale
  - Protection against search path attacks
  - Reduced index maintenance overhead
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- Index for activity_log.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id 
  ON activity_log(user_id);

-- Index for feature_analytics.venture_id foreign key
CREATE INDEX IF NOT EXISTS idx_feature_analytics_venture_id 
  ON feature_analytics(venture_id);

-- Index for venture_collaborators foreign keys (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'venture_collaborators'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_venture_collaborators_invited_by 
      ON venture_collaborators(invited_by);
    
    CREATE INDEX IF NOT EXISTS idx_venture_collaborators_user_id 
      ON venture_collaborators(user_id);
  END IF;
END $$;

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - USER_PREFERENCES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 3. OPTIMIZE RLS POLICIES - EXPORT_HISTORY
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own export history" ON export_history;
DROP POLICY IF EXISTS "Users can create export requests" ON export_history;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can read own export history"
  ON export_history FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create export requests"
  ON export_history FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 4. OPTIMIZE RLS POLICIES - FEATURE_ANALYTICS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own analytics" ON feature_analytics;
DROP POLICY IF EXISTS "Users can insert analytics events" ON feature_analytics;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can read own analytics"
  ON feature_analytics FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert analytics events"
  ON feature_analytics FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 5. OPTIMIZE RLS POLICIES - VENTURE_SNAPSHOTS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own venture snapshots" ON venture_snapshots;
DROP POLICY IF EXISTS "Users can create venture snapshots" ON venture_snapshots;
DROP POLICY IF EXISTS "Users can update own venture snapshots" ON venture_snapshots;
DROP POLICY IF EXISTS "Users can delete own venture snapshots" ON venture_snapshots;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can read own venture snapshots"
  ON venture_snapshots FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create venture snapshots"
  ON venture_snapshots FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own venture snapshots"
  ON venture_snapshots FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own venture snapshots"
  ON venture_snapshots FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 6. REMOVE UNUSED INDEXES
-- ============================================================================

-- Drop unused indexes to reduce maintenance overhead
DROP INDEX IF EXISTS idx_ventures_user_archived_updated;
DROP INDEX IF EXISTS idx_venture_data_venture_type_version;
DROP INDEX IF EXISTS idx_activity_log_venture_created_desc;
DROP INDEX IF EXISTS idx_user_preferences_user_id;
DROP INDEX IF EXISTS idx_export_history_user_id;
DROP INDEX IF EXISTS idx_export_history_venture_id;
DROP INDEX IF EXISTS idx_export_history_status;
DROP INDEX IF EXISTS idx_feature_analytics_user_id;
DROP INDEX IF EXISTS idx_feature_analytics_event_type;
DROP INDEX IF EXISTS idx_venture_snapshots_venture_id;
DROP INDEX IF EXISTS idx_venture_snapshots_favorites;

-- ============================================================================
-- 7. FIX FUNCTION SECURITY - SEARCH PATH
-- ============================================================================

-- Drop trigger first, then function, then recreate both with security fix

-- Drop trigger
DROP TRIGGER IF EXISTS set_user_preferences_updated_at ON user_preferences;

-- Drop and recreate function with explicit search_path
DROP FUNCTION IF EXISTS update_user_preferences_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Fix cleanup_expired_exports function
DROP FUNCTION IF EXISTS cleanup_expired_exports() CASCADE;

CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM export_history
  WHERE expires_at < now()
  AND status = 'completed';
END;
$$;

-- ============================================================================
-- 8. ADD OPTIMIZED INDEXES FOR ACTUAL USAGE PATTERNS
-- ============================================================================

-- Create composite indexes based on actual query patterns

-- For user_preferences - lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_preferences_lookup
  ON user_preferences(user_id) 
  WHERE user_id IS NOT NULL;

-- For export_history - user's recent exports
CREATE INDEX IF NOT EXISTS idx_export_history_user_recent
  ON export_history(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- For export_history - pending/processing exports
CREATE INDEX IF NOT EXISTS idx_export_history_pending
  ON export_history(status, created_at)
  WHERE status IN ('pending', 'processing');

-- For feature_analytics - user's recent activity
CREATE INDEX IF NOT EXISTS idx_feature_analytics_user_recent
  ON feature_analytics(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- For feature_analytics - event analysis
CREATE INDEX IF NOT EXISTS idx_feature_analytics_events
  ON feature_analytics(event_type, event_category, created_at DESC);

-- For venture_snapshots - user's snapshots for a venture
CREATE INDEX IF NOT EXISTS idx_venture_snapshots_user_venture
  ON venture_snapshots(user_id, venture_id, created_at DESC);

-- For venture_snapshots - favorite snapshots
CREATE INDEX IF NOT EXISTS idx_venture_snapshots_user_favorites
  ON venture_snapshots(user_id, created_at DESC)
  WHERE is_favorite = true;

-- ============================================================================
-- 9. ANALYZE TABLES FOR QUERY OPTIMIZER
-- ============================================================================

-- Update statistics for query planner
ANALYZE user_preferences;
ANALYZE export_history;
ANALYZE feature_analytics;
ANALYZE venture_snapshots;
ANALYZE activity_log;

-- ============================================================================
-- 10. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_activity_log_user_id IS 
  'Foreign key index for activity_log.user_id - improves join performance';

COMMENT ON INDEX idx_feature_analytics_venture_id IS 
  'Foreign key index for feature_analytics.venture_id - improves join performance';

COMMENT ON INDEX idx_user_preferences_lookup IS 
  'Optimized for user preference lookups - filtered for non-null user_id';

COMMENT ON INDEX idx_export_history_user_recent IS 
  'Composite index for user export history queries sorted by date';

COMMENT ON INDEX idx_export_history_pending IS 
  'Partial index for finding pending/processing exports efficiently';

COMMENT ON INDEX idx_feature_analytics_user_recent IS 
  'Composite index for user analytics queries sorted by date';

COMMENT ON INDEX idx_feature_analytics_events IS 
  'Composite index for event analysis queries';

COMMENT ON INDEX idx_venture_snapshots_user_venture IS 
  'Composite index for fetching user snapshots for specific ventures';

COMMENT ON INDEX idx_venture_snapshots_user_favorites IS 
  'Partial index for fetching only favorite snapshots';

COMMENT ON FUNCTION update_user_preferences_updated_at() IS 
  'Trigger function to auto-update updated_at timestamp - secured with explicit search_path';

COMMENT ON FUNCTION cleanup_expired_exports() IS 
  'Cleanup function for expired export records - secured with explicit search_path';
