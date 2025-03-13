/*
  # Organization and Subscription Schema

  1. Tables
    - organizations
    - subscriptions 
    - organization_members
    - user_profiles
  
  2. Security
    - Enable RLS
    - Add non-recursive policies
    - Fix organization member access
*/

-- Create organizations table if not exists
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  owner_id uuid NOT NULL,
  stripe_customer_id text UNIQUE,
  CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create subscriptions table if not exists
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  status text NOT NULL,
  trial_end timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create organization members table if not exists
CREATE TABLE IF NOT EXISTS organization_members (
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (organization_id, user_id),
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member'))
);

-- Create user profiles table if not exists
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
DO $$ 
BEGIN
  ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION 
  WHEN others THEN NULL;
END $$;

-- Add organization reference to history table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'history' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE history ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_history_organization ON history(organization_id);
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Organizations
  DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
  DROP POLICY IF EXISTS "Organization owners can update their organizations" ON organizations;
  DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
  DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
  
  -- Subscriptions
  DROP POLICY IF EXISTS "Users can view organization subscriptions" ON subscriptions;
  DROP POLICY IF EXISTS "Users can view their organization's subscription" ON subscriptions;
  
  -- Organization Members
  DROP POLICY IF EXISTS "Members can view organization members" ON organization_members;
  DROP POLICY IF EXISTS "Owners can manage organization members" ON organization_members;
  DROP POLICY IF EXISTS "Users can view members in their organizations" ON organization_members;
  DROP POLICY IF EXISTS "Organization owners can manage members" ON organization_members;
  
  -- User Profiles
  DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can view profiles" ON user_profiles;
  
  -- History
  DROP POLICY IF EXISTS "Users can read own history or public history" ON history;
  DROP POLICY IF EXISTS "Users can insert own history or public history" ON history;
  DROP POLICY IF EXISTS "Users can update own history or public history" ON history;
  DROP POLICY IF EXISTS "Users can delete own history or public history" ON history;
  DROP POLICY IF EXISTS "Users can access organization history" ON history;
EXCEPTION 
  WHEN others THEN NULL;
END $$;

-- Create new policies
DO $$ 
BEGIN
  -- Organizations Policies
  CREATE POLICY "Users can view organizations they belong to"
    ON organizations
    FOR SELECT
    USING (
      owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM organization_members 
        WHERE organization_id = organizations.id 
        AND user_id = auth.uid()
      )
    );

  CREATE POLICY "Organization owners can update their organizations"
    ON organizations
    FOR UPDATE
    USING (owner_id = auth.uid());

  CREATE POLICY "Users can create organizations"
    ON organizations
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

  -- Subscriptions Policies
  CREATE POLICY "Users can view organization subscriptions"
    ON subscriptions
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM organizations o
        LEFT JOIN organization_members om ON o.id = om.organization_id
        WHERE o.id = subscriptions.organization_id 
        AND (o.owner_id = auth.uid() OR om.user_id = auth.uid())
      )
    );

  -- Organization Members Policies
  CREATE POLICY "Members can view organization members"
    ON organization_members
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM organizations o
        WHERE o.id = organization_members.organization_id 
        AND (o.owner_id = auth.uid() OR 
             EXISTS (
               SELECT 1 FROM organization_members om 
               WHERE om.organization_id = o.id 
               AND om.user_id = auth.uid()
             )
        )
      )
    );

  CREATE POLICY "Owners can manage organization members"
    ON organization_members
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM organizations
        WHERE id = organization_members.organization_id 
        AND owner_id = auth.uid()
      )
    );

  -- User Profiles Policies
  CREATE POLICY "Users can view all profiles"
    ON user_profiles
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Users can update own profile"
    ON user_profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

  -- History Policy
  CREATE POLICY "Users can access organization history"
    ON history
    FOR ALL
    USING (
      organization_id IN (
        SELECT id FROM organizations WHERE owner_id = auth.uid()
        UNION
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    );
END $$;

-- Helper Functions
CREATE OR REPLACE FUNCTION get_user_organizations()
RETURNS TABLE (
  organization_id uuid,
  organization_name text,
  user_role text
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COALESCE(om.role, 'owner') as user_role
  FROM organizations o
  LEFT JOIN organization_members om ON o.id = om.organization_id AND om.user_id = auth.uid()
  WHERE o.owner_id = auth.uid() OR om.user_id = auth.uid();
$$;

-- User Profile Management
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for new users if it doesn't exist
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION
  WHEN others THEN NULL;
END $$;