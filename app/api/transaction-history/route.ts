import { NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bankKey = searchParams.get('bankKey');
    const userId = searchParams.get('userId');

    if (!bankKey || !userId) {
      return NextResponse.json(
        { error: 'Bank key and user ID are required' },
        { status: 400 }
      );
    }

    const supabase = getBankClient(bankKey);

    const { data, error } = await supabase
      .from('TransactionHistory')
      .select('*')
      .eq('uuid', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch transaction history' },
      { status: 500 }
    );
  }
}
