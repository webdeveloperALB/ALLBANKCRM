import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bankKey,
      transactionId,
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

    if (!bankKey || !transactionId) {
      return NextResponse.json({ error: 'Missing required fields: bankKey or transactionId' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    console.log('Update request body:', JSON.stringify(body, null, 2));

    const updateData: any = {};

    if (transaction_type !== undefined) updateData.transaction_type = transaction_type;

    if (amount !== undefined && amount !== '' && amount !== null) {
      const parsed = parseFloat(amount);
      if (!isNaN(parsed)) updateData.amount = parsed;
    }

    if (currency !== undefined) updateData.currency = currency;
    if (crypto_type !== undefined) updateData.crypto_type = crypto_type;
    if (description !== undefined) updateData.description = description || null;
    if (status !== undefined) updateData.status = status;

    if (price_per_unit !== undefined) {
      if (price_per_unit === '' || price_per_unit === null) {
        updateData.price_per_unit = null;
      } else {
        const parsed = parseFloat(price_per_unit);
        if (!isNaN(parsed)) updateData.price_per_unit = parsed;
      }
    }

    if (total_value !== undefined) {
      if (total_value === '' || total_value === null) {
        updateData.total_value = null;
      } else {
        const parsed = parseFloat(total_value);
        if (!isNaN(parsed)) updateData.total_value = parsed;
      }
    }

    if (wallet_address !== undefined) {
      updateData.wallet_address = wallet_address === '' ? null : wallet_address;
    }

    if (network !== undefined) {
      updateData.network = network === '' ? null : network;
    }

    if (transaction_hash !== undefined) {
      updateData.transaction_hash = transaction_hash === '' ? null : transaction_hash;
    }

    if (gas_fee !== undefined) {
      if (gas_fee === '' || gas_fee === null) {
        updateData.gas_fee = null;
      } else {
        const parsed = parseFloat(gas_fee);
        if (!isNaN(parsed)) updateData.gas_fee = parsed;
      }
    }

    if (admin_notes !== undefined) {
      updateData.admin_notes = admin_notes === '' ? null : admin_notes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    console.log('Final update data:', JSON.stringify(updateData, null, 2));

    const { data, error } = await supabase
      .from('crypto_transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Update crypto transaction error:', error);
      return NextResponse.json({ error: error.message || 'Database update failed' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Transaction not found or not updated' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update crypto transaction exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
