import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase-env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankKey, userId } = body;

    console.log('Delete user API called:', { bankKey, userId });

    if (!bankKey || !userId) {
      console.error('Missing required fields:', { bankKey, userId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { supabaseUrl, supabaseAnonKey: supabaseKey, isConfigured } = getSupabaseConfig();

    if (!isConfigured) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/multi-bank-users-delete`;
    console.log('Calling edge function:', edgeFunctionUrl);

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, bankKey })
    });

    console.log('Edge function response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error response:', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }

      return NextResponse.json(
        { error: errorData.error || 'Failed to delete user' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Delete successful:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: `Failed to delete user: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
