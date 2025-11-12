import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase-env';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bankKey = searchParams.get('bankKey');
    const userId = searchParams.get('userId');

    if (!bankKey || !userId) {
      return NextResponse.json(
        { error: 'Missing bankKey or userId' },
        { status: 400 }
      );
    }

    const { supabaseUrl, supabaseAnonKey: supabaseKey, isConfigured } = getSupabaseConfig();

    if (!isConfigured) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/multi-bank-balances?userId=${userId}&bankKey=${bankKey}`;

    const response = await fetch(edgeFunctionUrl, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Edge function returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      usd: data.usd?.balance || '0.00',
      euro: data.euro?.balance || '0.00',
      cad: data.cad?.balance || '0.00',
      btc: data.crypto?.btc_balance || '0.00000000',
      eth: data.crypto?.eth_balance || '0.00000000',
      usdt: data.crypto?.usdt_balance || '0.000000'
    });
  } catch (error) {
    console.error('Error fetching balances:', error);
    return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 });
  }
}
