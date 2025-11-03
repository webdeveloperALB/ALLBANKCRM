import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankKey, transactionId } = body;

    if (!bankKey || !transactionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    const { error } = await supabase
      .from('crypto_transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      console.error('Delete crypto transaction error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete crypto transaction exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
