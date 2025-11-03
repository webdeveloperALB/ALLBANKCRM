import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bank_key, user_id, account_name, bank_name, account_number, routing_number, account_type, currency } = body;

    if (!bank_key || !user_id || !account_name || !bank_name || !account_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getBankClient(bank_key);

    const { data, error } = await supabase
      .from('external_accounts')
      .insert({
        user_id,
        account_name,
        bank_name,
        account_number,
        routing_number: routing_number || null,
        account_type: account_type || 'Checking',
        currency: currency || 'USD',
        is_verified: false,
      })
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
