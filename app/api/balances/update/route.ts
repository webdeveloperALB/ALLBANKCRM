import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankKey, userId, balances, operation = 'set' } = body;

    if (!bankKey || !userId || !balances) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/multi-bank-balances`;

    const updates: any = {};

    if (balances.usd !== undefined) {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          bankKey,
          balanceType: 'usd',
          operation,
          updates: { balance: balances.usd }
        })
      });

      if (!response.ok) {
        console.error('USD balance update failed');
      }
    }

    if (balances.euro !== undefined) {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          bankKey,
          balanceType: 'euro',
          operation,
          updates: { balance: balances.euro }
        })
      });

      if (!response.ok) {
        console.error('Euro balance update failed');
      }
    }

    if (balances.cad !== undefined) {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          bankKey,
          balanceType: 'cad',
          operation,
          updates: { balance: balances.cad }
        })
      });

      if (!response.ok) {
        console.error('CAD balance update failed');
      }
    }

    if (balances.crypto !== undefined) {
      const cryptoUpdates: any = {};
      if (balances.crypto.btc !== undefined) cryptoUpdates.btc_balance = balances.crypto.btc;
      if (balances.crypto.eth !== undefined) cryptoUpdates.eth_balance = balances.crypto.eth;
      if (balances.crypto.usdt !== undefined) cryptoUpdates.usdt_balance = balances.crypto.usdt;

      if (Object.keys(cryptoUpdates).length > 0) {
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            bankKey,
            balanceType: 'crypto',
            operation,
            updates: cryptoUpdates
          })
        });

        if (!response.ok) {
          console.error('Crypto balance update failed');
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating balances:', error);
    return NextResponse.json({ error: 'Failed to update balances' }, { status: 500 });
  }
}
