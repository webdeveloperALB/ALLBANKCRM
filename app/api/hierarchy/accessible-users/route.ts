import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';
import { BANKS } from '@/lib/bank-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const bankKey = searchParams.get('bank_key');
    const isAdmin = searchParams.get('is_admin') === 'true';
    const isManager = searchParams.get('is_manager') === 'true';
    const isSuperiorManager = searchParams.get('is_superiormanager') === 'true';

    if (!userId || !bankKey) {
      return NextResponse.json({ error: 'User ID and bank key are required' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    // If pure admin (not manager or superior manager), return all users from all banks
    if (isAdmin && !isManager && !isSuperiorManager) {
      const allUsers = [];

      for (const [key, config] of Object.entries(BANKS)) {
        const bankSupabase = getBankClient(key);
        const { data, error } = await bankSupabase
          .from('users')
          .select('*')
          .order('email');

        if (!error && data) {
          allUsers.push(...data.map((user: any) => ({
            ...user,
            bank_key: key,
            bank_origin: config.name
          })));
        }
      }

      return NextResponse.json(allUsers);
    }

    // If manager or superior manager, get accessible users through hierarchy
    const { data: accessibleData, error: accessibleError } = await supabase
      .rpc('get_accessible_users', { user_id: userId });

    if (accessibleError) {
      console.error('Error calling get_accessible_users:', accessibleError);
      // If function doesn't exist or fails, return empty array
      return NextResponse.json([]);
    }

    if (!accessibleData || accessibleData.length === 0) {
      return NextResponse.json([]);
    }

    // Get full user details for accessible user IDs
    const userIds = accessibleData.map((item: any) => item.accessible_user_id);

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds)
      .order('email');

    if (usersError) throw usersError;

    // Add bank info to each user
    const usersWithBankInfo = (users || []).map((user: any) => ({
      ...user,
      bank_key: bankKey,
      bank_origin: BANKS[bankKey].name
    }));

    return NextResponse.json(usersWithBankInfo);
  } catch (error: any) {
    console.error('Error fetching accessible users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accessible users' },
      { status: 500 }
    );
  }
}
