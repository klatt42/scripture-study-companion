-- Scripture Study Companion - Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/fntcasdassvplgcabdty/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- PROFILES & SETTINGS
-- ============================================================================

-- Extended user profiles (adapted for lay users - study_group instead of church_affiliation)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  study_group TEXT,
  denomination TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  bible_version TEXT DEFAULT 'NIV' CHECK (bible_version IN ('NIV', 'ESV', 'KJV', 'NRSV', 'NASB', 'NLT')),
  email_notifications BOOLEAN DEFAULT true,
  calendar_reminders BOOLEAN DEFAULT true,
  community_notifications BOOLEAN DEFAULT true,
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STUDY GUIDES (replaces SERMONS)
-- ============================================================================

-- Study guides table (replaces sermons)
CREATE TABLE study_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  scripture_reference TEXT,
  content JSONB NOT NULL,
  study_type TEXT CHECK (study_type IN ('individual', 'small-group', 'family', 'academic')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study topics (replaces sermon_ideas)
CREATE TABLE study_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scripture_passages TEXT[],
  category TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- READING PLANS (NEW)
-- ============================================================================

-- Pre-built and custom reading plans
CREATE TABLE reading_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  category TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily readings for each plan
CREATE TABLE reading_plan_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  passages TEXT[] NOT NULL,
  reflection_prompt TEXT,
  UNIQUE(plan_id, day_number)
);

-- User progress on reading plans
CREATE TABLE user_reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE,
  current_day INTEGER DEFAULT 1,
  completed_days INTEGER[] DEFAULT '{}',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_read_date DATE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, plan_id)
);

-- ============================================================================
-- VERSE MEMORY (NEW)
-- ============================================================================

-- Verses to memorize with spaced repetition
CREATE TABLE memory_verses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  translation TEXT DEFAULT 'NIV',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
  -- SM-2 algorithm fields
  ease_factor DECIMAL(3,2) DEFAULT 2.50,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review DATE DEFAULT CURRENT_DATE,
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STUDY SESSIONS (NEW)
-- ============================================================================

-- Log individual study sessions
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL,
  passage TEXT,
  notes TEXT,
  session_type TEXT DEFAULT 'reading' CHECK (session_type IN ('reading', 'study', 'memory', 'prayer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STUDY GROUPS (NEW)
-- ============================================================================

-- Group study coordination
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  current_study TEXT,
  meeting_schedule TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group membership and roles
CREATE TABLE study_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'leader', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ============================================================================
-- NOTES & RESEARCH (kept from original)
-- ============================================================================

-- Notes table (study notes, reflections)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[],
  scripture_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research notes (theology research)
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
-- CALENDAR (kept from original)
-- ============================================================================

-- Calendar events (study sessions, group meetings)
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  event_type TEXT NOT NULL CHECK (event_type IN ('study', 'group-meeting', 'reminder', 'reading-plan')),
  location TEXT,
  recurrence_rule TEXT,
  reminder_minutes INTEGER DEFAULT 1440,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HYMNS (kept from original - useful for music leaders)
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
-- COMMUNITY (adapted for study groups)
-- ============================================================================

-- Community posts (discussion threads)
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('discussion', 'question', 'prayer', 'resource', 'testimony')),
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
CREATE INDEX idx_profiles_study_group ON profiles(study_group);

-- Study Guides
CREATE INDEX idx_study_guides_user_id ON study_guides(user_id);
CREATE INDEX idx_study_guides_status ON study_guides(status);
CREATE INDEX idx_study_guides_created_at ON study_guides(created_at DESC);

-- Study Topics
CREATE INDEX idx_study_topics_user_id ON study_topics(user_id);
CREATE INDEX idx_study_topics_category ON study_topics(category);
CREATE INDEX idx_study_topics_favorite ON study_topics(user_id, is_favorite);

-- Reading Plans
CREATE INDEX idx_reading_plans_category ON reading_plans(category);
CREATE INDEX idx_user_reading_progress_user_id ON user_reading_progress(user_id);
CREATE INDEX idx_user_reading_progress_plan_id ON user_reading_progress(plan_id);

-- Memory Verses
CREATE INDEX idx_memory_verses_user_id ON memory_verses(user_id);
CREATE INDEX idx_memory_verses_status ON memory_verses(status);
CREATE INDEX idx_memory_verses_next_review ON memory_verses(next_review);

-- Study Sessions
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_date ON study_sessions(session_date DESC);

-- Study Groups
CREATE INDEX idx_study_groups_public ON study_groups(is_public);
CREATE INDEX idx_study_group_members_user ON study_group_members(user_id);
CREATE INDEX idx_study_group_members_group ON study_group_members(group_id);

-- Notes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_tags ON notes USING gin(tags);

-- Calendar
CREATE INDEX idx_calendar_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_start_time ON calendar_events(start_time);

-- Hymns
CREATE INDEX idx_hymns_title_trgm ON hymns USING gin(title gin_trgm_ops);
CREATE INDEX idx_hymns_seasons ON hymns USING gin(seasons);
CREATE INDEX idx_hymns_themes ON hymns USING gin(themes);

-- Community
CREATE INDEX idx_community_posts_group_id ON community_posts(group_id);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_comments_post_id ON community_comments(post_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hymns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hymns ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- User Settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (user_id = auth.uid());

-- Study Guides policies
CREATE POLICY "Users can view own study guides" ON study_guides FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create study guides" ON study_guides FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own study guides" ON study_guides FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own study guides" ON study_guides FOR DELETE USING (user_id = auth.uid());

-- Study Topics policies
CREATE POLICY "Users can view own study topics" ON study_topics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create study topics" ON study_topics FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own study topics" ON study_topics FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own study topics" ON study_topics FOR DELETE USING (user_id = auth.uid());

-- Reading Plans policies (public plans visible to all, user can manage own)
CREATE POLICY "Anyone can view public plans" ON reading_plans FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own plans" ON reading_plans FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can create plans" ON reading_plans FOR INSERT WITH CHECK (created_by = auth.uid());

-- Reading Plan Days policies
CREATE POLICY "Anyone can view plan days" ON reading_plan_days FOR SELECT TO authenticated USING (true);

-- User Reading Progress policies
CREATE POLICY "Users can view own progress" ON user_reading_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create progress" ON user_reading_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own progress" ON user_reading_progress FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own progress" ON user_reading_progress FOR DELETE USING (user_id = auth.uid());

-- Memory Verses policies
CREATE POLICY "Users can view own verses" ON memory_verses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create verses" ON memory_verses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own verses" ON memory_verses FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own verses" ON memory_verses FOR DELETE USING (user_id = auth.uid());

-- Study Sessions policies
CREATE POLICY "Users can view own sessions" ON study_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create sessions" ON study_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own sessions" ON study_sessions FOR DELETE USING (user_id = auth.uid());

-- Study Groups policies
CREATE POLICY "Anyone can view public groups" ON study_groups FOR SELECT USING (is_public = true);
CREATE POLICY "Members can view private groups" ON study_groups FOR SELECT
  USING (EXISTS (SELECT 1 FROM study_group_members WHERE group_id = study_groups.id AND user_id = auth.uid()));
CREATE POLICY "Users can create groups" ON study_groups FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Admins can update groups" ON study_groups FOR UPDATE
  USING (EXISTS (SELECT 1 FROM study_group_members WHERE group_id = study_groups.id AND user_id = auth.uid() AND role = 'admin'));

-- Study Group Members policies
CREATE POLICY "Members can view group members" ON study_group_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM study_group_members sgm WHERE sgm.group_id = study_group_members.group_id AND sgm.user_id = auth.uid()));
CREATE POLICY "Users can join groups" ON study_group_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave groups" ON study_group_members FOR DELETE USING (user_id = auth.uid());

-- Notes policies
CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create notes" ON notes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (user_id = auth.uid());

-- Research Notes policies
CREATE POLICY "Users can view own research" ON research_notes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create research" ON research_notes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own research" ON research_notes FOR DELETE USING (user_id = auth.uid());

-- Calendar policies
CREATE POLICY "Users can view own events" ON calendar_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create events" ON calendar_events FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own events" ON calendar_events FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own events" ON calendar_events FOR DELETE USING (user_id = auth.uid());

-- Hymns policies (public read)
CREATE POLICY "Anyone can view hymns" ON hymns FOR SELECT TO authenticated USING (true);

-- User Hymns policies
CREATE POLICY "Users can view own favorites" ON user_hymns FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create favorites" ON user_hymns FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete favorites" ON user_hymns FOR DELETE USING (user_id = auth.uid());

-- Community Posts policies (within groups)
CREATE POLICY "Members can view group posts" ON community_posts FOR SELECT
  USING (EXISTS (SELECT 1 FROM study_group_members WHERE group_id = community_posts.group_id AND user_id = auth.uid()));
CREATE POLICY "Members can create posts" ON community_posts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM study_group_members WHERE group_id = community_posts.group_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE USING (user_id = auth.uid());

-- Community Comments policies
CREATE POLICY "Members can view comments" ON community_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM community_posts cp
    JOIN study_group_members sgm ON cp.group_id = sgm.group_id
    WHERE cp.id = community_comments.post_id AND sgm.user_id = auth.uid()));
CREATE POLICY "Members can create comments" ON community_comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own comments" ON community_comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON community_comments FOR DELETE USING (user_id = auth.uid());

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

CREATE TRIGGER update_study_guides_updated_at BEFORE UPDATE ON study_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
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
-- SAMPLE DATA
-- ============================================================================

-- Sample Reading Plans
INSERT INTO reading_plans (name, description, duration_days, category, is_public) VALUES
('Bible in a Year', 'Read through the entire Bible in 365 days with daily Old Testament, New Testament, and Psalms readings.', 365, 'Comprehensive', true),
('Gospels Deep Dive', 'Spend 90 days exploring Matthew, Mark, Luke, and John with reflection questions.', 90, 'New Testament', true),
('Psalms & Proverbs', 'Daily wisdom and worship readings from Psalms and Proverbs over 31 days.', 31, 'Wisdom Literature', true),
('Lenten Journey', '40 days of readings following Jesus from temptation to resurrection.', 40, 'Seasonal', true);

-- Sample Hymns
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
-- Schema creation complete for Scripture Study Companion!
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Add your ANTHROPIC_API_KEY to .env.local
-- 3. Run: npm run dev
