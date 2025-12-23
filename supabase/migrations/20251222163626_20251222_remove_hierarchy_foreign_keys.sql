/*
  # Remove Foreign Key Constraints from user_hierarchy

  1. Changes
    - Drop foreign key constraints on superior_id and subordinate_id
    - This allows cross-bank hierarchy relationships
    - The columns remain as uuid NOT NULL, but without foreign key enforcement
    - We keep the unique constraint to prevent duplicate relationships

  2. Reason
    - Each bank has its own separate database
    - Foreign keys prevent linking users across different bank databases
    - We need to allow superior_id from one bank to reference subordinate_id from another bank

  3. Important Notes
    - Application logic must ensure referenced user IDs are valid
    - Orphaned relationships may exist if users are deleted, but this is acceptable
    - The unique constraint prevents duplicate relationships
*/

-- Drop the existing foreign key constraints
ALTER TABLE IF EXISTS public.user_hierarchy 
  DROP CONSTRAINT IF EXISTS user_hierarchy_superior_id_fkey;

ALTER TABLE IF EXISTS public.user_hierarchy 
  DROP CONSTRAINT IF EXISTS user_hierarchy_subordinate_id_fkey;

ALTER TABLE IF EXISTS public.user_hierarchy 
  DROP CONSTRAINT IF EXISTS user_hierarchy_created_by_fkey;

-- The columns remain as NOT NULL but without foreign key enforcement
-- This allows cross-bank relationships while maintaining data integrity at the application level
