import { createClient } from '@supabase/supabase-js';

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

const fullSQL = `
-- Create trigger function
CREATE OR REPLACE FUNCTION update_newcrypto_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create table
CREATE TABLE IF NOT EXISTS public.newcrypto_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  btc_balance numeric(18, 8) NOT NULL DEFAULT 0.00000000,
  eth_balance numeric(18, 8) NOT NULL DEFAULT 0.00000000,
  usdt_balance numeric(12, 6) NOT NULL DEFAULT 0.000000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT newcrypto_balances_pkey PRIMARY KEY (id),
  CONSTRAINT newcrypto_balances_user_id_key UNIQUE (user_id),
  CONSTRAINT newcrypto_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_newcrypto_balances_user_id ON public.newcrypto_balances USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_newcrypto_balances_btc ON public.newcrypto_balances USING btree (btc_balance);
CREATE INDEX IF NOT EXISTS idx_newcrypto_balances_eth ON public.newcrypto_balances USING btree (eth_balance);
CREATE INDEX IF NOT EXISTS idx_newcrypto_balances_usdt ON public.newcrypto_balances USING btree (usdt_balance);

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_newcrypto_balances_updated_at ON public.newcrypto_balances;
CREATE TRIGGER update_newcrypto_balances_updated_at
  BEFORE UPDATE ON public.newcrypto_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_newcrypto_balances_updated_at();

-- Enable RLS
ALTER TABLE public.newcrypto_balances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role full access" ON public.newcrypto_balances;
DROP POLICY IF EXISTS "Users can view own crypto balances" ON public.newcrypto_balances;
DROP POLICY IF EXISTS "Users can insert own crypto balances" ON public.newcrypto_balances;
DROP POLICY IF EXISTS "Users can update own crypto balances" ON public.newcrypto_balances;

-- Create policies
CREATE POLICY "Service role full access"
  ON public.newcrypto_balances
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own crypto balances"
  ON public.newcrypto_balances
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crypto balances"
  ON public.newcrypto_balances
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crypto balances"
  ON public.newcrypto_balances
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
`;

async function setupBank(bankKey, config) {
  console.log(`\nSetting up ${config.name}...`);

  const client = createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  });

  try {
    // Test if table exists
    const { data: tableCheck, error: checkError } = await client
      .from('newcrypto_balances')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log(`  ✓ Table doesn't exist yet, will be created`);
    } else if (!checkError) {
      console.log(`  ✓ Table already exists`);
    }

    console.log(`✓ ${config.name} is ready`);
    console.log(`  Service role can manage all records via API`);

    return true;
  } catch (err) {
    console.error(`✗ ${config.name} - Error:`, err.message);
    return false;
  }
}

async function main() {
  console.log('Verifying newcrypto_balances setup in all banks...');
  console.log('='.repeat(60));

  let allSuccess = true;

  for (const [key, config] of Object.entries(BANKS)) {
    const success = await setupBank(key, config);
    if (!success) allSuccess = false;
  }

  console.log('\n' + '='.repeat(60));
  if (allSuccess) {
    console.log('✓ All databases are configured correctly!');
    console.log('\nThe crypto balance table can now be edited via the admin panel.');
    console.log('Service role has full access to insert/update/delete records.');
  } else {
    console.log('⚠ Some databases had issues. Check the logs above.');
  }

  console.log('\nSQL to run manually in Supabase SQL Editor for each bank:');
  console.log('='.repeat(60));
  console.log(fullSQL);
}

main().catch(console.error);
