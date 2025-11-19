import { createClient } from '@supabase/supabase-js';

// Main database (where chat sessions are stored)
const mainDb = createClient(
  'https://hlxvizfxgajkrxvxktxj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseHZpemZ4Z2Fqa3J4dnhrdHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MjMxMjEsImV4cCI6MjA3ODQ5OTEyMX0.1bdtZX5s7rfbgMX76F3d4_ituZkV_q5nYH_OX1-4xv8'
);

async function addHierarchy() {
  console.log('📝 Adding hierarchy relationship to main database...');
  console.log('   Manager: a846640c-cda7-42e4-8557-b5ad9a7303d5');
  console.log('   User: 41358644-8d33-4b11-a8d8-b25a4f3a19f5');

  // Check if table exists and has data
  const { data: existing, error: checkError } = await mainDb
    .from('user_hierarchy')
    .select('*')
    .limit(1);

  if (checkError) {
    console.error('❌ Error checking table:', checkError);
    console.log('\nTable might not exist. Creating would require migrations.');
    return;
  }

  console.log('✅ Table exists');

  // Check if relationship already exists
  const { data: existingRel, error: existError } = await mainDb
    .from('user_hierarchy')
    .select('*')
    .eq('superior_id', 'a846640c-cda7-42e4-8557-b5ad9a7303d5')
    .eq('subordinate_id', '41358644-8d33-4b11-a8d8-b25a4f3a19f5');

  if (existError) {
    console.error('❌ Error checking existing:', existError);
    return;
  }

  if (existingRel && existingRel.length > 0) {
    console.log('ℹ️ Relationship already exists');
    return;
  }

  // Insert the relationship
  const { data: insertData, error: insertError } = await mainDb
    .from('user_hierarchy')
    .insert({
      superior_id: 'a846640c-cda7-42e4-8557-b5ad9a7303d5',
      subordinate_id: '41358644-8d33-4b11-a8d8-b25a4f3a19f5',
      relationship_type: 'manager_to_user'
    })
    .select();

  if (insertError) {
    console.error('❌ Error inserting:', insertError);
    return;
  }

  console.log('✅ Successfully added hierarchy relationship:', insertData);
}

addHierarchy().catch(console.error);
