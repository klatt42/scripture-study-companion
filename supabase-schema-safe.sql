-- PastorAid Genesis - Safe Database Schema (DROP & RECREATE)
-- Run this in Supabase SQL Editor to fix existing tables

-- ============================================================================
-- CLEAN UP EXISTING TABLES (if any)
-- ============================================================================

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS community_comments CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS user_hymns CASCADE;
DROP TABLE IF EXISTS hymns CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS research_notes CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS sermon_ideas CASCADE;
DROP TABLE IF EXISTS sermons CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions and triggers if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_user_settings() CASCADE;

-- ============================================================================
-- CREATE EXTENSIONS
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- PROFILES & SETTINGS
-- ============================================================================

-- Extended user profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  church_affiliation TEXT,
  denomination TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  bible_version TEXT DEFAULT 'NIV' CHECK (bible_version IN ('NIV', 'ESV', 'KJV', 'NRSV')),
  email_notifications BOOLEAN DEFAULT true,
  calendar_reminders BOOLEAN DEFAULT true,
  community_notifications BOOLEAN DEFAULT true,
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SERMONS
-- ============================================================================

-- Sermons table
CREATE TABLE sermons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  scripture_reference TEXT,
  content JSONB NOT NULL,
  target_length TEXT CHECK (target_length IN ('15min', '30min', '45min', '60min')),
  audience_type TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sermon ideas
CREATE TABLE sermon_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scripture_passages TEXT[],
  season TEXT,
  category TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTES & RESEARCH
-- ============================================================================

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research notes
CREATE TABLE research_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  question TEXT,
  content JSONB NOT NULL,
  sources TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CALENDAR
-- ============================================================================

-- Calendar events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  event_type TEXT NOT NULL CHECK (event_type IN ('service', 'meeting', 'event', 'holiday', 'study')),
  location TEXT,
  recurrence_rule TEXT,
  reminder_minutes INTEGER DEFAULT 1440,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HYMNS
-- ============================================================================

-- Hymns database (pre-populated)
CREATE TABLE hymns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('traditional', 'contemporary', 'gospel', 'worship')),
  source_hymnal TEXT,
  seasons TEXT[],
  themes TEXT[],
  lyrics TEXT NOT NULL,
  sheet_music_url TEXT,
  copyright_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User favorite hymns
CREATE TABLE user_hymns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hymn_id UUID REFERENCES hymns(id) ON DELETE CASCADE,
  playlist_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hymn_id)
);

-- ============================================================================
-- COMMUNITY
-- ============================================================================

-- Community posts
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sermon-help', 'pastoral-care', 'administration', 'theology', 'resources', 'prayer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community comments
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_church ON profiles(church_affiliation);

-- Sermons
CREATE INDEX idx_sermons_user_id ON sermons(user_id);
CREATE INDEX idx_sermons_status ON sermons(status);
CREATE INDEX idx_sermons_created_at ON sermons(created_at DESC);
CREATE INDEX idx_sermons_theme_trgm ON sermons USING gin(theme gin_trgm_ops);

-- Sermon Ideas
CREATE INDEX idx_sermon_ideas_user_id ON sermon_ideas(user_id);
CREATE INDEX idx_sermon_ideas_season ON sermon_ideas(season);
CREATE INDEX idx_sermon_ideas_category ON sermon_ideas(category);
CREATE INDEX idx_sermon_ideas_favorite ON sermon_ideas(user_id, is_favorite);

-- Notes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_tags ON notes USING gin(tags);
CREATE INDEX idx_notes_content_trgm ON notes USING gin(content gin_trgm_ops);

-- Calendar
CREATE INDEX idx_calendar_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_event_type ON calendar_events(event_type);

-- Hymns
CREATE INDEX idx_hymns_title_trgm ON hymns USING gin(title gin_trgm_ops);
CREATE INDEX idx_hymns_seasons ON hymns USING gin(seasons);
CREATE INDEX idx_hymns_themes ON hymns USING gin(themes);
CREATE INDEX idx_hymns_type ON hymns(type);

-- Community
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX idx_community_comments_user_id ON community_comments(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hymns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hymns ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- User Settings: Users can manage their own settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Sermons: Users can only access their own sermons
CREATE POLICY "Users can view own sermons"
  ON sermons FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sermons"
  ON sermons FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sermons"
  ON sermons FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sermons"
  ON sermons FOR DELETE
  USING (user_id = auth.uid());

-- Sermon Ideas: Users can only access their own ideas
CREATE POLICY "Users can view own sermon ideas"
  ON sermon_ideas FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sermon ideas"
  ON sermon_ideas FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sermon ideas"
  ON sermon_ideas FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sermon ideas"
  ON sermon_ideas FOR DELETE
  USING (user_id = auth.uid());

-- Notes: Users can only access their own notes
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own notes"
  ON notes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (user_id = auth.uid());

-- Research Notes: Users can only access their own research
CREATE POLICY "Users can view own research"
  ON research_notes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own research"
  ON research_notes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own research"
  ON research_notes FOR DELETE
  USING (user_id = auth.uid());

-- Calendar Events: Users can only access their own events
CREATE POLICY "Users can view own events"
  ON calendar_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own events"
  ON calendar_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own events"
  ON calendar_events FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own events"
  ON calendar_events FOR DELETE
  USING (user_id = auth.uid());

-- Hymns: Everyone can read, only admins can write (public data)
CREATE POLICY "Anyone can view hymns"
  ON hymns FOR SELECT
  TO authenticated
  USING (true);

-- User Hymns: Users can manage their own favorites
CREATE POLICY "Users can view own favorites"
  ON user_hymns FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own favorites"
  ON user_hymns FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own favorites"
  ON user_hymns FOR DELETE
  USING (user_id = auth.uid());

-- Community Posts: Anyone can read, users can manage their own
CREATE POLICY "Anyone can view posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
  USING (user_id = auth.uid());

-- Community Comments: Anyone can read, users can manage their own
CREATE POLICY "Anyone can view comments"
  ON community_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON community_comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON community_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON community_comments FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sermons_updated_at BEFORE UPDATE ON sermons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON community_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user settings on profile creation
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_settings_on_profile_insert
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_user_settings();

-- ============================================================================
-- SAMPLE DATA (Hymns)
-- ============================================================================

-- Insert some sample hymns
INSERT INTO hymns (title, type, source_hymnal, seasons, themes, lyrics, copyright_info) VALUES
('Amazing Grace', 'traditional', 'Baptist Hymnal', ARRAY['general'], ARRAY['grace', 'redemption'],
 E'Amazing grace, how sweet the sound\nThat saved a wretch like me\nI once was lost, but now am found\nWas blind, but now I see',
 'Public Domain'),

('How Great Thou Art', 'traditional', 'Lutheran Service Book', ARRAY['general'], ARRAY['worship', 'praise'],
 E'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made\nI see the stars, I hear the rolling thunder\nThy power throughout the universe displayed',
 'Public Domain'),

('Come Thou Fount', 'traditional', 'Methodist Hymnal', ARRAY['general'], ARRAY['grace', 'thanksgiving'],
 E'Come Thou Fount of every blessing\nTune my heart to sing Thy grace\nStreams of mercy, never ceasing\nCall for songs of loudest praise',
 'Public Domain'),

('O Come, O Come, Emmanuel', 'traditional', 'Advent Hymnal', ARRAY['advent'], ARRAY['hope', 'waiting'],
 E'O come, O come, Emmanuel\nAnd ransom captive Israel\nThat mourns in lonely exile here\nUntil the Son of God appear',
 'Public Domain'),

('Christ the Lord Is Risen Today', 'traditional', 'Easter Hymnal', ARRAY['easter'], ARRAY['resurrection', 'victory'],
 E'Christ the Lord is risen today, Alleluia!\nEarth and heaven in chorus say, Alleluia!\nRaise your joys and triumphs high, Alleluia!\nSing, ye heavens, and earth reply, Alleluia!',
 'Public Domain');

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- Schema recreation complete!
-- All existing tables have been dropped and recreated fresh
-- Sample hymns have been inserted
