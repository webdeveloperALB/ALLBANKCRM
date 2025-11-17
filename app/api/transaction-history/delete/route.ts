import { NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log('DELETE endpoint hit (POST method)');

  try {
    const body = await request.json();
    console.log('Parsed body:', body);

    const { bankKey, transactionId } = body;
    console.log('Delete request received:', { bankKey, transactionId });

    if (!bankKey || !transactionId) {
      console.error('Missing required fields:', { bankKey, transactionId });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);
    console.log('Got bank client for:', bankKey);

    const { data, error } = await supabase
      .from('TransactionHistory')
      .delete()
      .eq('id', transactionId)
      .select();

    console.log('Delete result:', { data, error, rowCount: data?.length });

    if (error) {
      console.error('Delete transaction error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.warn('No rows deleted - transaction not found');
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: data });
  } catch (error) {
    console.error('Delete transaction exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
