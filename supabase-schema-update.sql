-- Settings Page Schema Update
-- Run this in your Supabase SQL Editor

-- 1. Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    bible_version TEXT DEFAULT 'NIV',
    email_notifications BOOLEAN DEFAULT true,
    calendar_reminders BOOLEAN DEFAULT true,
    community_notifications BOOLEAN DEFAULT true,
    font_size TEXT DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Enable RLS on user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for user_settings (drop first if exist)
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Ensure profiles table has church_affiliation and denomination columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'church_affiliation'
    ) THEN
        ALTER TABLE profiles ADD COLUMN church_affiliation TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'denomination'
    ) THEN
        ALTER TABLE profiles ADD COLUMN denomination TEXT;
    END IF;
END $$;

-- 5. Create the create_profile RPC function (needed for signup)
-- This bypasses RLS to create profile after auth user is created
CREATE OR REPLACE FUNCTION create_profile(
    user_id UUID,
    user_username TEXT,
    user_full_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO profiles (id, username, full_name, created_at, updated_at)
    VALUES (user_id, user_username, user_full_name, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
END;
$$;

-- 6. Insert default settings for dev user (mock user)
-- This allows development mode to work without real auth
INSERT INTO user_settings (user_id, bible_version, email_notifications, calendar_reminders, community_notifications, font_size)
VALUES ('00000000-0000-0000-0000-000000000001', 'NIV', true, true, true, 'medium')
ON CONFLICT (user_id) DO NOTHING;

-- 7. Insert default profile for dev user (mock user)
INSERT INTO profiles (id, username, full_name, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'devuser', 'Development User', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
