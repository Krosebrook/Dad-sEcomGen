/*
  # Fix Security Issues and Optimize Indexes (v2)

  ## Changes Made
  1. **Remove Duplicate and Unused Indexes**
     - Remove indexes not matching actual query patterns
     - Keep only essential indexes for application performance
  
  2. **Optimize for Real Query Patterns**
     - ventures(user_id, is_archived, updated_at DESC) for getAllVentures
     - venture_data(venture_id, data_type, version DESC) for data lookups
     - activity_log(venture_id, created_at DESC) for activity logs
  
  3. **Fix Function Security Vulnerability**
     - Fix search_path mutability on update_updated_at_column function
     - Use SECURITY DEFINER with explicit search_path

  ## Security Improvements
  - Fixed function search_path vulnerability (2BP01)
  - Reduced attack surface by removing unnecessary indexes
  - Optimized indexes for actual usage patterns
*/

-- Drop all duplicate and unused indexes
DROP INDEX IF EXISTS idx_ventures_user_updated;
DROP INDEX IF EXISTS idx_ventures_user_archived;
DROP INDEX IF EXISTS idx_ventures_created;
DROP INDEX IF EXISTS idx_ventures_last_accessed;
DROP INDEX IF EXISTS idx_venture_data_venture_type;
DROP INDEX IF EXISTS idx_venture_data_updated;
DROP INDEX IF EXISTS idx_activity_log_venture_created;
DROP INDEX IF EXISTS idx_activity_log_user;
DROP INDEX IF EXISTS idx_collaborators_venture_role;
DROP INDEX IF EXISTS idx_collaborators_user;
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_venture_data_type;
DROP INDEX IF EXISTS idx_activity_log_created_at;
DROP INDEX IF EXISTS idx_activity_log_user_id;
DROP INDEX IF EXISTS idx_venture_collaborators_invited_by;

-- Drop duplicate collaborator indexes (keep the better named one)
DROP INDEX IF EXISTS idx_collaborators_user;

-- Create composite index for getAllVentures query pattern
CREATE INDEX IF NOT EXISTS idx_ventures_user_archived_updated 
  ON ventures(user_id, is_archived, updated_at DESC);

-- Create composite index for venture data lookups
CREATE INDEX IF NOT EXISTS idx_venture_data_venture_type_version 
  ON venture_data(venture_id, data_type, version DESC);

-- Create composite index for activity log queries
CREATE INDEX IF NOT EXISTS idx_activity_log_venture_created_desc 
  ON activity_log(venture_id, created_at DESC);

-- Fix function security: Drop and recreate with secure search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
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

-- Recreate all triggers with the secure function
CREATE TRIGGER update_ventures_updated_at
  BEFORE UPDATE ON ventures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venture_data_updated_at
  BEFORE UPDATE ON venture_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON INDEX idx_ventures_user_archived_updated IS 
  'Optimized for getAllVentures: user_id + is_archived filter + updated_at DESC ordering';

COMMENT ON INDEX idx_venture_data_venture_type_version IS 
  'Optimized for getVenture/saveVentureData: venture_id + data_type + version DESC';

COMMENT ON INDEX idx_activity_log_venture_created_desc IS 
  'Optimized for getActivityLog: venture_id + created_at DESC ordering';

COMMENT ON FUNCTION update_updated_at_column() IS 
  'Secure trigger function with immutable search_path for automatic timestamp updates';
