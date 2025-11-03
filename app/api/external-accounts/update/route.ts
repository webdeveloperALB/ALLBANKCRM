import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bank_key, account_id, account_name, bank_name, account_number, routing_number, account_type, currency, is_verified } = body;

    if (!bank_key || !account_id) {
      return NextResponse.json({ error: 'Missing bank_key or account_id' }, { status: 400 });
    }

    const supabase = getBankClient(bank_key);

    const updateData: any = {};
    if (account_name !== undefined) updateData.account_name = account_name;
    if (bank_name !== undefined) updateData.bank_name = bank_name;
    if (account_number !== undefined) updateData.account_number = account_number;
    if (routing_number !== undefined) updateData.routing_number = routing_number;
    if (account_type !== undefined) updateData.account_type = account_type;
    if (currency !== undefined) updateData.currency = currency;
    if (is_verified !== undefined) updateData.is_verified = is_verified;

    const { data, error } = await supabase
      .from('external_accounts')
      .update(updateData)
      .eq('id', account_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
