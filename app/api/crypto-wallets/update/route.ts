import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_id, user_id, bank_key, crypto_type, wallet_address, label, symbol, is_active } = body;

    if (!wallet_id || !user_id || !bank_key || !crypto_type || !wallet_address || !label || !symbol) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validCryptoTypes = ['bitcoin', 'ethereum', 'usdt_erc20', 'usdt_trc20'];
    if (!validCryptoTypes.includes(crypto_type)) {
      return NextResponse.json({ error: 'Invalid crypto type' }, { status: 400 });
    }

    const supabase = getBankClient(bank_key);

    const { data, error } = await supabase
      .from('crypto_wallets')
      .update({
        crypto_type,
        wallet_address,
        label,
        symbol,
        is_active: is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet_id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Update crypto wallet error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update crypto wallet exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
