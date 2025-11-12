import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase-env';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankKey, userId, title, content, message_type } = body;

    if (!bankKey || !userId || !title || !content) {
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

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/multi-bank-messages-create`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        bankKey,
        title,
        content,
        message_type
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
