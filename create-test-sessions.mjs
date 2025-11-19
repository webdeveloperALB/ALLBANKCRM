import { createClient } from '@supabase/supabase-js';

const BANKS = {
  'cayman': {
    name: 'Cayman Bank',
    url: 'https://rswfgdklidaljidagkxp.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzd2ZnZGtsaWRhbGppZGFna3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTkwNzcsImV4cCI6MjA3NzIzNTA3N30.HJGELtx7mAdR4BPmYAqtpVb-pzpF1fNHVrN0j2go870'
  },
  'lithuanian': {
    name: 'Lithuanian Bank',
    url: 'https://asvvmnifwvnyrxvxewvv.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdnZtbmlmd3ZueXJ4dnhld3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjM2NjEsImV4cCI6MjA3NzEzOTY2MX0.im3MdzSeeNBDg3gSm8AIhYYZRHM2grfEfnyb3OzjOgY'
  },
  'digitalchain': {
    name: 'Digital Chain Bank',
    url: 'https://bzemaxsqlhydefzjehup.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZW1heHNxbGh5ZGVmemplaHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDI2ODYsImV4cCI6MjA2NzAxODY4Nn0.4Eb9jPeOF4o3QHUfHXf2QG4J1S0F3GTj1pfGXzDNW6Q'
  }
};

async function createTestSessions() {
  for (const [bankKey, bankConfig] of Object.entries(BANKS)) {
    console.log(`\n🏦 Creating test session in ${bankConfig.name}...`);
    
    const client = createClient(bankConfig.url, bankConfig.anonKey);
    
    const { data: session, error: sessionError } = await client
      .from('chat_sessions')
      .insert({
        client_name: `Test Client from ${bankConfig.name}`,
        client_email: `test@${bankKey}.com`,
        status: 'active'
      })
      .select()
      .single();
    
    if (sessionError) {
      console.error(`❌ Error creating session:`, sessionError);
      continue;
    }
    
    console.log(`✅ Created session: ${session.id}`);
    
    const { data: message, error: messageError } = await client
      .from('chat_messages')
      .insert({
        session_id: session.id,
        sender_type: 'client',
        sender_name: session.client_name,
        message: `Hello! This is a test message from ${bankConfig.name}. Can you help me?`,
        read_by_admin: false,
        read_by_client: true
      })
      .select()
      .single();
    
    if (messageError) {
      console.error(`❌ Error creating message:`, messageError);
    } else {
      console.log(`✅ Created unread message`);
    }
  }
  
  console.log(`\n🎉 Done! Created test sessions in all 3 banks.`);
}

createTestSessions().catch(console.error);
