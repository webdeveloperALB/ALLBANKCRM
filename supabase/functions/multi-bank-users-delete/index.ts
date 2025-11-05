import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { userId, bankKey } = await req.json();

    console.log('Delete user request:', { userId, bankKey });

    if (!userId || !bankKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const config = BANKS[bankKey as keyof typeof BANKS];
    if (!config) {
      return new Response(
        JSON.stringify({ error: 'Invalid bank key' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const client = createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log(`Attempting to delete user ${userId} from ${config.name}`);

    // Try to delete from auth.users, but don't fail if user doesn't exist there
    try {
      const { data: authUser } = await client.auth.admin.getUserById(userId);
      
      if (authUser?.user) {
        console.log('User found in auth.users, attempting deletion...');
        const { error: authError } = await client.auth.admin.deleteUser(userId);
        
        if (authError) {
          console.error(`Error deleting from auth.users: ${authError.message}`);
          // Don't fail - continue to delete from public tables
        } else {
          console.log('Successfully deleted from auth.users');
        }
      } else {
        console.log('User not found in auth.users, will delete from public tables only');
      }
    } catch (authErr) {
      console.log('Auth deletion error (continuing):', authErr);
      // Continue anyway
    }

    // Delete from public.users
    console.log('Deleting from public.users...');
    const { error: usersError } = await client
      .from('users')
      .delete()
      .eq('id', userId);

    if (usersError) {
      console.error(`Error deleting from public.users: ${usersError.message}`);
    } else {
      console.log('Successfully deleted from public.users');
    }

    // Delete from public.profiles
    console.log('Deleting from public.profiles...');
    await client.from('profiles').delete().eq('id', userId);

    // Delete related data
    console.log('Deleting related data...');
    await client.from('user_hierarchy').delete().eq('superior_id', userId);
    await client.from('user_hierarchy').delete().eq('subordinate_id', userId);
    await client.from('user_presence').delete().eq('user_id', userId);
    await client.from('account_activities').delete().eq('user_id', userId);
    await client.from('newcrypto_balances').delete().eq('user_id', userId);
    await client.from('crypto_transactions').delete().eq('user_id', userId);
    await client.from('transaction_history').delete().eq('user_id', userId);
    await client.from('external_accounts').delete().eq('user_id', userId);
    await client.from('transfers').delete().eq('user_id', userId);

    console.log('User deletion completed successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in delete function:', error);
    return new Response(
      JSON.stringify({ error: `Failed to delete user: ${error.message || 'Unknown error'}` }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});