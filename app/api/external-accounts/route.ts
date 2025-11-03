import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const bankKey = searchParams.get('bank_key');

    if (!userId || !bankKey) {
      return NextResponse.json({ error: 'Missing user_id or bank_key' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    const { data, error } = await supabase
      .from('external_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
