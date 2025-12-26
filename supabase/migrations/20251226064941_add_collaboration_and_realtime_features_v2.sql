/*
  # Add Collaboration and Real-time Features

  ## New Tables
  
  1. `comments`
    - Stores threaded comments on venture sections
    - Supports replies and mentions
    - Tracks edited/deleted state
    
  2. `notifications`
    - User notification system
    - Supports multiple notification types
    - Read/unread tracking
    
  3. `presence`
    - Real-time user presence tracking
    - Shows who's viewing what
    - Auto-cleanup for stale sessions
    
  4. `venture_versions`
    - Snapshot-based version control
    - Stores full state at checkpoint
    - Supports restore and diff operations

  ## Enhanced Tables
  
  - `venture_collaborators`: Add status and invitation fields
  - `activity_log`: Enhanced for notifications
  
  ## Security
  
  - RLS enabled on all tables
  - Strict permission checks
  - Collaborator-based access
*/

-- Add status column to venture_collaborators
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venture_collaborators' AND column_name = 'status'
  ) THEN
    ALTER TABLE venture_collaborators ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected'));
    UPDATE venture_collaborators SET status = 'accepted' WHERE accepted_at IS NOT NULL;
  END IF;
END $$;

-- Add invitation fields to venture_collaborators
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venture_collaborators' AND column_name = 'invited_email'
  ) THEN
    ALTER TABLE venture_collaborators ADD COLUMN invited_email text;
    ALTER TABLE venture_collaborators ADD COLUMN invitation_token text;
    ALTER TABLE venture_collaborators ADD COLUMN expires_at timestamptz;
    
    CREATE INDEX IF NOT EXISTS idx_collaborators_token ON venture_collaborators(invitation_token) WHERE invitation_token IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_collaborators_email ON venture_collaborators(invited_email) WHERE invited_email IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_collaborators_status ON venture_collaborators(status);
  END IF;
END $$;

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  section_id text,
  content text NOT NULL,
  mentions uuid[] DEFAULT '{}',
  is_edited boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_venture ON comments(venture_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_section ON comments(venture_id, section_type, section_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on accessible ventures"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures v
      WHERE v.id = comments.venture_id
      AND (v.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM venture_collaborators vc
        WHERE vc.venture_id = v.id
        AND vc.user_id = auth.uid()
        AND vc.status = 'accepted'
      ))
    )
  );

CREATE POLICY "Collaborators can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM ventures v
      WHERE v.id = venture_id
      AND (v.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM venture_collaborators vc
        WHERE vc.venture_id = v.id
        AND vc.user_id = auth.uid()
        AND vc.status = 'accepted'
        AND vc.role IN ('owner', 'editor')
      ))
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_id uuid REFERENCES ventures(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_venture ON notifications(venture_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Presence table
CREATE TABLE IF NOT EXISTS presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  cursor_position jsonb,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, venture_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_presence_venture ON presence(venture_id);
CREATE INDEX IF NOT EXISTS idx_presence_last_seen ON presence(last_seen);

ALTER TABLE presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view presence on accessible ventures"
  ON presence FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures v
      WHERE v.id = presence.venture_id
      AND (v.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM venture_collaborators vc
        WHERE vc.venture_id = v.id
        AND vc.user_id = auth.uid()
        AND vc.status = 'accepted'
      ))
    )
  );

CREATE POLICY "Users can manage own presence"
  ON presence FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Venture versions table
CREATE TABLE IF NOT EXISTS venture_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  label text,
  snapshot jsonb NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(venture_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_versions_venture ON venture_versions(venture_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_versions_created ON venture_versions(created_at DESC);

ALTER TABLE venture_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of accessible ventures"
  ON venture_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventures v
      WHERE v.id = venture_versions.venture_id
      AND (v.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM venture_collaborators vc
        WHERE vc.venture_id = v.id
        AND vc.user_id = auth.uid()
        AND vc.status = 'accepted'
      ))
    )
  );

CREATE POLICY "Collaborators can create versions"
  ON venture_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM ventures v
      WHERE v.id = venture_id
      AND (v.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM venture_collaborators vc
        WHERE vc.venture_id = v.id
        AND vc.user_id = auth.uid()
        AND vc.status = 'accepted'
        AND vc.role IN ('owner', 'editor')
      ))
    )
  );

-- Function to clean up stale presence records
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS void AS $$
BEGIN
  DELETE FROM presence
  WHERE last_seen < now() - interval '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_venture_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, venture_id, type, title, message, data)
  VALUES (p_user_id, p_venture_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify collaborators on activity
CREATE OR REPLACE FUNCTION notify_collaborators()
RETURNS trigger AS $$
DECLARE
  v_collaborator RECORD;
  v_action_user_email text;
BEGIN
  SELECT email INTO v_action_user_email
  FROM auth.users
  WHERE id = NEW.user_id;

  FOR v_collaborator IN
    SELECT vc.user_id
    FROM venture_collaborators vc
    WHERE vc.venture_id = NEW.venture_id
    AND vc.status = 'accepted'
    AND vc.user_id != NEW.user_id
  LOOP
    PERFORM create_notification(
      v_collaborator.user_id,
      NEW.venture_id,
      'activity',
      'Venture Updated',
      v_action_user_email || ' made changes to the venture',
      jsonb_build_object('action', NEW.action, 'user_email', v_action_user_email)
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for activity notifications
DROP TRIGGER IF EXISTS notify_on_activity ON activity_log;
CREATE TRIGGER notify_on_activity
  AFTER INSERT ON activity_log
  FOR EACH ROW
  EXECUTE FUNCTION notify_collaborators();

-- Update timestamps trigger for comments
CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  IF OLD.content != NEW.content THEN
    NEW.is_edited = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comment_timestamp ON comments;
CREATE TRIGGER update_comment_timestamp
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_timestamp();
