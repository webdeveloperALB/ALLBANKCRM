import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';
import { BANKS } from '@/lib/bank-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const bankKey = searchParams.get('bank_key');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!bankKey) {
      return NextResponse.json({ error: 'Bank key is required' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    let queryBuilder = supabase
      .from('users')
      .select('id, email, full_name, is_admin, is_manager, is_superiormanager, bank_origin')
      .eq('is_manager', false)
      .eq('is_superiormanager', false)
      .order('email')
      .limit(limit);

    // If there's a search query, filter by email or full_name
    if (query) {
      queryBuilder = queryBuilder.or(`email.ilike.%${query}%,full_name.ilike.%${query}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;

    // Add bank info to each user
    const usersWithBankInfo = (data || []).map((user: any) => ({
      ...user,
      bank_key: bankKey,
      bank_origin: user.bank_origin || BANKS[bankKey].name
    }));

    return NextResponse.json(usersWithBankInfo);
  } catch (error: any) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search users' },
      { status: 500 }
    );
  }
}
