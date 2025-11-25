import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, bank_key, beneficiary, iban, bic, bank_name } = body;

    if (!user_id || !bank_key) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getBankClient(bank_key);

    const { data: existing, error: checkError } = await supabase
      .from('user_bank_details')
      .select('id')
      .eq('user_id', user_id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check user bank details error:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    let data, error;

    if (existing) {
      const result = await supabase
        .from('user_bank_details')
        .update({
          beneficiary: beneficiary || '',
          iban: iban || '',
          bic: bic || '',
          bank_name: bank_name || '',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('user_bank_details')
        .insert({
          user_id,
          beneficiary: beneficiary || '',
          iban: iban || '',
          bic: bic || '',
          bank_name: bank_name || '',
        })
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Update/Insert user bank details error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update user bank details exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
