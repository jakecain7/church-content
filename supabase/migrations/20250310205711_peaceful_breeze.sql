/*
  # Create History Table

  1. New Tables
    - `history`
      - `id` (uuid, primary key)
      - `module` (text, not null) - Type of content (study guides, writing, images)
      - `title` (text, not null) - Title of the content
      - `content` (jsonb, not null) - The actual content data
      - `created_at` (timestamptz) - Creation timestamp
      - `user_id` (uuid) - Reference to auth.users table
  
  2. Security
    - Enable RLS on history table
    - Add policies for CRUD operations
    - Users can manage their own history or public history (where user_id is null)
*/

-- Create history table if it doesn't exist
CREATE TABLE IF NOT EXISTS history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'history' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE history ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'history' 
    AND policyname = 'Users can read own history or public history'
  ) THEN
    CREATE POLICY "Users can read own history or public history"
      ON history
      FOR SELECT
      TO public
      USING ((auth.uid() = user_id) OR (user_id IS NULL) OR (auth.uid() IS NULL));
  END IF;

  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'history' 
    AND policyname = 'Users can insert own history or public history'
  ) THEN
    CREATE POLICY "Users can insert own history or public history"
      ON history
      FOR INSERT
      TO public
      WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL) OR (auth.uid() IS NULL));
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'history' 
    AND policyname = 'Users can update own history or public history'
  ) THEN
    CREATE POLICY "Users can update own history or public history"
      ON history
      FOR UPDATE
      TO public
      USING ((auth.uid() = user_id) OR (user_id IS NULL) OR (auth.uid() IS NULL))
      WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL) OR (auth.uid() IS NULL));
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'history' 
    AND policyname = 'Users can delete own history or public history'
  ) THEN
    CREATE POLICY "Users can delete own history or public history"
      ON history
      FOR DELETE
      TO public
      USING ((auth.uid() = user_id) OR (user_id IS NULL) OR (auth.uid() IS NULL));
  END IF;
END $$;