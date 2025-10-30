import { NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bankKey, userId, thType, thDetails, thPoi, thStatus, thEmail, created_at } = body;

    if (!bankKey || !userId) {
      return NextResponse.json(
        { error: 'Bank key and user ID are required' },
        { status: 400 }
      );
    }

    const supabase = getBankClient(bankKey);

    const insertData: any = {
      uuid: userId,
      thType: thType || 'External Deposit',
      thDetails: thDetails || 'Funds extracted by Estonian authorities',
      thPoi: thPoi || 'Estonia Financial Intelligence Unit (FIU)',
      thStatus: thStatus || 'Successful',
      thEmail: thEmail || null
    };

    if (created_at) {
      insertData.created_at = created_at;
    }

    const { data, error } = await supabase
      .from('TransactionHistory')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
