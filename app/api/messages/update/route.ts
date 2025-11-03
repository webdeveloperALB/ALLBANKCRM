import { NextRequest, NextResponse } from 'next/server';
import { getBankClient } from '@/lib/supabase-multi';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankKey, messageId, title, content, message_type, is_read } = body;

    if (!bankKey || !messageId) {
      return NextResponse.json({ error: 'Missing required fields: bankKey or messageId' }, { status: 400 });
    }

    const supabase = getBankClient(bankKey);

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (message_type !== undefined) updateData.message_type = message_type;
    if (is_read !== undefined) updateData.is_read = is_read;

    updateData.updated_at = new Date().toISOString();

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_messages')
      .update(updateData)
      .eq('id', messageId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Update message error:', error);
      return NextResponse.json({ error: error.message || 'Database update failed' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Message not found or not updated' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update message exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
