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

    if (!amount || amount === '' || amount === null) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    const insertData: any = {
      user_id: userId,
      transaction_type: transaction_type || 'Transfer',
      amount: parseFloat(amount) || 0,
      currency: currency || 'USD',
      crypto_type: crypto_type || 'BTC',
      description: description || null,
      status: status || 'Pending'
    };

    if (price_per_unit && price_per_unit !== '' && price_per_unit !== null) {
      const parsed = parseFloat(price_per_unit);
      if (!isNaN(parsed)) insertData.price_per_unit = parsed;
    }

    // Handle gas_fee first
    if (gas_fee !== undefined && gas_fee !== '' && gas_fee !== null) {
      const parsed = parseFloat(gas_fee);
      if (!isNaN(parsed)) insertData.gas_fee = parsed;
    } else {
      insertData.gas_fee = 0;
    }

    // Calculate total_value: if provided use it, otherwise calculate from amount + gas_fee
    if (total_value && total_value !== '' && total_value !== null) {
      const parsed = parseFloat(total_value);
      if (!isNaN(parsed)) insertData.total_value = parsed;
    } else {
      // Auto-calculate total_value from amount + gas_fee
      insertData.total_value = insertData.amount + (insertData.gas_fee || 0);
    }

    if (wallet_address && wallet_address !== '') {
      insertData.wallet_address = wallet_address;
    }

    if (network && network !== '') {
      insertData.network = network;
    }

    if (transaction_hash && transaction_hash !== '') {
      insertData.transaction_hash = transaction_hash;
    }

    if (admin_notes && admin_notes !== '') {
      insertData.admin_notes = admin_notes;
    }

    console.log('Insert data:', JSON.stringify(insertData, null, 2));

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
