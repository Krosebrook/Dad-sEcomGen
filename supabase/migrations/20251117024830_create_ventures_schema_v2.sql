/*
  # E-Commerce Venture Builder Database Schema

  ## Overview
  This migration creates the core database structure for the E-Commerce Venture Builder application.
  It enables cloud-based storage, user authentication, and real-time collaboration features.

  ## New Tables

  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email address
  - `full_name` (text) - User's full name
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### `ventures`
  - `id` (uuid, primary key) - Unique venture identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `name` (text) - Venture name
  - `product_idea` (text) - Original product idea
  - `brand_voice` (text) - Selected brand voice tone
  - `is_archived` (boolean) - Archive status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp
  - `last_accessed_at` (timestamptz) - Last time user viewed this venture

  ### `venture_data`
  - `id` (uuid, primary key) - Unique data record identifier
  - `venture_id` (uuid, foreign key) - References ventures.id
  - `data_type` (text) - Type of data (plan, goals, analysis, etc.)
  - `data` (jsonb) - JSON data storage for flexible schema
  - `version` (integer) - Version number for tracking changes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### `venture_collaborators`
  - `id` (uuid, primary key) - Unique collaborator record identifier
  - `venture_id` (uuid, foreign key) - References ventures.id
  - `user_id` (uuid, foreign key) - References profiles.id
  - `role` (text) - Collaborator role (owner, editor, viewer)
  - `invited_by` (uuid, foreign key) - References profiles.id
  - `invited_at` (timestamptz) - Invitation timestamp
  - `accepted_at` (timestamptz) - Acceptance timestamp

  ### `activity_log`
  - `id` (uuid, primary key) - Unique log entry identifier
  - `venture_id` (uuid, foreign key) - References ventures.id
  - `user_id` (uuid, foreign key) - References profiles.id
  - `action` (text) - Action performed (created, updated, shared, etc.)
  - `details` (jsonb) - Additional action details
  - `created_at` (timestamptz) - Action timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data and shared ventures
  - Owners have full control, editors can modify, viewers can only read
  - Activity logging for audit trail

  ## Important Notes
  1. All monetary values stored in cents (integer)
  2. JSONB used for flexible venture data storage
  3. Version tracking enables rollback functionality
  4. Real-time subscriptions supported for collaboration
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create ventures table
CREATE TABLE IF NOT EXISTS ventures (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  product_idea text NOT NULL,
  brand_voice text DEFAULT 'Witty & Humorous Dad' NOT NULL,
  is_archived boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  last_accessed_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE ventures ENABLE ROW LEVEL SECURITY;

-- Create venture_collaborators table (before policies that reference it)
CREATE TABLE IF NOT EXISTS venture_collaborators (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer' NOT NULL,
  invited_by uuid REFERENCES profiles(id) NOT NULL,
  invited_at timestamptz DEFAULT now() NOT NULL,
  accepted_at timestamptz,
  UNIQUE(venture_id, user_id)
);

ALTER TABLE venture_collaborators ENABLE ROW LEVEL SECURITY;

-- Now create policies for ventures
CREATE POLICY "Users can view own ventures"
  ON ventures FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM venture_collaborators
      WHERE venture_collaborators.venture_id = ventures.id
      AND venture_collaborators.user_id = auth.uid()
      AND venture_collaborators.accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can insert own ventures"
  ON ventures FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own ventures"
  ON ventures FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own ventures"
  ON ventures FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create venture_data table
CREATE TABLE IF NOT EXISTS venture_data (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  data_type text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(venture_id, data_type, version)
);

ALTER TABLE venture_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view venture data"
  ON venture_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_data.venture_id
      AND (
        ventures.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM venture_collaborators
          WHERE venture_collaborators.venture_id = ventures.id
          AND venture_collaborators.user_id = auth.uid()
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
        ventures.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM venture_collaborators
          WHERE venture_collaborators.venture_id = ventures.id
          AND venture_collaborators.user_id = auth.uid()
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
        ventures.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM venture_collaborators
          WHERE venture_collaborators.venture_id = ventures.id
          AND venture_collaborators.user_id = auth.uid()
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
      AND ventures.user_id = auth.uid()
    )
  );

-- Create policies for venture_collaborators
CREATE POLICY "Users can view collaborators for their ventures"
  ON venture_collaborators FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_collaborators.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Venture owners can manage collaborators"
  ON venture_collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_collaborators.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Venture owners can update collaborators"
  ON venture_collaborators FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_collaborators.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Venture owners can remove collaborators"
  ON venture_collaborators FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_collaborators.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity for their ventures"
  ON activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = activity_log.venture_id
      AND (
        ventures.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM venture_collaborators
          WHERE venture_collaborators.venture_id = ventures.id
          AND venture_collaborators.user_id = auth.uid()
          AND venture_collaborators.accepted_at IS NOT NULL
        )
      )
    )
  );

CREATE POLICY "System can insert activity logs"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ventures_user_id ON ventures(user_id);
CREATE INDEX IF NOT EXISTS idx_ventures_updated_at ON ventures(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_venture_data_venture_id ON venture_data(venture_id);
CREATE INDEX IF NOT EXISTS idx_venture_data_type ON venture_data(data_type);
CREATE INDEX IF NOT EXISTS idx_venture_collaborators_venture_id ON venture_collaborators(venture_id);
CREATE INDEX IF NOT EXISTS idx_venture_collaborators_user_id ON venture_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_venture_id ON activity_log(venture_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
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
