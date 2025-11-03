import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankKey, transactionId, thType, thDetails, thPoi, thStatus, thEmail, created_at } = body;

    console.log('Update transaction request:', { bankKey, transactionId });

    if (!bankKey || !transactionId) {
      return NextResponse.json({ error: 'Missing required fields: bankKey or transactionId' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    const updateData: any = {};
    if (thType !== undefined) updateData.thType = thType;
    if (thDetails !== undefined) updateData.thDetails = thDetails;
    if (thPoi !== undefined) updateData.thPoi = thPoi;
    if (thStatus !== undefined) updateData.thStatus = thStatus;
    if (thEmail !== undefined) updateData.thEmail = thEmail;
    if (created_at !== undefined) updateData.created_at = created_at;

    console.log('Update data:', updateData);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('TransactionHistory')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Update transaction error:', error);
      return NextResponse.json({ error: error.message || 'Database update failed' }, { status: 500 });
    }

    if (!data) {
      console.error('No data returned after update');
      return NextResponse.json({ error: 'Transaction not found or not updated' }, { status: 404 });
    }

    console.log('Update successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Update transaction exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
