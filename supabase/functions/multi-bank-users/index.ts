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
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '18');
    const bankFilter = url.searchParams.get('bank') || 'all';
    const kycFilter = url.searchParams.get('kyc') || 'all';
    const search = url.searchParams.get('search') || '';

    const allUsers: any[] = [];
    const perBankLimit = Math.ceil(perPage / 3);

    for (const [key, config] of Object.entries(BANKS)) {
      if (bankFilter !== 'all' && key !== bankFilter) {
        continue;
      }

      const client = createClient(config.url, config.serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      let query = client
        .from('users')
        .select('*', { count: 'exact' });

      if (kycFilter !== 'all') {
        query = query.eq('kyc_status', kycFilter);
      }

      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }

      const offset = (page - 1) * perBankLimit;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + perBankLimit - 1);

      if (error) {
        console.error(`Error fetching users from ${config.name}:`, error);
        continue;
      }

      if (data) {
        const usersWithBank = data.map((user: any) => ({
          ...user,
          bank_key: key,
          bank_name: config.name,
          bank_total_count: count || 0
        }));
        allUsers.push(...usersWithBank);
      }
    }

    const totalCount = allUsers.reduce((sum, user) => {
      return sum + (user.bank_total_count || 0);
    }, 0);

    const totalPages = Math.ceil(totalCount / perPage);

    return new Response(
      JSON.stringify({
        users: allUsers,
        pagination: {
          page,
          perPage,
          totalCount,
          totalPages
        }
      }),
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
      JSON.stringify({ error: 'Failed to fetch users' }),
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