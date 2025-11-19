import { createClient } from '@supabase/supabase-js';

// Main database (where MCP tools connect)
const mainDb = createClient(
  'https://hlxvizfxgajkrxvxktxj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseHZpemZ4Z2Fqa3J4dnhrdHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MjMxMjEsImV4cCI6MjA3ODQ5OTEyMX0.1bdtZX5s7rfbgMX76F3d4_ituZkV_q5nYH_OX1-4xv8'
);

// Digital Chain Bank database
const digitalChainDb = createClient(
  'https://bzemaxsqlhydefzjehup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZW1heHNxbGh5ZGVmemplaHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDI2ODYsImV4cCI6MjA2NzAxODY4Nn0.4Eb9jPeOF4o3QHUfHXf2QG4J1S0F3GTj1pfGXzDNW6Q'
);

async function checkAll() {
  console.log('\n=== MAIN DATABASE ===');

  const { data: mainHierarchy, error: mainError } = await mainDb
    .from('user_hierarchy')
    .select('*');

  if (mainError) {
    console.error('❌ Error:', mainError);
  } else {
    console.log(`Found ${mainHierarchy?.length || 0} hierarchy relationships:`);
    console.log(JSON.stringify(mainHierarchy, null, 2));
  }

  const { data: mainUsers, error: mainUsersError } = await mainDb
    .from('users')
    .select('id, email, full_name')
    .limit(5);

  if (mainUsersError) {
    console.error('❌ Error:', mainUsersError);
  } else {
    console.log(`\nFound ${mainUsers?.length || 0} users:`);
    console.log(JSON.stringify(mainUsers, null, 2));
  }

  const { data: mainChats, error: mainChatsError } = await mainDb
    .from('chat_sessions')
    .select('id, client_name, client_user_id, bank_key')
    .eq('bank_key', 'digitalchain')
    .limit(5);

  if (mainChatsError) {
    console.error('❌ Error:', mainChatsError);
  } else {
    console.log(`\nFound ${mainChats?.length || 0} chat sessions:`);
    console.log(JSON.stringify(mainChats, null, 2));
  }

  console.log('\n\n=== DIGITAL CHAIN BANK DATABASE ===');

  const { data: dcHierarchy, error: dcError } = await digitalChainDb
    .from('user_hierarchy')
    .select('*');

  if (dcError) {
    console.error('❌ Error:', dcError);
  } else {
    console.log(`Found ${dcHierarchy?.length || 0} hierarchy relationships:`);
    console.log(JSON.stringify(dcHierarchy, null, 2));
  }

  const { data: dcUsers, error: dcUsersError } = await digitalChainDb
    .from('users')
    .select('id, email, full_name')
    .limit(5);

  if (dcUsersError) {
    console.error('❌ Error:', dcUsersError);
  } else {
    console.log(`\nFound ${dcUsers?.length || 0} users:`);
    console.log(JSON.stringify(dcUsers, null, 2));
  }

  const { data: dcChats, error: dcChatsError } = await digitalChainDb
    .from('chat_sessions')
    .select('id, client_name, client_user_id, bank_key')
    .limit(5);

  if (dcChatsError) {
    console.error('❌ Error:', dcChatsError);
  } else {
    console.log(`\nFound ${dcChats?.length || 0} chat sessions:`);
    console.log(JSON.stringify(dcChats, null, 2));
  }
}

checkAll().catch(console.error);
