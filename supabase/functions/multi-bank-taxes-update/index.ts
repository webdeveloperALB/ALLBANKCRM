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
    const { userId, bankKey, taxes, on_hold, paid, created_at, updated_at } = await req.json();

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

    const createdAtValue = created_at || new Date().toISOString();
    const updatedAtValue = updated_at || new Date().toISOString();
    const taxesValue = taxes || '0.00';
    const onHoldValue = on_hold || '0.00';
    const paidValue = paid || '0.00';

    const { data, error } = await client
      .from('taxes')
      .upsert({
        user_id: userId,
        taxes: taxesValue,
        on_hold: onHoldValue,
        paid: paidValue,
        created_at: createdAtValue,
        updated_at: updatedAtValue
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating taxes:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
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
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update taxes' }),
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