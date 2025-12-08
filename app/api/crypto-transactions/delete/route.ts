import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  console.log('=== DELETE CRYPTO TRANSACTION START ===');

  try {
    console.log('1. Getting URL and search params...');
    const { searchParams } = new URL(request.url);
    const bankKey = searchParams.get('bankKey');
    const transactionId = searchParams.get('transactionId');

    console.log('2. Request data from query params:', { bankKey, transactionId });

    if (!bankKey) {
      console.error('ERROR: Missing bankKey');
      return NextResponse.json({ error: 'Missing bankKey' }, { status: 400 });
    }

    if (!transactionId) {
      console.error('ERROR: Missing transactionId');
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
    }

    console.log('3. Getting bank client for bank:', bankKey);
    let supabase;
    try {
      supabase = getBankClient(bankKey);
      console.log('4. Bank client created successfully');
    } catch (bankError) {
      console.error('ERROR: Failed to get bank client:', bankError);
      return NextResponse.json({
        error: `Failed to get bank client: ${bankError instanceof Error ? bankError.message : 'Unknown error'}`
      }, { status: 500 });
    }

    console.log('5. Attempting to delete transaction with ID:', transactionId);
    const { error, data } = await supabase
      .from('crypto_transactions')
      .delete()
      .eq('id', transactionId)
      .select();

    if (error) {
      console.error('ERROR: Supabase delete error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({
        error: `Database error: ${error.message}`,
        code: error.code,
        details: error.details
      }, { status: 500 });
    }

    console.log('6. Delete successful! Deleted rows:', data);
    console.log('=== DELETE CRYPTO TRANSACTION END (SUCCESS) ===');
    return NextResponse.json({ success: true, deleted: data });
  } catch (error) {
    console.error('ERROR: Unhandled exception in DELETE handler:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('=== DELETE CRYPTO TRANSACTION END (FAILED) ===');
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
      type: 'exception'
    }, { status: 500 });
  }
}
