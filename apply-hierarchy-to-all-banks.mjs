import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const BANKS = {
  'cayman': {
    name: 'Cayman Bank',
    url: 'https://rswfgdklidaljidagkxp.supabase.co',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzd2ZnZGtsaWRhbGppZGFna3hwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTY1OTA3NywiZXhwIjoyMDc3MjM1MDc3fQ.vXTlkRhmsqSO2pDJ9b_Yyth6urRNHJI7yhXMS7kGn4k'
  },
  'lithuanian': {
    name: 'Lithuanian Bank',
    url: 'https://asvvmnifwvnyrxvxewvv.supabase.co',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdnZtbmlmd3ZueXJ4dnhld3Z2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU2MzY2MSwiZXhwIjoyMDc3MTM5NjYxfQ.ugTFp4rRITjnAOB4IBOHv7siXRaVkkz4kurxuW2g7W4'
  },
  'digitalchain': {
    name: 'Digital Chain Bank',
    url: 'https://bzemaxsqlhydefzjehup.supabase.co',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZW1heHNxbGh5ZGVmemplaHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ0MjY4NiwiZXhwIjoyMDY3MDE4Njg2fQ.9EfkiHUecc3dUEYsIGk8R6RnsywTgs4urUv_Ts2Otcw'
  }
};

const migrationSQL = `
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all hierarchy" ON public.user_hierarchy;
DROP POLICY IF EXISTS "Admins can insert hierarchy" ON public.user_hierarchy;
DROP POLICY IF EXISTS "Admins can update hierarchy" ON public.user_hierarchy;
DROP POLICY IF EXISTS "Admins can delete hierarchy" ON public.user_hierarchy;
DROP POLICY IF EXISTS "Managers can view their hierarchy" ON public.user_hierarchy;

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
    AND ht.depth < 10
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

  IF user_record.is_admin IS NULL OR user_record.is_admin = false THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;
`;

async function applyMigrationToBank(bankKey, bankConfig) {
  console.log(`\n=== Applying migration to ${bankConfig.name} ===`);

  const supabase = createClient(bankConfig.url, bankConfig.serviceRoleKey);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error(`❌ Error in ${bankConfig.name}:`, error);

      // Try without RPC
      console.log(`Trying direct execution for ${bankConfig.name}...`);
      const { error: directError } = await supabase.from('_sql').insert({ query: migrationSQL });

      if (directError) {
        console.error(`❌ Direct execution also failed:`, directError);
      }
    } else {
      console.log(`✅ Successfully applied migration to ${bankConfig.name}`);
    }

    // Verify the table was created
    const { data: tableCheck, error: checkError } = await supabase
      .from('user_hierarchy')
      .select('id')
      .limit(1);

    if (checkError && checkError.code !== 'PGRST116') {
      console.log(`⚠️  Table verification: ${checkError.message}`);
    } else {
      console.log(`✅ Table user_hierarchy exists in ${bankConfig.name}`);
    }

  } catch (err) {
    console.error(`❌ Exception in ${bankConfig.name}:`, err.message);
  }
}

async function main() {
  console.log('Starting migration to all banks...\n');

  for (const [key, config] of Object.entries(BANKS)) {
    await applyMigrationToBank(key, config);
  }

  console.log('\n=== Migration complete ===');
}

main();
