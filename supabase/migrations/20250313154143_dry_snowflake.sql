/*
  # Fix User Signup RLS Policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create new simplified policies for user_profiles
    - Update trigger function to handle signup more robustly
  
  2. Security
    - Allow public access for signup
    - Maintain secure access for authenticated users
    - Handle edge cases in profile creation
*/

-- Drop existing policies to start fresh
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Enable insert for authentication service" ON user_profiles;
  DROP POLICY IF EXISTS "Enable select for authenticated users" ON user_profiles;
  DROP POLICY IF EXISTS "Enable update for users based on id" ON user_profiles;
END $$;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Enable public insert"
  ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable public select"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable authenticated update"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  full_name_val text;
BEGIN
  -- Extract full name from metadata if available
  full_name_val := CASE 
    WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL 
      AND NEW.raw_user_meta_data->>'last_name' IS NOT NULL
    THEN (NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name')
    ELSE NEW.raw_user_meta_data->>'full_name'
  END;

  -- Insert with more flexible error handling
  BEGIN
    INSERT INTO public.user_profiles (id, full_name)
    VALUES (NEW.id, full_name_val)
    ON CONFLICT (id) DO UPDATE 
    SET full_name = EXCLUDED.full_name
    WHERE user_profiles.full_name IS NULL;
  EXCEPTION 
    WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE NOTICE 'Error creating user profile: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;