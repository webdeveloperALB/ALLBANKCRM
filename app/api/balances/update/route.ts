import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase-env';

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

    const { supabaseUrl, supabaseAnonKey: supabaseKey, isConfigured } = getSupabaseConfig();

    if (!isConfigured) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/multi-bank-balances`;

    const updatePromises: Promise<Response>[] = [];
    const errors: string[] = [];

    if (balances.usd !== undefined) {
      updatePromises.push(
        fetch(edgeFunctionUrl, {
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
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            errors.push(`USD: ${errorData.error || 'Update failed'}`);
          }
          return response;
        })
      );
    }

    if (balances.euro !== undefined) {
      updatePromises.push(
        fetch(edgeFunctionUrl, {
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
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            errors.push(`EUR: ${errorData.error || 'Update failed'}`);
          }
          return response;
        })
      );
    }

    if (balances.cad !== undefined) {
      updatePromises.push(
        fetch(edgeFunctionUrl, {
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
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            errors.push(`CAD: ${errorData.error || 'Update failed'}`);
          }
          return response;
        })
      );
    }

    if (balances.crypto !== undefined) {
      const cryptoUpdates: any = {};
      if (balances.crypto.btc !== undefined) cryptoUpdates.btc_balance = balances.crypto.btc;
      if (balances.crypto.eth !== undefined) cryptoUpdates.eth_balance = balances.crypto.eth;
      if (balances.crypto.usdt !== undefined) cryptoUpdates.usdt_balance = balances.crypto.usdt;

      if (Object.keys(cryptoUpdates).length > 0) {
        updatePromises.push(
          fetch(edgeFunctionUrl, {
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
          }).then(async (response) => {
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
              errors.push(`Crypto: ${errorData.error || 'Update failed'}`);
            }
            return response;
          })
        );
      }
    }

    await Promise.all(updatePromises);

    if (errors.length > 0) {
      console.error('Balance update errors:', errors);
      return NextResponse.json(
        { error: `Some updates failed: ${errors.join(', ')}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating balances:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update balances' },
      { status: 500 }
    );
  }
}
