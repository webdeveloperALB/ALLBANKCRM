import { createClient } from '@supabase/supabase-js';

const DIGITALCHAIN_URL = 'https://bzemaxsqlhydefzjehup.supabase.co';
const DIGITALCHAIN_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZW1heHNxbGh5ZGVmemplaHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ0MjY4NiwiZXhwIjoyMDY3MDE4Njg2fQ.9EfkiHUecc3dUEYsIGk8R6RnsywTgs4urUv_Ts2Otcw';

const supabase = createClient(DIGITALCHAIN_URL, DIGITALCHAIN_SERVICE_KEY);

const migrationSQL = `
-- Check if table exists first
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_hierarchy') THEN
    -- Create user_hierarchy table
    CREATE TABLE public.user_hierarchy (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      superior_id uuid NOT NULL,
      subordinate_id uuid NOT NULL,
      relationship_type text NOT NULL CHECK (relationship_type IN ('manager_to_user', 'superior_manager_to_manager')),
      created_at timestamptz DEFAULT now(),
      created_by uuid,
      CONSTRAINT unique_hierarchy_relationship UNIQUE (superior_id, subordinate_id)
    );

    -- Create indexes for fast hierarchy lookups
    CREATE INDEX idx_user_hierarchy_superior ON public.user_hierarchy(superior_id);
    CREATE INDEX idx_user_hierarchy_subordinate ON public.user_hierarchy(subordinate_id);
    CREATE INDEX idx_user_hierarchy_type ON public.user_hierarchy(relationship_type);

    -- Enable RLS
    ALTER TABLE public.user_hierarchy ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE 'user_hierarchy table created successfully';
  ELSE
    RAISE NOTICE 'user_hierarchy table already exists';
  END IF;
END $$;

-- Drop function if exists and recreate
DROP FUNCTION IF EXISTS get_accessible_users(uuid);

-- Create helper function to get all users accessible to a manager/superior manager
CREATE OR REPLACE FUNCTION get_accessible_users(p_user_id uuid)
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
    WHERE uh.superior_id = p_user_id

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
`;

console.log('Applying migration to Digital Chain Bank...');

try {
  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL }).then(() => {
    return supabase.from('user_hierarchy').select('*').limit(1);
  }).catch(async () => {
    // If exec_sql doesn't exist, try direct query
    const { data, error } = await supabase.rpc('query', { query_text: migrationSQL }).catch(() => {
      throw new Error('Could not execute migration. Please run this SQL manually in the Supabase SQL Editor.');
    });
    if (error) throw error;
    return { data, error: null };
  });

  if (error) {
    console.error('Error:', error.message);
    console.log('\nPlease run this SQL manually in the Digital Chain Bank SQL Editor:');
    console.log('\n' + migrationSQL);
  } else {
    console.log('Migration applied successfully!');
    console.log('\nNow you can add hierarchy relationships. Example:');
    console.log(`
INSERT INTO user_hierarchy (superior_id, subordinate_id, relationship_type, created_by)
VALUES (
  '95c3ef2f-63c1-4105-9196-954e15f88aca', -- bjorn's user_id
  'SUBORDINATE_USER_ID_HERE',
  'manager_to_user',
  '95c3ef2f-63c1-4105-9196-954e15f88aca'
);
    `);
  }
} catch (err) {
  console.error('Error executing migration:', err.message);
  console.log('\n=== MIGRATION SQL ===');
  console.log('Please copy and run this in the Digital Chain Bank SQL Editor:\n');
  console.log(migrationSQL);
}
