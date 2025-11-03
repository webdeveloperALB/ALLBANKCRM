import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bank_key, account_id } = body;

    if (!bank_key || !account_id) {
      return NextResponse.json({ error: 'Missing bank_key or account_id' }, { status: 400 });
    }

    const supabase = getBankClient(bank_key);

    const { error } = await supabase
      .from('external_accounts')
      .delete()
      .eq('id', account_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
