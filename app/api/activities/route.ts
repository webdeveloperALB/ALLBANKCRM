import { NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase-env';

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

    const { supabaseUrl, supabaseAnonKey, isConfigured } = getSupabaseConfig();

    if (!isConfigured) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const apiUrl = `${supabaseUrl}/functions/v1/multi-bank-activities?user_id=${userId}&bank_key=${bankKey}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to fetch activities' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in activities GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
