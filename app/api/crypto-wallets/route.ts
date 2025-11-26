import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const bankKey = searchParams.get('bank_key');

    if (!bankKey) {
      return NextResponse.json({ error: 'Missing bank_key' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    let query = supabase
      .from('crypto_wallets')
      .select('*');

    if (userId === 'null' || userId === null) {
      query = query.is('user_id', null);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const { data: wallets, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch crypto wallets error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(wallets || []);
  } catch (error) {
    console.error('Fetch crypto wallets exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
