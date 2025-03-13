/*
  # Fix user signup issues
  
  1. Changes
    - Simplify user profile creation
    - Remove complex trigger logic
    - Update RLS policies
    - Add better error handling
  
  2. Security
    - Maintain RLS
    - Allow public access for signup
    - Protect user data appropriately
*/

-- Drop existing complex policies and triggers
DROP POLICY IF EXISTS "Enable public insert" ON user_profiles;
DROP POLICY IF EXISTS "Enable public select" ON user_profiles;
DROP POLICY IF EXISTS "Enable authenticated update" ON user_profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate user_profiles table with simpler structure
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY "Enable insert for signup"
  ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable read access for all"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable update for own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Simple trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);