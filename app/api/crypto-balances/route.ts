import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bankKey = searchParams.get('bankKey');
    const userId = searchParams.get('userId');

    if (!bankKey || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    const { data, error } = await supabase
      .from('newcrypto_balances')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Fetch crypto balances error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch crypto balances exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
