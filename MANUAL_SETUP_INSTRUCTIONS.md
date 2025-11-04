# Manual Setup Required: User Hierarchy Table

The `user_hierarchy` table needs to be created in all three bank databases manually.

## Steps:

### 1. Go to each Supabase project's SQL Editor:

- **Digital Chain Bank**: https://supabase.com/dashboard/project/bzemaxsqlhydefzjehup/sql
- **Cayman Bank**: https://supabase.com/dashboard/project/rswfgdklidaljidagkxp/sql
- **Lithuanian Bank**: https://supabase.com/dashboard/project/asvvmnifwvnyrxvxewvv/sql

### 2. Run this SQL in EACH database:

```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_superior ON public.user_hierarchy(superior_id);
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_subordinate ON public.user_hierarchy(subordinate_id);
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_type ON public.user_hierarchy(relationship_type);

-- Enable RLS
ALTER TABLE public.user_hierarchy ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all hierarchy" ON public.user_hierarchy;
DROP POLICY IF EXISTS "Admins can insert hierarchy" ON public.user_hierarchy;
DROP POLICY IF EXISTS "Admins can update hierarchy" ON public.user_hierarchy;
DROP POLICY IF EXISTS "Admins can delete hierarchy" ON public.user_hierarchy;
DROP POLICY IF EXISTS "Managers can view their hierarchy" ON public.user_hierarchy;

-- Admin policies
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

CREATE POLICY "Managers can view their hierarchy"
  ON public.user_hierarchy FOR SELECT
  TO authenticated
  USING (
    superior_id = auth.uid()
    OR subordinate_id = auth.uid()
  );

-- Helper functions
CREATE OR REPLACE FUNCTION get_accessible_users(p_user_id uuid)
RETURNS TABLE (accessible_user_id uuid, access_level text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE hierarchy_tree AS (
    SELECT
      uh.subordinate_id as user_id,
      uh.relationship_type,
      1 as depth
    FROM user_hierarchy uh
    WHERE uh.superior_id = p_user_id
    UNION ALL
    SELECT
      uh.subordinate_id,
      uh.relationship_type,
      ht.depth + 1
    FROM user_hierarchy uh
    JOIN hierarchy_tree ht ON uh.superior_id = ht.user_id
    WHERE ht.relationship_type = 'superior_manager_to_manager'
    AND ht.depth < 10
  )
  SELECT DISTINCT
    ht.user_id,
    CASE
      WHEN ht.depth = 1 AND ht.relationship_type = 'manager_to_user' THEN 'direct_user'
      WHEN ht.depth = 1 AND ht.relationship_type = 'superior_manager_to_manager' THEN 'managed_manager'
      ELSE 'indirect_user'
    END as access_level
  FROM hierarchy_tree ht;
END;
$$;

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

  IF user_record.is_admin IS NULL OR user_record.is_admin = false THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;
```

### 3. Verify the table was created

Run this query in each database to verify:

```sql
SELECT * FROM user_hierarchy LIMIT 1;
```

You should see an empty result (no error).

## After Setup

Once you've run the SQL in all three databases, the hierarchy assignment feature will work!
