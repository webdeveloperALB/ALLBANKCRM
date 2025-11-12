import { NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase-env';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bank_key } = body;

    if (!bank_key) {
      return NextResponse.json(
        { error: 'Missing bank_key' },
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

    const apiUrl = `${supabaseUrl}/functions/v1/multi-bank-activities-create`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to create activity' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
