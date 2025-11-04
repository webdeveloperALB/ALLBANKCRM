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
    const userId = url.searchParams.get('user_id') || '';
    const userBankKey = url.searchParams.get('user_bank_key') || '';
    const isAdmin = url.searchParams.get('is_admin') === 'true';
    const isManager = url.searchParams.get('is_manager') === 'true';
    const isSuperiorManager = url.searchParams.get('is_superiormanager') === 'true';

    const allUsers: any[] = [];
    let accessibleUserIds: string[] = [];
    let shouldApplyHierarchy = false;

    // If user is a manager or superior manager, check if they have assigned users
    if ((isManager || isSuperiorManager) && userId && userBankKey) {
      const userBankConfig = BANKS[userBankKey];
      if (userBankConfig) {
        const userClient = createClient(userBankConfig.url, userBankConfig.serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });

        try {
          console.log(`Checking hierarchy for user_id: ${userId} in bank: ${userBankKey}`);
          const { data: accessibleData, error: hierarchyError } = await userClient
            .rpc('get_accessible_users', { p_user_id: userId });

          if (hierarchyError) {
            console.error('Error in get_accessible_users RPC:', hierarchyError);
            console.error('Full error details:', JSON.stringify(hierarchyError));
            // If function doesn't exist or error, treat as no assigned users (show all)
            console.log('No hierarchy function available, showing all users (admin mode)');
            shouldApplyHierarchy = false;
          } else if (accessibleData && accessibleData.length > 0) {
            // Manager HAS assigned users - apply hierarchy filtering
            accessibleUserIds = accessibleData.map((item: any) => item.accessible_user_id);
            shouldApplyHierarchy = true;
            console.log('Manager has assigned users:', accessibleUserIds);
            console.log('Applying hierarchy filtering');
          } else {
            // Manager has NO assigned users - show all (admin privileges)
            console.log('Manager has no assigned users, showing all users (admin mode)');
            shouldApplyHierarchy = false;
          }
        } catch (err) {
          console.error('Exception calling get_accessible_users:', err);
          // On error, default to showing all users (admin mode)
          console.log('Error checking hierarchy, defaulting to admin mode (show all)');
          shouldApplyHierarchy = false;
        }
      }
    }

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

      // Apply hierarchy filter for managers/superior managers
      if (shouldApplyHierarchy) {
        if (key === userBankKey && accessibleUserIds.length > 0) {
          // Only show accessible users in their bank
          console.log(`Filtering users in ${key} to accessible IDs:`, accessibleUserIds);
          query = query.in('id', accessibleUserIds);
        } else {
          // Skip other banks entirely for managers
          console.log(`Skipping bank ${key} for manager/superior manager`);
          continue;
        }
      }

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