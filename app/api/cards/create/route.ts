import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bankKey,
      userId,
      card_number,
      card_holder_name,
      expiry_month,
      expiry_year,
      card_type,
      spending_limit,
      status,
      cvv,
      pin,
      issuer,
      network,
      card_design,
      account_number,
      routing_number,
      is_activated,
      daily_limit,
      atm_limit,
      international_enabled,
      contactless_enabled,
      online_enabled,
      delivery_address,
      notes,
      emergency_phone
    } = body;

    if (!bankKey || !userId || !card_number || !card_holder_name || !expiry_month || !expiry_year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    const insertData: any = {
      user_id: userId,
      card_number,
      card_holder_name,
      expiry_month,
      expiry_year,
      card_type: card_type || 'Virtual',
      spending_limit: spending_limit || 5000.00,
      status: status || 'Active',
      cvv: cvv || '000',
      pin: pin || '0000',
      issuer: issuer || 'Digital Chain Bank',
      network: network || 'Visa',
      card_design: card_design || 'orange-gradient',
      routing_number: routing_number || '123456789',
      is_activated: is_activated || false,
      daily_limit: daily_limit || 1000.00,
      atm_limit: atm_limit || 500.00,
      international_enabled: international_enabled || false,
      contactless_enabled: contactless_enabled !== undefined ? contactless_enabled : true,
      online_enabled: online_enabled !== undefined ? online_enabled : true,
      is_replacement: false
    };

    if (account_number) insertData.account_number = account_number;
    if (delivery_address) insertData.delivery_address = delivery_address;
    if (notes) insertData.notes = notes;
    if (emergency_phone) insertData.emergency_phone = emergency_phone;

    if (is_activated) {
      insertData.activated_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('cards')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Create card error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create card exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
