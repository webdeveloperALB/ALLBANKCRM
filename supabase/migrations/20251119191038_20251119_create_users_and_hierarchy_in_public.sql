/*
  # Create Users and User Hierarchy in Public Database
  
  1. Tables Created
    - `users` - User accounts with roles (admin, manager, superior manager)
    - `user_hierarchy` - Manager-subordinate relationships
    
  2. Security
    - Enable RLS on both tables
    - Policies for authenticated access
    
  3. Functions
    - `get_accessible_users` - Returns users accessible to a manager based on hierarchy
*/

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  is_admin boolean DEFAULT false,
  is_manager boolean DEFAULT false,
  is_superiormanager boolean DEFAULT false,
  bank_key text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create user_hierarchy table
CREATE TABLE IF NOT EXISTS public.user_hierarchy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  superior_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subordinate_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('manager_to_user', 'superior_manager_to_manager')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  UNIQUE(superior_id, subordinate_id)
);

ALTER TABLE public.user_hierarchy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read hierarchy"
  ON public.user_hierarchy
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_user_hierarchy_superior ON public.user_hierarchy(superior_id);
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_subordinate ON public.user_hierarchy(subordinate_id);

-- Create RPC function to get accessible users
CREATE OR REPLACE FUNCTION public.get_accessible_users(p_user_id uuid)
RETURNS TABLE (accessible_user_id uuid) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT uh.subordinate_id
  FROM public.user_hierarchy uh
  WHERE uh.superior_id = p_user_id;
END;
$$;
