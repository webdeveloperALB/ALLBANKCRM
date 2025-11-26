import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_id, user_id, bank_key } = body;

    if (!wallet_id || !bank_key) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getBankClient(bank_key);

    let query = supabase
      .from('crypto_wallets')
      .delete()
      .eq('id', wallet_id);

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { error } = await query;

    if (error) {
      console.error('Delete crypto wallet error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete crypto wallet exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
