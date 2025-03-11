/*
  # Fix Row Level Security Policies for History Table

  1. Changes
    - Update RLS policies to handle unauthenticated users
    - Add policy for public access when user_id is null
    - Make user_id column nullable
  
  2. Security
    - Maintain existing RLS policies for authenticated users
    - Add policies for public access with null user_id
*/

-- Make user_id nullable to allow unauthenticated users to create history items
ALTER TABLE history ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own history" ON history;
DROP POLICY IF EXISTS "Users can insert own history" ON history;
DROP POLICY IF EXISTS "Users can update own history" ON history;
DROP POLICY IF EXISTS "Users can delete own history" ON history;

-- Create new policies that handle both authenticated and unauthenticated users

-- Read policy
CREATE POLICY "Users can read own history or public history"
  ON history
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR 
    (user_id IS NULL) OR
    (auth.uid() IS NULL)
  );

-- Insert policy
CREATE POLICY "Users can insert own history or public history"
  ON history
  FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR 
    (user_id IS NULL) OR
    (auth.uid() IS NULL)
  );

-- Update policy
CREATE POLICY "Users can update own history or public history"
  ON history
  FOR UPDATE
  USING (
    (auth.uid() = user_id) OR 
    (user_id IS NULL) OR
    (auth.uid() IS NULL)
  );

-- Delete policy
CREATE POLICY "Users can delete own history or public history"
  ON history
  FOR DELETE
  USING (
    (auth.uid() = user_id) OR 
    (user_id IS NULL) OR
    (auth.uid() IS NULL)
  );