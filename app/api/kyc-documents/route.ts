import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bankKey = searchParams.get('bankKey');
    const userId = searchParams.get('userId');

    if (!bankKey || !userId) {
      return NextResponse.json(
        { error: 'Missing bankKey or userId' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/multi-bank-kyc?userId=${userId}&bankKey=${bankKey}`;

    const response = await fetch(edgeFunctionUrl, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Edge function returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching KYC documents:', error);
    return NextResponse.json({
      documents: [],
      error: 'Failed to fetch KYC documents'
    }, { status: 500 });
  }
}
