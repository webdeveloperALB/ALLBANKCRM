import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankKey, userId, btc_balance, eth_balance, usdt_balance } = body;

    if (!bankKey || !userId) {
      return NextResponse.json({ error: 'Missing required fields: bankKey or userId' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    const updateData: any = {};
    if (btc_balance !== undefined) updateData.btc_balance = btc_balance;
    if (eth_balance !== undefined) updateData.eth_balance = eth_balance;
    if (usdt_balance !== undefined) updateData.usdt_balance = usdt_balance;
    updateData.updated_at = new Date().toISOString();

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: existingData } = await supabase
      .from('newcrypto_balances')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingData) {
      const { data, error } = await supabase
        .from('newcrypto_balances')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Update crypto balances error:', error);
        return NextResponse.json({ error: error.message || 'Database update failed' }, { status: 500 });
      }

      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from('newcrypto_balances')
        .insert({
          user_id: userId,
          btc_balance: btc_balance || 0,
          eth_balance: eth_balance || 0,
          usdt_balance: usdt_balance || 0
        })
        .select()
        .single();

      if (error) {
        console.error('Create crypto balances error:', error);
        return NextResponse.json({ error: error.message || 'Database insert failed' }, { status: 500 });
      }

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Update crypto balances exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
