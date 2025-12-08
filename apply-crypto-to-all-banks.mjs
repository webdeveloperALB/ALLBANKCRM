import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BANKS = {
  cayman: {
    name: 'Cayman Bank',
    url: 'https://rswfgdklidaljidagkxp.supabase.co',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzd2ZnZGtsaWRhbGppZGFna3hwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTY1OTA3NywiZXhwIjoyMDc3MjM1MDc3fQ.vXTlkRhmsqSO2pDJ9b_Yyth6urRNHJI7yhXMS7kGn4k'
  },
  lithuanian: {
    name: 'Lithuanian Bank',
    url: 'https://asvvmnifwvnyrxvxewvv.supabase.co',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdnZtbmlmd3ZueXJ4dnhld3Z2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU2MzY2MSwiZXhwIjoyMDc3MTM5NjYxfQ.ugTFp4rRITjnAOB4IBOHv7siXRaVkkz4kurxuW2g7W4'
  },
  digitalchain: {
    name: 'Digital Chain Bank',
    url: 'https://bzemaxsqlhydefzjehup.supabase.co',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZW1heHNxbGh5ZGVmemplaHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ0MjY4NiwiZXhwIjoyMDY3MDE4Njg2fQ.9EfkiHUecc3dUEYsIGk8R6RnsywTgs4urUv_Ts2Otcw'
  }
};

async function applyMigration(bankKey, bankConfig) {
  console.log(`\n=== Processing ${bankConfig.name} ===`);

  const supabase = createClient(bankConfig.url, bankConfig.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Check if crypto_transactions table exists
    const { data: tables, error: checkError } = await supabase
      .from('crypto_transactions')
      .select('id')
      .limit(1);

    if (!checkError || checkError.code !== 'PGRST116') {
      console.log(`✓ crypto_transactions table already exists in ${bankConfig.name}`);
      return;
    }
  } catch (e) {
    // Table might not exist, continue with migration
  }

  console.log(`Creating crypto_transactions table in ${bankConfig.name}...`);

  // Read the migration file
  const migrationPath = join(__dirname, 'supabase', 'migrations', '20251104000000_create_crypto_transactions_table.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf8');

  // Execute the migration
  const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

  if (error) {
    console.error(`✗ Error applying migration to ${bankConfig.name}:`, error);
  } else {
    console.log(`✓ Successfully created crypto_transactions table in ${bankConfig.name}`);
  }
}

async function main() {
  console.log('Applying crypto_transactions migration to all banks...\n');

  for (const [key, config] of Object.entries(BANKS)) {
    await applyMigration(key, config);
  }

  console.log('\n=== Migration Complete ===\n');
}

main().catch(console.error);
