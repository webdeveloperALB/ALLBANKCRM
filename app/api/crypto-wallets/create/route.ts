import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, bank_key, crypto_type, wallet_address, label, symbol, is_active } = body;

    if (!user_id || !bank_key || !crypto_type || !wallet_address || !label || !symbol) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validCryptoTypes = ['bitcoin', 'ethereum', 'usdt_erc20', 'usdt_trc20'];
    if (!validCryptoTypes.includes(crypto_type)) {
      return NextResponse.json({ error: 'Invalid crypto type' }, { status: 400 });
    }

    const supabase = getBankClient(bank_key);

    const { data, error } = await supabase
      .from('crypto_wallets')
      .insert({
        user_id,
        crypto_type,
        wallet_address,
        label,
        symbol,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Create crypto wallet error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create crypto wallet exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
