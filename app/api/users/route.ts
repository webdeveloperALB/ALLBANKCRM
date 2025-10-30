import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('perPage') || '18';
    const bankFilter = searchParams.get('bank') || 'all';
    const kycFilter = searchParams.get('kyc') || 'all';
    const search = searchParams.get('search') || '';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/multi-bank-users?page=${page}&perPage=${perPage}&bank=${bankFilter}&kyc=${kycFilter}&search=${encodeURIComponent(search)}`;

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
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
