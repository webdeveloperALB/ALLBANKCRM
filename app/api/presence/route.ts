import { NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const bankKey = searchParams.get('bank_key');

    if (!userId || !bankKey) {
      return NextResponse.json(
        { error: 'Missing user_id or bank_key' },
        { status: 400 }
      );
    }

    const supabase = getBankClient(bankKey);

    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching presence:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || { is_online: false });
  } catch (error: any) {
    console.error('Error in presence GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
