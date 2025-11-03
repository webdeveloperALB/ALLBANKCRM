import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bankKey,
      cardId,
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

    if (!bankKey || !cardId) {
      return NextResponse.json({ error: 'Missing required fields: bankKey or cardId' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    const updateData: any = {};
    if (card_number !== undefined) updateData.card_number = card_number;
    if (card_holder_name !== undefined) updateData.card_holder_name = card_holder_name;
    if (expiry_month !== undefined) updateData.expiry_month = expiry_month;
    if (expiry_year !== undefined) updateData.expiry_year = expiry_year;
    if (card_type !== undefined) updateData.card_type = card_type;
    if (spending_limit !== undefined) updateData.spending_limit = spending_limit;
    if (status !== undefined) updateData.status = status;
    if (cvv !== undefined) updateData.cvv = cvv;
    if (pin !== undefined) updateData.pin = pin;
    if (issuer !== undefined) updateData.issuer = issuer;
    if (network !== undefined) updateData.network = network;
    if (card_design !== undefined) updateData.card_design = card_design;
    if (account_number !== undefined) updateData.account_number = account_number;
    if (routing_number !== undefined) updateData.routing_number = routing_number;
    if (is_activated !== undefined) {
      updateData.is_activated = is_activated;
      if (is_activated && !body.activated_at) {
        updateData.activated_at = new Date().toISOString();
      }
    }
    if (daily_limit !== undefined) updateData.daily_limit = daily_limit;
    if (atm_limit !== undefined) updateData.atm_limit = atm_limit;
    if (international_enabled !== undefined) updateData.international_enabled = international_enabled;
    if (contactless_enabled !== undefined) updateData.contactless_enabled = contactless_enabled;
    if (online_enabled !== undefined) updateData.online_enabled = online_enabled;
    if (delivery_address !== undefined) updateData.delivery_address = delivery_address;
    if (notes !== undefined) updateData.notes = notes;
    if (emergency_phone !== undefined) updateData.emergency_phone = emergency_phone;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cards')
      .update(updateData)
      .eq('id', cardId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Update card error:', error);
      return NextResponse.json({ error: error.message || 'Database update failed' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Card not found or not updated' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update card exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
