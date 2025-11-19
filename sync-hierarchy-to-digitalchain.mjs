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

async function syncHierarchy() {
  console.log('🔍 Fetching hierarchy from main database...');

  // Get the specific hierarchy relationship we need
  const { data: mainHierarchy, error: mainError } = await mainDb
    .from('user_hierarchy')
    .select('*')
    .eq('superior_id', 'a846640c-cda7-42e4-8557-b5ad9a7303d5')
    .eq('subordinate_id', '41358644-8d33-4b11-a8d8-b25a4f3a19f5');

  if (mainError) {
    console.error('❌ Error fetching from main database:', mainError);
    return;
  }

  if (!mainHierarchy || mainHierarchy.length === 0) {
    console.log('⚠️ No hierarchy found in main database for this relationship');
    return;
  }

  console.log('✅ Found hierarchy in main database:', mainHierarchy);

  // Check if it already exists in Digital Chain Bank
  const { data: existingHierarchy, error: checkError } = await digitalChainDb
    .from('user_hierarchy')
    .select('*')
    .eq('superior_id', 'a846640c-cda7-42e4-8557-b5ad9a7303d5')
    .eq('subordinate_id', '41358644-8d33-4b11-a8d8-b25a4f3a19f5');

  if (checkError) {
    console.error('❌ Error checking Digital Chain Bank:', checkError);
    return;
  }

  if (existingHierarchy && existingHierarchy.length > 0) {
    console.log('ℹ️ Hierarchy already exists in Digital Chain Bank');
    return;
  }

  // Insert into Digital Chain Bank
  console.log('📝 Inserting hierarchy into Digital Chain Bank...');
  const { data: insertData, error: insertError } = await digitalChainDb
    .from('user_hierarchy')
    .insert({
      superior_id: mainHierarchy[0].superior_id,
      subordinate_id: mainHierarchy[0].subordinate_id,
      relationship_type: mainHierarchy[0].relationship_type,
      created_by: mainHierarchy[0].created_by
    })
    .select();

  if (insertError) {
    console.error('❌ Error inserting into Digital Chain Bank:', insertError);
    return;
  }

  console.log('✅ Successfully synced hierarchy to Digital Chain Bank:', insertData);
}

syncHierarchy().catch(console.error);
