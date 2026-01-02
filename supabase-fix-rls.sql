-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a function that creates profiles (runs with SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.create_profile(
  user_id UUID,
  user_username TEXT,
  user_full_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (user_id, user_username, user_full_name);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile TO anon;

-- Re-create INSERT policy (keep for direct inserts in future)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
