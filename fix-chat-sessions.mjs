import { createClient } from '@supabase/supabase-js';

const BANKS = {
  'digitalchain': {
    url: 'https://bzemaxsqlhydefzjehup.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZW1heHNxbGh5ZGVmemplaHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDI2ODYsImV4cCI6MjA2NzAxODY4Nn0.4Eb9jPeOF4o3QHUfHXf2QG4J1S0F3GTj1pfGXzDNW6Q'
  },
  'cayman': {
    url: 'https://vcvgsgjujqulmdhirfmo.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdmdzZ2p1anF1bG1kaGlyZm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDI3MzgsImV4cCI6MjA2NzAxODczOH0.im6wms-sHa_ruu2gWyH8c-R5HqxkSJ2aj-r06P9Cnm8'
  },
  'lithuanian': {
    url: 'https://ofymsjyvkhivkexasnij.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meW1zanl2a2hpdmtleGFzbmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDI3NzIsImV4cCI6MjA2NzAxODc3Mn0.C-JTxgjW3ZSNBLBQ5GPHYKR_ludzdGT6W38BjwvVRes'
  }
};

async function fixChatSessions() {
  for (const [bankName, config] of Object.entries(BANKS)) {
    console.log(`\n🏦 Processing ${bankName.toUpperCase()}...`);

    const client = createClient(config.url, config.key);

    // Get all sessions without user_id
    const { data: sessions, error: sessionsError } = await client
      .from('chat_sessions')
      .select('id, client_name, client_email')
      .is('client_user_id', null);

    if (sessionsError) {
      console.error(`❌ Error fetching sessions:`, sessionsError);
      continue;
    }

    console.log(`📋 Found ${sessions?.length || 0} sessions without user_id`);

    if (!sessions || sessions.length === 0) continue;

    let updated = 0;
    let notFound = 0;

    for (const session of sessions) {
      if (!session.client_email || session.client_email === 'test') {
        notFound++;
        continue;
      }

      // Find user by email
      const { data: user, error: userError } = await client
        .from('users')
        .select('id')
        .eq('email', session.client_email)
        .maybeSingle();

      if (userError) {
        console.error(`  ⚠️ Error finding user for ${session.client_email}:`, userError.message);
        continue;
      }

      if (!user) {
        console.log(`  ⚠️ No user found for email: ${session.client_email}`);
        notFound++;
        continue;
      }

      // Update session with user_id
      const { error: updateError } = await client
        .from('chat_sessions')
        .update({ client_user_id: user.id })
        .eq('id', session.id);

      if (updateError) {
        console.error(`  ❌ Error updating session for ${session.client_name}:`, updateError.message);
      } else {
        console.log(`  ✅ Updated: ${session.client_name} (${session.client_email})`);
        updated++;
      }
    }

    console.log(`\n📊 ${bankName.toUpperCase()} Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️ No user found: ${notFound}`);
  }

  console.log(`\n🎉 Done! All chat sessions processed.`);
}

fixChatSessions().catch(console.error);
