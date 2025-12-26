/*
  # Add Collaboration and Workflow Automation Features

  1. New Tables
    - `venture_shares`
      - `id` (uuid, primary key)
      - `venture_id` (uuid, references ventures)
      - `owner_id` (uuid, references auth.users)
      - `shared_with_email` (text)
      - `permission_level` (text: 'view' or 'edit')
      - `created_at` (timestamptz)
      - `accepted_at` (timestamptz, nullable)
      
    - `venture_comments`
      - `id` (uuid, primary key)
      - `venture_id` (uuid, references ventures)
      - `user_id` (uuid, references auth.users)
      - `comment_text` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `workflow_automations`
      - `id` (uuid, primary key)
      - `venture_id` (uuid, references ventures)
      - `user_id` (uuid, references auth.users)
      - `trigger_type` (text: 'step_complete', 'data_change', 'scheduled')
      - `action_type` (text: 'email', 'notification', 'export')
      - `config` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own shares
    - Add policies for shared access based on venture_shares
    - Add policies for comments based on venture access
    - Add policies for workflow automations based on venture ownership

  3. Indexes
    - Add indexes for foreign keys and frequently queried columns
    - Add composite indexes for performance
*/

-- Create venture_shares table
CREATE TABLE IF NOT EXISTS venture_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email text NOT NULL,
  permission_level text NOT NULL CHECK (permission_level IN ('view', 'edit')),
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(venture_id, shared_with_email)
);

CREATE INDEX IF NOT EXISTS idx_venture_shares_venture_id ON venture_shares(venture_id);
CREATE INDEX IF NOT EXISTS idx_venture_shares_owner_id ON venture_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_venture_shares_shared_with ON venture_shares(shared_with_email);

ALTER TABLE venture_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares they own"
  ON venture_shares FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view shares for their email"
  ON venture_shares FOR SELECT
  TO authenticated
  USING (
    shared_with_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create shares for their ventures"
  ON venture_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_shares.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own shares"
  ON venture_shares FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own shares"
  ON venture_shares FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create venture_comments table
CREATE TABLE IF NOT EXISTS venture_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venture_comments_venture_id ON venture_comments(venture_id);
CREATE INDEX IF NOT EXISTS idx_venture_comments_user_id ON venture_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_venture_comments_created_at ON venture_comments(created_at DESC);

ALTER TABLE venture_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on ventures they own"
  ON venture_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = venture_comments.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view comments on ventures shared with them"
  ON venture_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM venture_shares
      WHERE venture_shares.venture_id = venture_comments.venture_id
      AND venture_shares.shared_with_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create comments on ventures they can access"
  ON venture_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    (
      EXISTS (
        SELECT 1 FROM ventures
        WHERE ventures.id = venture_comments.venture_id
        AND ventures.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM venture_shares
        WHERE venture_shares.venture_id = venture_comments.venture_id
        AND venture_shares.shared_with_email = (
          SELECT email FROM auth.users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON venture_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON venture_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create workflow_automations table
CREATE TABLE IF NOT EXISTS workflow_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type text NOT NULL CHECK (trigger_type IN ('step_complete', 'data_change', 'scheduled')),
  action_type text NOT NULL CHECK (action_type IN ('email', 'notification', 'export')),
  config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workflow_automations_venture_id ON workflow_automations(venture_id);
CREATE INDEX IF NOT EXISTS idx_workflow_automations_user_id ON workflow_automations(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_automations_is_active ON workflow_automations(is_active) WHERE is_active = true;

ALTER TABLE workflow_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflow automations"
  ON workflow_automations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create workflow automations for their ventures"
  ON workflow_automations FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM ventures
      WHERE ventures.id = workflow_automations.venture_id
      AND ventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own workflow automations"
  ON workflow_automations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow automations"
  ON workflow_automations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
