/*
  # Fix infinite recursion in organization policies

  1. Changes
    - Remove recursive policies
    - Simplify organization access checks
    - Fix history table policies
*/

-- Drop existing problematic policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
  DROP POLICY IF EXISTS "Users can access organization history" ON history;
END $$;

-- Create new non-recursive policies
CREATE POLICY "Users can view organizations"
  ON organizations
  FOR SELECT
  TO public
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Update history policy to avoid recursion
CREATE POLICY "Users can access history"
  ON history
  FOR ALL
  TO public
  USING (
    (organization_id IS NULL) OR
    (organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ))
  );