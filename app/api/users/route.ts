import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase-env';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('perPage') || '18';
    const bankFilter = searchParams.get('bank') || 'all';
    const kycFilter = searchParams.get('kyc') || 'all';
    const search = searchParams.get('search') || '';
    const userId = searchParams.get('user_id') || '';
    const bankKey = searchParams.get('user_bank_key') || '';
    const isAdmin = searchParams.get('is_admin') || 'false';
    const isManager = searchParams.get('is_manager') || 'false';
    const isSuperiorManager = searchParams.get('is_superiormanager') || 'false';

    const { supabaseUrl, supabaseAnonKey, isConfigured } = getSupabaseConfig();

    if (!isConfigured) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/multi-bank-users?page=${page}&perPage=${perPage}&bank=${bankFilter}&kyc=${kycFilter}&search=${encodeURIComponent(search)}&user_id=${userId}&user_bank_key=${bankKey}&is_admin=${isAdmin}&is_manager=${isManager}&is_superiormanager=${isSuperiorManager}`;

    const response = await fetch(edgeFunctionUrl, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
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
