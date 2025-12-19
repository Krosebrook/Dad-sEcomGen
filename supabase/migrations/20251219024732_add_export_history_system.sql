-- Export History System
--
-- Overview:
-- Complete export tracking system for PDF, component, and asset exports with analytics.
--
-- New Tables:
--   1. export_history - Tracks all exports with detailed metadata
--   2. export_templates - Reusable export templates with custom settings
--
-- Security:
--   - Enable RLS on all tables
--   - Users can only access their own export history and templates
--   - Authenticated users only
--
-- Features:
--   - Export history enables analytics and re-download capabilities
--   - Templates allow users to save preferred export configurations
--   - Supports multiple export types and formats
--   - Tracks file sizes, asset counts, and custom metadata

-- Create export_history table
CREATE TABLE IF NOT EXISTS export_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_id uuid REFERENCES ventures(id) ON DELETE SET NULL,
  export_type text NOT NULL CHECK (export_type IN ('pdf', 'components', 'assets', 'storyboard', 'full_package')),
  export_format text NOT NULL CHECK (export_format IN ('pdf', 'png', 'svg', 'zip', 'json')),
  file_size bigint DEFAULT 0,
  asset_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  download_url text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Create export_templates table
CREATE TABLE IF NOT EXISTS export_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  export_type text NOT NULL CHECK (export_type IN ('pdf', 'components', 'assets', 'storyboard', 'full_package')),
  settings jsonb DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for export_history
CREATE POLICY "Users can view own export history"
  ON export_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own export history"
  ON export_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own export history"
  ON export_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own export history"
  ON export_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for export_templates
CREATE POLICY "Users can view own export templates"
  ON export_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own export templates"
  ON export_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own export templates"
  ON export_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own export templates"
  ON export_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_export_history_user_id ON export_history(user_id);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON export_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_history_type ON export_history(export_type);
CREATE INDEX IF NOT EXISTS idx_export_history_status ON export_history(status);
CREATE INDEX IF NOT EXISTS idx_export_history_venture_id ON export_history(venture_id);

CREATE INDEX IF NOT EXISTS idx_export_templates_user_id ON export_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_export_templates_type ON export_templates(export_type);
CREATE INDEX IF NOT EXISTS idx_export_templates_default ON export_templates(user_id, is_default) WHERE is_default = true;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_export_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_export_templates_updated_at ON export_templates;
CREATE TRIGGER trigger_export_templates_updated_at
  BEFORE UPDATE ON export_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_export_templates_updated_at();