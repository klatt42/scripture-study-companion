# Fix Supabase Auth - Email Confirmation Issue

## Problem
- New signups not working (waiting for email confirmation)
- Test credentials not working
- Email confirmation is enabled in Supabase

## Solution Options

### Option 1: Disable Email Confirmation in Supabase (RECOMMENDED for Development)

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/uvdywwwllsrrffaxvfra
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth**
4. Toggle **"Confirm email"** to **OFF**
5. Save changes
6. Try signing up again

### Option 2: Run Auto-Confirm SQL Trigger

1. Go to **SQL Editor** in Supabase
2. Copy and run this SQL:

```sql
-- Auto-confirm users on signup (for development)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Auto-confirm email if not already confirmed
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NOW();
    NEW.confirmation_token = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Option 3: Manually Confirm Your Account

1. Go to **Authentication** → **Users** in Supabase
2. Find your newly created user
3. Click on the user
4. Click **"Confirm email"** button
5. Go back to login and try again

### Option 4: Create Test User Manually in Supabase

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - Email: your-email@example.com
   - Password: YourPassword123!
   - Auto Confirm User: **YES** ✅
4. Click **"Create user"**
5. Use these credentials to login

## Which Option to Use?

**For Development:** Option 1 (Disable email confirmation)
- Fastest and simplest
- No emails needed
- Users can login immediately

**For Quick Test:** Option 3 or 4
- Manually confirm your account
- Or create new user with auto-confirm

**For Production-like Setup:** Option 2 (SQL Trigger)
- Auto-confirms all new users
- Good for testing full flow
- Can remove later for production

## After Fixing

Try logging in at: http://localhost:3001/login
- Your new email + password
- OR test account: test@pastoraid.com / Test123!

## Notes

The file `supabase-auto-confirm-users.sql` already exists in your project. If you choose Option 2, you can just run that file contents in SQL Editor.
