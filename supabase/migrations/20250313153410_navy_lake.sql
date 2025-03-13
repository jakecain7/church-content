/*
  # Fix User Profiles RLS Policies

  1. Changes
    - Drop existing problematic policies
    - Add new policies for user profiles table
    - Allow unauthenticated users to create profiles during signup
  
  2. Security
    - Enable RLS on user_profiles table
    - Add policies for proper access control
    - Allow profile creation during signup
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view profiles" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
END $$;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies

-- Allow anyone to create a profile (needed for signup)
CREATE POLICY "Anyone can create a profile"
  ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to view other profiles (for features that need to display user information)
CREATE POLICY "Users can view other profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);