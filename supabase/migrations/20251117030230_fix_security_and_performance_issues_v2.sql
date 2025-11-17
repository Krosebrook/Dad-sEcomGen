/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses all security and performance issues identified by Supabase:
  1. Adds missing indexes for foreign keys
  2. Optimizes RLS policies by using SELECT subqueries for auth functions
  3. Fixes function search path mutability

  ## Changes

  ### Missing Indexes
  - Add index for activity_log.user_id foreign key
  - Add index for venture_collaborators.invited_by foreign key

  ### RLS Policy Optimization
  - Replace all `auth.uid()` calls with `(select auth.uid())` in RLS policies
  - This prevents re-evaluation of auth functions for each row, improving performance at scale

  ### Function Security
  - Set search_path for update_updated_at_column function to prevent search path mutable warning

  ## Performance Impact
  - Significantly improved query performance for large datasets
  - Reduced CPU usage for RLS policy evaluation
  - Better query planning with proper indexes on foreign keys
*/

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_venture_collaborators_invited_by ON venture_collaborators(invited_by);

-- Drop existing RLS policies to recreate them with optimized auth function calls
-- Profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Ventures table policies
DROP POLICY IF EXISTS "Users can view own ventures" ON ventures;
DROP POLICY IF EXISTS "Users can insert own ventures" ON ventures;
DROP POLICY IF EXISTS "Users can update own ventures" ON ventures;
DROP POLICY IF EXISTS "Users can delete own ventures" ON ventures;

-- Venture_data table policies
DROP POLICY IF EXISTS "Users can view venture data" ON venture_data;
DROP POLICY IF EXISTS "Owners and editors can insert venture data" ON venture_data;
DROP POLICY IF EXISTS "Owners and editors can update venture data" ON venture_data;
DROP POLICY IF EXISTS "Owners can delete venture data" ON venture_data;

-- Venture_collaborators table policies
DROP POLICY IF EXISTS "Users can view collaborators for their ventures" ON venture_collaborators;
DROP POLICY IF EXISTS "Venture owners can manage collaborators" ON venture_collaborators;
DROP POLICY IF EXISTS "Venture owners can update collaborators" ON venture_collaborators;
DROP POLICY IF EXISTS "Venture owners can remove collaborators" ON venture_collaborators;

-- Activity_log table policies
DROP POLICY IF EXISTS "Users can view activity for their ventures" ON activity_log;

-- Recreate optimized RLS policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Recreate optimized RLS policies for ventures table
CREATE POLICY "Users can view own ventures"
  ON ventures FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM venture_collaborators
      WHERE venture_collaborators.venture_id = ventures.id
      AND venture_collaborators.user_id = (select auth.uid())
      AND venture_collaborators.accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can insert own ventures"
  ON ventures FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own ventures"
  ON ventures FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own ventures"
  ON ventures FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Recreate optimized RLS policies for venture_data table
CREATE POLICY "Users can view venture data"
  ON venture_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_data.venture_id
      AND (
        ventures.user_id = (select auth.uid()) OR
        EXISTS (
          SELECT 1 FROM venture_collaborators
          WHERE venture_collaborators.venture_id = ventures.id
          AND venture_collaborators.user_id = (select auth.uid())
          AND venture_collaborators.accepted_at IS NOT NULL
        )
      )
    )
  );

CREATE POLICY "Owners and editors can insert venture data"
  ON venture_data FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_data.venture_id
      AND (
        ventures.user_id = (select auth.uid()) OR
        EXISTS (
          SELECT 1 FROM venture_collaborators
          WHERE venture_collaborators.venture_id = ventures.id
          AND venture_collaborators.user_id = (select auth.uid())
          AND venture_collaborators.role IN ('owner', 'editor')
          AND venture_collaborators.accepted_at IS NOT NULL
        )
      )
    )
  );

CREATE POLICY "Owners and editors can update venture data"
  ON venture_data FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_data.venture_id
      AND (
        ventures.user_id = (select auth.uid()) OR
        EXISTS (
          SELECT 1 FROM venture_collaborators
          WHERE venture_collaborators.venture_id = ventures.id
          AND venture_collaborators.user_id = (select auth.uid())
          AND venture_collaborators.role IN ('owner', 'editor')
          AND venture_collaborators.accepted_at IS NOT NULL
        )
      )
    )
  );

CREATE POLICY "Owners can delete venture data"
  ON venture_data FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_data.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

-- Recreate optimized RLS policies for venture_collaborators table
CREATE POLICY "Users can view collaborators for their ventures"
  ON venture_collaborators FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_collaborators.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Venture owners can manage collaborators"
  ON venture_collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_collaborators.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Venture owners can update collaborators"
  ON venture_collaborators FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_collaborators.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Venture owners can remove collaborators"
  ON venture_collaborators FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_collaborators.venture_id
      AND ventures.user_id = (select auth.uid())
    )
  );

-- Recreate optimized RLS policies for activity_log table
CREATE POLICY "Users can view activity for their ventures"
  ON activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = activity_log.venture_id
      AND (
        ventures.user_id = (select auth.uid()) OR
        EXISTS (
          SELECT 1 FROM venture_collaborators
          WHERE venture_collaborators.venture_id = ventures.id
          AND venture_collaborators.user_id = (select auth.uid())
          AND venture_collaborators.accepted_at IS NOT NULL
        )
      )
    )
  );

-- Fix function search path mutability
-- Drop function and its dependent triggers with CASCADE
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate function with secure search_path
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

-- Recreate triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventures_updated_at
  BEFORE UPDATE ON ventures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venture_data_updated_at
  BEFORE UPDATE ON venture_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
