import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bankKey,
      userId,
      transaction_type,
      amount,
      currency,
      crypto_type,
      description,
      status,
      price_per_unit,
      total_value,
      wallet_address,
      network,
      transaction_hash,
      gas_fee,
      admin_notes
    } = body;

    if (!bankKey || !userId) {
      return NextResponse.json({ error: 'Missing required fields: bankKey or userId' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    const insertData: any = {
      user_id: userId,
      transaction_type: transaction_type || 'deposit',
      amount: amount || 0,
      currency: currency || 'USD',
      crypto_type: crypto_type || 'BTC',
      description: description || '',
      status: status || 'Pending'
    };

    if (price_per_unit !== undefined) insertData.price_per_unit = price_per_unit;
    if (total_value !== undefined) insertData.total_value = total_value;
    if (wallet_address !== undefined) insertData.wallet_address = wallet_address;
    if (network !== undefined) insertData.network = network;
    if (transaction_hash !== undefined) insertData.transaction_hash = transaction_hash;
    if (gas_fee !== undefined) insertData.gas_fee = gas_fee;
    if (admin_notes !== undefined) insertData.admin_notes = admin_notes;

    const { data, error } = await supabase
      .from('crypto_transactions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Create crypto transaction error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create crypto transaction exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
