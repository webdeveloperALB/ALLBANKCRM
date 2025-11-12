import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase-env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankKey, userId, updates } = body;

    if (!bankKey || !userId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { supabaseUrl, supabaseAnonKey: supabaseKey, isConfigured } = getSupabaseConfig();

    if (!isConfigured) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/multi-bank-users-update`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, bankKey, updates })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
