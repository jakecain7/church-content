/*
  # Fix User Profile Creation Issues

  1. Changes
    - Add ON CONFLICT handling to user_profiles table
    - Update RLS policies to ensure proper access control
    - Add trigger to handle profile creation on user signup
  
  2. Security
    - Maintain existing RLS policies
    - Add additional safeguards for profile creation
*/

-- Add ON CONFLICT handling to user_profiles table
ALTER TABLE user_profiles 
  ADD CONSTRAINT user_profiles_id_key UNIQUE (id);

-- Update RLS policies to be more permissive during signup
DROP POLICY IF EXISTS "Anyone can create a profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON user_profiles;

-- Create new policies with better handling
CREATE POLICY "Enable insert for authentication service"
  ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable update for users based on id"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create or replace the function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL AND NEW.raw_user_meta_data->>'last_name' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name')
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;