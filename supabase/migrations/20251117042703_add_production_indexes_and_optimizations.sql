/*
  # Production Database Optimizations

  ## Indexes Added
  1. **ventures table**
     - Index on (user_id, updated_at DESC) for efficient user venture listing
     - Index on (user_id, is_archived) for filtering archived ventures
     - Index on created_at for temporal queries
  
  2. **venture_data table**
     - Index on (venture_id, data_type) for fast data type lookups
     - Index on updated_at for recent data queries
  
  3. **activity_log table**
     - Index on (venture_id, created_at DESC) for activity timeline
     - Index on user_id for user activity tracking
  
  4. **venture_collaborators table**
     - Index on (venture_id, role) for role-based queries
     - Index on user_id for user collaboration lookups

  ## Performance Improvements
  - Added composite indexes for common query patterns
  - Optimized for read-heavy workloads
  - Improved query performance for dashboard and listing views
*/

-- Ventures table indexes
CREATE INDEX IF NOT EXISTS idx_ventures_user_updated 
  ON ventures(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ventures_user_archived 
  ON ventures(user_id, is_archived) 
  WHERE is_archived = false;

CREATE INDEX IF NOT EXISTS idx_ventures_created 
  ON ventures(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ventures_last_accessed 
  ON ventures(last_accessed_at DESC);

-- Venture data table indexes
CREATE INDEX IF NOT EXISTS idx_venture_data_venture_type 
  ON venture_data(venture_id, data_type);

CREATE INDEX IF NOT EXISTS idx_venture_data_updated 
  ON venture_data(updated_at DESC);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_venture_created 
  ON activity_log(venture_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_log_user 
  ON activity_log(user_id, created_at DESC) 
  WHERE user_id IS NOT NULL;

-- Venture collaborators indexes
CREATE INDEX IF NOT EXISTS idx_collaborators_venture_role 
  ON venture_collaborators(venture_id, role);

CREATE INDEX IF NOT EXISTS idx_collaborators_user 
  ON venture_collaborators(user_id);

-- Profiles table index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON profiles(email);

-- Add function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_ventures_updated_at ON ventures;
CREATE TRIGGER update_ventures_updated_at
  BEFORE UPDATE ON ventures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_venture_data_updated_at ON venture_data;
CREATE TRIGGER update_venture_data_updated_at
  BEFORE UPDATE ON venture_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
