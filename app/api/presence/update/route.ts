import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bank_key, user_id, is_online } = body;

    if (!bank_key || !user_id) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env[`NEXT_PUBLIC_SUPABASE_${bank_key.toUpperCase()}_URL`];
    const supabaseAnonKey = process.env[`NEXT_PUBLIC_SUPABASE_${bank_key.toUpperCase()}_ANON_KEY`];

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Invalid bank configuration' },
        { status: 400 }
      );
    }

    const apiUrl = `${supabaseUrl}/functions/v1/update-user-presence`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bank_key, user_id, is_online }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to update presence' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating presence:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
