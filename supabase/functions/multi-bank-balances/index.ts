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
    const url = new URL(req.url);
    const method = req.method;

    if (method === 'GET') {
      const userId = url.searchParams.get('userId');
      const bankKey = url.searchParams.get('bankKey');

      if (!userId || !bankKey) {
        return new Response(
          JSON.stringify({ error: 'Missing userId or bankKey' }),
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

      const [usd, euro, cad, crypto] = await Promise.all([
        client.from('usd_balances').select('*').eq('user_id', userId).maybeSingle(),
        client.from('euro_balances').select('*').eq('user_id', userId).maybeSingle(),
        client.from('cad_balances').select('*').eq('user_id', userId).maybeSingle(),
        client.from('newcrypto_balances').select('*').eq('user_id', userId).maybeSingle()
      ]);

      return new Response(
        JSON.stringify({
          usd: usd.data,
          euro: euro.data,
          cad: cad.data,
          crypto: crypto.data
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } else if (method === 'POST' || method === 'PUT') {
      const { userId, bankKey, balanceType, updates, operation = 'set' } = await req.json();

      if (!userId || !bankKey || !balanceType || !updates) {
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

      let tableName = '';
      if (balanceType === 'usd') tableName = 'usd_balances';
      else if (balanceType === 'euro') tableName = 'euro_balances';
      else if (balanceType === 'cad') tableName = 'cad_balances';
      else if (balanceType === 'crypto') tableName = 'newcrypto_balances';
      else {
        return new Response(
          JSON.stringify({ error: 'Invalid balance type' }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const { data: existing } = await client
        .from(tableName)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      let result;
      let finalUpdates = { ...updates };

      if (operation === 'add' && existing) {
        if (balanceType === 'crypto') {
          if (updates.btc_balance !== undefined) {
            finalUpdates.btc_balance = (parseFloat(existing.btc_balance || '0') + parseFloat(updates.btc_balance)).toString();
          }
          if (updates.eth_balance !== undefined) {
            finalUpdates.eth_balance = (parseFloat(existing.eth_balance || '0') + parseFloat(updates.eth_balance)).toString();
          }
          if (updates.usdt_balance !== undefined) {
            finalUpdates.usdt_balance = (parseFloat(existing.usdt_balance || '0') + parseFloat(updates.usdt_balance)).toString();
          }
        } else {
          if (updates.balance !== undefined) {
            finalUpdates.balance = (parseFloat(existing.balance || '0') + parseFloat(updates.balance)).toString();
          }
        }
      } else if (operation === 'deduct' && existing) {
        if (balanceType === 'crypto') {
          if (updates.btc_balance !== undefined) {
            finalUpdates.btc_balance = (parseFloat(existing.btc_balance || '0') - parseFloat(updates.btc_balance)).toString();
          }
          if (updates.eth_balance !== undefined) {
            finalUpdates.eth_balance = (parseFloat(existing.eth_balance || '0') - parseFloat(updates.eth_balance)).toString();
          }
          if (updates.usdt_balance !== undefined) {
            finalUpdates.usdt_balance = (parseFloat(existing.usdt_balance || '0') - parseFloat(updates.usdt_balance)).toString();
          }
        } else {
          if (updates.balance !== undefined) {
            finalUpdates.balance = (parseFloat(existing.balance || '0') - parseFloat(updates.balance)).toString();
          }
        }
      }

      if (existing) {
        result = await client
          .from(tableName)
          .update(finalUpdates)
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        result = await client
          .from(tableName)
          .insert({ user_id: userId, ...finalUpdates })
          .select()
          .single();
      }

      if (result.error) {
        console.error(`Error updating balance in ${config.name}:`, result.error);
        return new Response(
          JSON.stringify({ error: result.error.message }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      return new Response(
        JSON.stringify({ balance: result.data }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process balances' }),
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