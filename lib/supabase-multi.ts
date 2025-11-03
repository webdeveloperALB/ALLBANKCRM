import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BANKS } from './bank-config';

export function getBankClient(bankKey: string): SupabaseClient {
  const config = BANKS[bankKey];
  if (!config) {
    throw new Error(`Bank ${bankKey} not found`);
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function getAllBankClients() {
  return Object.keys(BANKS).map(key => ({
    key,
    name: BANKS[key].name,
    client: getBankClient(key)
  }));
}
