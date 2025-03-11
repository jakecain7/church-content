/*
  # Create history table for Bible Tools application

  1. New Tables
    - `history`
      - `id` (uuid, primary key)
      - `module` (text, not null)
      - `title` (text, not null)
      - `content` (jsonb, not null)
      - `created_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `history` table
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS history (
  id uuid PRIMARY KEY,
  module text NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own history
CREATE POLICY "Users can read own history"
  ON history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own history
CREATE POLICY "Users can insert own history"
  ON history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own history
CREATE POLICY "Users can update own history"
  ON history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own history
CREATE POLICY "Users can delete own history"
  ON history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);