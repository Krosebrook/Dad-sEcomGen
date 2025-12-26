/*
  # Phase 4: Onboarding System and Template Marketplace

  ## New Tables
  
  ### 1. Onboarding System
    - `user_onboarding_progress`
      - Tracks user progress through onboarding steps
      - Links to auth.users
      - Stores completion status and timestamps
    
    - `feature_tours`
      - Tracks which feature tours users have seen
      - Supports dismissal and completion tracking
      - Links to auth.users

  ### 2. Template Marketplace
    - `venture_templates`
      - Stores venture templates created by users
      - Supports categorization, pricing, and ratings
      - Includes publish status and download tracking
    
    - `template_categories`
      - Defines template categories with icons
      - Supports sorting and organization
    
    - `template_ratings`
      - User ratings and reviews for templates
      - 1-5 star ratings with optional review text
    
    - `template_purchases`
      - Tracks template downloads/purchases
      - Records price paid and purchase timestamp

  ## Security
    - All tables have RLS enabled
    - Users can manage their own onboarding progress
    - Template creators control their templates
    - All users can view published templates
    - Rating and purchase data is protected

  ## Indexes
    - Full-text search on templates
    - Optimized for common query patterns
    - Performance indexes for filtering and sorting
*/

-- Create onboarding progress table
CREATE TABLE IF NOT EXISTS user_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_id text NOT NULL,
  completed boolean DEFAULT false,
  skipped boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, step_id)
);

-- Create feature tours table
CREATE TABLE IF NOT EXISTS feature_tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_name text NOT NULL,
  tour_completed boolean DEFAULT false,
  last_seen_at timestamptz DEFAULT now(),
  dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature_name)
);

-- Create template categories table
CREATE TABLE IF NOT EXISTS template_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create venture templates table
CREATE TABLE IF NOT EXISTS venture_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  template_data jsonb NOT NULL DEFAULT '{}',
  preview_image_url text DEFAULT '',
  price numeric DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  downloads_count integer DEFAULT 0,
  rating_average numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create template ratings table
CREATE TABLE IF NOT EXISTS template_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES venture_templates(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(template_id, user_id)
);

-- Create template purchases table
CREATE TABLE IF NOT EXISTS template_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES venture_templates(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  price_paid numeric DEFAULT 0,
  purchased_at timestamptz DEFAULT now(),
  UNIQUE(template_id, user_id)
);

-- Enable RLS
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE venture_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_purchases ENABLE ROW LEVEL SECURITY;

-- Onboarding progress policies
DROP POLICY IF EXISTS "Users can view own onboarding progress" ON user_onboarding_progress;
CREATE POLICY "Users can view own onboarding progress"
  ON user_onboarding_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own onboarding progress" ON user_onboarding_progress;
CREATE POLICY "Users can insert own onboarding progress"
  ON user_onboarding_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own onboarding progress" ON user_onboarding_progress;
CREATE POLICY "Users can update own onboarding progress"
  ON user_onboarding_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Feature tours policies
DROP POLICY IF EXISTS "Users can view own feature tours" ON feature_tours;
CREATE POLICY "Users can view own feature tours"
  ON feature_tours FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own feature tours" ON feature_tours;
CREATE POLICY "Users can insert own feature tours"
  ON feature_tours FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own feature tours" ON feature_tours;
CREATE POLICY "Users can update own feature tours"
  ON feature_tours FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Template categories policies (read-only for all authenticated users)
DROP POLICY IF EXISTS "All users can view template categories" ON template_categories;
CREATE POLICY "All users can view template categories"
  ON template_categories FOR SELECT
  TO authenticated
  USING (true);

-- Venture templates policies
DROP POLICY IF EXISTS "All users can view published templates" ON venture_templates;
CREATE POLICY "All users can view published templates"
  ON venture_templates FOR SELECT
  TO authenticated
  USING (is_published = true OR creator_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own templates" ON venture_templates;
CREATE POLICY "Users can insert own templates"
  ON venture_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can update own templates" ON venture_templates;
CREATE POLICY "Creators can update own templates"
  ON venture_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can delete own templates" ON venture_templates;
CREATE POLICY "Creators can delete own templates"
  ON venture_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Template ratings policies
DROP POLICY IF EXISTS "All users can view template ratings" ON template_ratings;
CREATE POLICY "All users can view template ratings"
  ON template_ratings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own ratings" ON template_ratings;
CREATE POLICY "Users can insert own ratings"
  ON template_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ratings" ON template_ratings;
CREATE POLICY "Users can update own ratings"
  ON template_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own ratings" ON template_ratings;
CREATE POLICY "Users can delete own ratings"
  ON template_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Template purchases policies
DROP POLICY IF EXISTS "Users can view own purchases" ON template_purchases;
CREATE POLICY "Users can view own purchases"
  ON template_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own purchases" ON template_purchases;
CREATE POLICY "Users can insert own purchases"
  ON template_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON user_onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_step_id ON user_onboarding_progress(step_id);
CREATE INDEX IF NOT EXISTS idx_feature_tours_user_id ON feature_tours(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_creator_id ON venture_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON venture_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_published ON venture_templates(is_published);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON venture_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_template_ratings_template_id ON template_ratings(template_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_user_id ON template_purchases(user_id);

-- Add full-text search for templates
CREATE INDEX IF NOT EXISTS idx_templates_search ON venture_templates USING gin(to_tsvector('english', title || ' ' || description));

-- Insert default template categories
INSERT INTO template_categories (name, description, icon, sort_order) VALUES
  ('E-commerce', 'Online store and product ventures', '🛍️', 1),
  ('SaaS', 'Software as a Service products', '💻', 2),
  ('Content', 'Blogs, media, and content businesses', '📝', 3),
  ('Service', 'Service-based businesses', '🔧', 4),
  ('Dropshipping', 'Dropshipping and fulfillment ventures', '📦', 5),
  ('Digital Products', 'Digital downloads and courses', '📱', 6),
  ('General', 'General business templates', '🎯', 7)
ON CONFLICT (name) DO NOTHING;

-- Function to update template ratings
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE venture_templates
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
      FROM template_ratings
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM template_ratings
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    )
  WHERE id = COALESCE(NEW.template_id, OLD.template_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
DROP TRIGGER IF EXISTS trigger_update_template_rating ON template_ratings;
CREATE TRIGGER trigger_update_template_rating
  AFTER INSERT OR UPDATE OR DELETE ON template_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_template_rating();

-- Function to increment downloads count
CREATE OR REPLACE FUNCTION increment_template_downloads()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE venture_templates
  SET downloads_count = downloads_count + 1
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for download tracking
DROP TRIGGER IF EXISTS trigger_increment_downloads ON template_purchases;
CREATE TRIGGER trigger_increment_downloads
  AFTER INSERT ON template_purchases
  FOR EACH ROW
  EXECUTE FUNCTION increment_template_downloads();