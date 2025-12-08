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

// Migrations to apply in order
const MIGRATIONS = [
  '20251028160539_create_newcrypto_balances_table.sql',
  '20251028160504_create_newcrypto_balances_trigger_function.sql',
  '20251104000000_create_crypto_transactions_table.sql',
  '20251104105335_fix_crypto_transaction_trigger_case_insensitive.sql',
  '20251126102527_create_crypto_wallets_table.sql'
];

async function applyMigration(bankKey, bankConfig, migrationFile) {
  const supabase = createClient(bankConfig.url, bankConfig.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log(`  Applying ${migrationFile}...`);

  try {
    const migrationPath = join(__dirname, 'supabase', 'migrations', migrationFile);
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error(`  ✗ Error:`, error.message);
      return false;
    } else {
      console.log(`  ✓ Success`);
      return true;
    }
  } catch (e) {
    console.error(`  ✗ Exception:`, e.message);
    return false;
  }
}

async function applyMigrationsToBank(bankKey, bankConfig) {
  console.log(`\n=== ${bankConfig.name} ===`);

  for (const migration of MIGRATIONS) {
    await applyMigration(bankKey, bankConfig, migration);
  }
}

async function main() {
  console.log('Applying crypto migrations to all banks...\n');

  for (const [key, config] of Object.entries(BANKS)) {
    await applyMigrationsToBank(key, config);
  }

  console.log('\n=== All Migrations Complete ===\n');
}

main().catch(console.error);
