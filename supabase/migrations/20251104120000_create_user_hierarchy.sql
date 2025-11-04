/*
  # Create User Hierarchy System

  1. New Tables
    - `user_hierarchy`
      - `id` (uuid, primary key)
      - `superior_id` (uuid) - The manager or superior manager
      - `subordinate_id` (uuid) - The user being managed
      - `relationship_type` (text) - 'manager_to_user' or 'superior_manager_to_manager'
      - `created_at` (timestamp)
      - `created_by` (uuid) - Admin who created the relationship

  2. Security
    - Enable RLS on `user_hierarchy` table
    - Add policies for hierarchy-based access control

  3. Indexes
    - Index on superior_id for fast lookups
    - Index on subordinate_id for reverse lookups
    - Index on relationship_type for filtering
*/

-- Create user_hierarchy table
CREATE TABLE IF NOT EXISTS public.user_hierarchy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  superior_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subordinate_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('manager_to_user', 'superior_manager_to_manager')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT unique_hierarchy_relationship UNIQUE (superior_id, subordinate_id)
);

-- Create indexes for fast hierarchy lookups
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_superior ON public.user_hierarchy(superior_id);
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_subordinate ON public.user_hierarchy(subordinate_id);
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_type ON public.user_hierarchy(relationship_type);

-- Enable RLS
ALTER TABLE public.user_hierarchy ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Admins can see all hierarchy relationships
CREATE POLICY "Admins can view all hierarchy"
  ON public.user_hierarchy FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Admins can manage all hierarchy relationships
CREATE POLICY "Admins can insert hierarchy"
  ON public.user_hierarchy FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update hierarchy"
  ON public.user_hierarchy FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete hierarchy"
  ON public.user_hierarchy FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Managers and Superior Managers can view their own hierarchy
CREATE POLICY "Managers can view their hierarchy"
  ON public.user_hierarchy FOR SELECT
  TO authenticated
  USING (
    superior_id = auth.uid()
    OR subordinate_id = auth.uid()
  );

-- Create helper function to get all users accessible to a manager/superior manager
CREATE OR REPLACE FUNCTION get_accessible_users(user_id uuid)
RETURNS TABLE (accessible_user_id uuid, access_level text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE hierarchy_tree AS (
    -- Base case: direct subordinates
    SELECT
      uh.subordinate_id as user_id,
      uh.relationship_type,
      1 as depth
    FROM user_hierarchy uh
    WHERE uh.superior_id = user_id

    UNION ALL

    -- Recursive case: subordinates of subordinates (for superior managers)
    SELECT
      uh.subordinate_id,
      uh.relationship_type,
      ht.depth + 1
    FROM user_hierarchy uh
    JOIN hierarchy_tree ht ON uh.superior_id = ht.user_id
    WHERE ht.relationship_type = 'superior_manager_to_manager'
    AND ht.depth < 10 -- Prevent infinite recursion
  )
  SELECT DISTINCT
    user_id,
    CASE
      WHEN depth = 1 AND relationship_type = 'manager_to_user' THEN 'direct_user'
      WHEN depth = 1 AND relationship_type = 'superior_manager_to_manager' THEN 'managed_manager'
      ELSE 'indirect_user'
    END as access_level
  FROM hierarchy_tree;
END;
$$;

-- Create function to check if user can access admin panel
CREATE OR REPLACE FUNCTION can_access_admin_panel(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT is_admin, is_manager, is_superiormanager
  INTO user_record
  FROM public.users
  WHERE id = user_id;

  -- Must have is_admin = true to access admin panel
  IF user_record.is_admin IS NULL OR user_record.is_admin = false THEN
    RETURN false;
  END IF;

  -- If is_admin is true, they can access
  RETURN true;
END;
$$;
