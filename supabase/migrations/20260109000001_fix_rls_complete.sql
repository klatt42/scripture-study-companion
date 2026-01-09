-- ============================================================================
-- COMPLETE FIX: Infinite Recursion in RLS Policies
-- Drop ALL existing policies first, then recreate properly
-- ============================================================================

-- Step 1: Create/replace helper functions that bypass RLS
CREATE OR REPLACE FUNCTION get_user_group_ids()
RETURNS SETOF UUID AS $$
  SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_group_member(check_group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM study_group_members
    WHERE group_id = check_group_id AND user_id = auth.uid()
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_group_admin(check_group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM study_group_members
    WHERE group_id = check_group_id AND user_id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Step 2: Drop ALL existing policies on affected tables
DROP POLICY IF EXISTS "Members can view group members" ON study_group_members;
DROP POLICY IF EXISTS "Users can view own memberships" ON study_group_members;
DROP POLICY IF EXISTS "Users can view co-member memberships" ON study_group_members;
DROP POLICY IF EXISTS "Users can join groups" ON study_group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON study_group_members;

DROP POLICY IF EXISTS "Anyone can view public groups" ON study_groups;
DROP POLICY IF EXISTS "Members can view private groups" ON study_groups;
DROP POLICY IF EXISTS "Users can create groups" ON study_groups;
DROP POLICY IF EXISTS "Admins can update groups" ON study_groups;
DROP POLICY IF EXISTS "Admins can delete groups" ON study_groups;

DROP POLICY IF EXISTS "Anyone can view global posts" ON community_posts;
DROP POLICY IF EXISTS "Members can view group posts" ON community_posts;
DROP POLICY IF EXISTS "Members can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can create global posts" ON community_posts;
DROP POLICY IF EXISTS "Members can create group posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;

DROP POLICY IF EXISTS "Anyone can view comments on global posts" ON community_comments;
DROP POLICY IF EXISTS "Members can view comments on group posts" ON community_comments;
DROP POLICY IF EXISTS "Members can view comments" ON community_comments;
DROP POLICY IF EXISTS "Users can comment on global posts" ON community_comments;
DROP POLICY IF EXISTS "Members can comment on group posts" ON community_comments;
DROP POLICY IF EXISTS "Members can create comments" ON community_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON community_comments;

-- Step 3: Recreate study_group_members policies (NO self-reference!)
CREATE POLICY "Users can view own memberships" ON study_group_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view co-member memberships" ON study_group_members
  FOR SELECT USING (group_id IN (SELECT get_user_group_ids()));

CREATE POLICY "Users can join groups" ON study_group_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups" ON study_group_members
  FOR DELETE USING (user_id = auth.uid());

-- Step 4: Recreate study_groups policies using helper functions
CREATE POLICY "Anyone can view public groups" ON study_groups
  FOR SELECT USING (is_public = true);

CREATE POLICY "Members can view private groups" ON study_groups
  FOR SELECT USING (is_group_member(id));

CREATE POLICY "Users can create groups" ON study_groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update groups" ON study_groups
  FOR UPDATE USING (is_group_admin(id));

CREATE POLICY "Admins can delete groups" ON study_groups
  FOR DELETE USING (is_group_admin(id));

-- Step 5: Recreate community_posts policies
CREATE POLICY "Anyone can view global posts" ON community_posts
  FOR SELECT USING (group_id IS NULL);

CREATE POLICY "Members can view group posts" ON community_posts
  FOR SELECT USING (group_id IS NOT NULL AND is_group_member(group_id));

CREATE POLICY "Users can create global posts" ON community_posts
  FOR INSERT WITH CHECK (user_id = auth.uid() AND group_id IS NULL);

CREATE POLICY "Members can create group posts" ON community_posts
  FOR INSERT WITH CHECK (user_id = auth.uid() AND group_id IS NOT NULL AND is_group_member(group_id));

CREATE POLICY "Users can update own posts" ON community_posts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON community_posts
  FOR DELETE USING (user_id = auth.uid());

-- Step 6: Recreate community_comments policies
CREATE POLICY "Anyone can view comments on global posts" ON community_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE community_posts.id = community_comments.post_id
      AND community_posts.group_id IS NULL
    )
  );

CREATE POLICY "Members can view comments on group posts" ON community_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE community_posts.id = community_comments.post_id
      AND community_posts.group_id IS NOT NULL
      AND is_group_member(community_posts.group_id)
    )
  );

CREATE POLICY "Users can comment on global posts" ON community_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE community_posts.id = community_comments.post_id
      AND community_posts.group_id IS NULL
    )
  );

CREATE POLICY "Members can comment on group posts" ON community_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE community_posts.id = community_comments.post_id
      AND community_posts.group_id IS NOT NULL
      AND is_group_member(community_posts.group_id)
    )
  );

CREATE POLICY "Users can delete own comments" ON community_comments
  FOR DELETE USING (user_id = auth.uid());
