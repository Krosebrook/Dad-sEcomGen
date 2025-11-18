/*
  # User Preferences and Enhanced Features Schema

  ## Overview
  Adds support for user preferences, avatar customization, theme settings, tutorial progress,
  export history, and analytics tracking for the production-grade MVP.

  ## New Tables

  ### user_preferences
  - Stores user UI preferences including theme variant, color mode, and animation settings
  - One-to-one relationship with auth.users
  - Includes avatar personality selection and tutorial completion status

  ### export_history
  - Tracks all storyboard, video, and asset export requests
  - Links to specific ventures for audit trail
  - Stores export type, format, and download metadata

  ### feature_analytics
  - Tracks feature usage patterns and user engagement
  - Stores event type, metadata, and session information
  - Enables data-driven product decisions

  ### venture_snapshots
  - Stores versioned snapshots of ventures for comparison
  - Enables users to compare different iterations
  - Maintains full venture state at snapshot time

  ## Security
  - All tables have RLS enabled
  - Users can only access their own data
  - Cascading deletes maintain referential integrity
*/

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme_variant text DEFAULT 'minimalist' CHECK (theme_variant IN ('minimalist', 'cinematic', 'futuristic')),
  color_mode text DEFAULT 'light' CHECK (color_mode IN ('light', 'dark')),
  animation_enabled boolean DEFAULT true,
  animation_speed text DEFAULT 'normal' CHECK (animation_speed IN ('slow', 'normal', 'fast')),
  reduced_motion boolean DEFAULT false,
  avatar_personality text DEFAULT 'friendly' CHECK (avatar_personality IN ('professional', 'friendly', 'expert')),
  tutorial_completed boolean DEFAULT false,
  tutorial_step integer DEFAULT 0,
  keyboard_shortcuts_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Export History Table
CREATE TABLE IF NOT EXISTS export_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
  export_type text NOT NULL CHECK (export_type IN ('storyboard', 'video', 'components', 'pdf', 'assets')),
  export_format text NOT NULL,
  file_size_bytes bigint,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  download_url text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own export history"
  ON export_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests"
  ON export_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Feature Analytics Table
CREATE TABLE IF NOT EXISTS feature_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_category text NOT NULL CHECK (event_category IN ('navigation', 'feature_usage', 'interaction', 'error', 'performance')),
  metadata jsonb DEFAULT '{}'::jsonb,
  session_id text,
  viewport_width integer,
  viewport_height integer,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feature_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analytics"
  ON feature_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert analytics events"
  ON feature_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Venture Snapshots Table
CREATE TABLE IF NOT EXISTS venture_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  snapshot_name text NOT NULL,
  description text,
  snapshot_data jsonb NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE venture_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own venture snapshots"
  ON venture_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create venture snapshots"
  ON venture_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own venture snapshots"
  ON venture_snapshots FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own venture snapshots"
  ON venture_snapshots FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_export_history_user_id ON export_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_history_venture_id ON export_history(venture_id);
CREATE INDEX IF NOT EXISTS idx_export_history_status ON export_history(status) WHERE status != 'completed';
CREATE INDEX IF NOT EXISTS idx_feature_analytics_user_id ON feature_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_analytics_event_type ON feature_analytics(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_venture_snapshots_venture_id ON venture_snapshots(venture_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_venture_snapshots_favorites ON venture_snapshots(user_id, is_favorite) WHERE is_favorite = true;

-- Trigger for updated_at on user_preferences
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Function to clean up expired exports
CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS void AS $$
BEGIN
  DELETE FROM export_history
  WHERE expires_at < now()
  AND status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
