# PastorAid Database Setup

## Step 1: Run Schema in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard/project/uvdywwwllsrrffaxvfra

2. Navigate to **SQL Editor** (left sidebar)

3. Click "New query"

4. Copy the entire contents of `supabase-schema.sql`

5. Paste into the SQL Editor

6. Click "Run" (or press Cmd/Ctrl + Enter)

7. Wait for completion (~10-15 seconds)

## Step 2: Verify Tables

Go to **Table Editor** and verify these tables exist:

- ✅ profiles
- ✅ user_settings
- ✅ sermons
- ✅ sermon_ideas
- ✅ notes
- ✅ research_notes
- ✅ calendar_events
- ✅ hymns (should have 5 sample hymns)
- ✅ user_hymns
- ✅ community_posts
- ✅ community_comments

## Step 3: Test with Sample User

1. Go to **Authentication → Users**
2. Click "Add user" → "Create new user"
3. Email: `test@pastoraid.com`
4. Password: `Test123!`
5. Click "Create user"

## Step 4: Verify RLS Works

1. Go to **SQL Editor**
2. Run this test query:

```sql
-- This should work (returns your profile)
SELECT * FROM profiles WHERE id = auth.uid();

-- This should fail (RLS prevents seeing other users)
SELECT * FROM profiles WHERE id != auth.uid();
```

## Troubleshooting

### If tables don't appear:
- Check for errors in SQL Editor
- Make sure extensions are enabled
- Try running in smaller chunks

### If RLS doesn't work:
- Verify policies are created
- Check if RLS is enabled on tables
- Try logging in as test user

## Next: Start Development

Once database is set up:

```bash
npm run dev
```

Visit http://localhost:3000
