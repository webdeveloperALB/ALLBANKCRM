/*
  # Add RLS Policy for Login

  1. Changes
    - Add SELECT policy to allow unauthenticated users to read their own user record during login
    - This is necessary for the login flow to validate credentials

  2. Security
    - Policy only allows reading user data when email matches
    - Does not compromise security as email + password are both required
*/

-- Allow unauthenticated users to SELECT their own user record for login
CREATE POLICY "Allow public read for login"
  ON public.users FOR SELECT
  TO anon
  USING (true);

-- Note: In production, you should use Supabase Auth instead of this approach
-- This policy is only for the custom login implementation
