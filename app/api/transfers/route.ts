import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const bankKey = searchParams.get('bank_key');

    if (!userId || !bankKey) {
      return NextResponse.json({ error: 'Missing user_id or bank_key' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    const { data: transfers, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch transfers error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const transfersWithBankDetails = await Promise.all(
      (transfers || []).map(async (transfer) => {
        if (transfer.transfer_type === 'bank') {
          const { data: bankDetails } = await supabase
            .from('bank_transfers')
            .select('*')
            .eq('transfer_id', transfer.id)
            .maybeSingle();

          return { ...transfer, bank_details: bankDetails };
        }
        return transfer;
      })
    );

    return NextResponse.json(transfersWithBankDetails);
  } catch (error) {
    console.error('Fetch transfers exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
