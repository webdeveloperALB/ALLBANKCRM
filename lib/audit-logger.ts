export interface AuditLogEntry {
  user_id?: string;
  user_email: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string;
  old_data?: any;
  new_data?: any;
  changes_summary: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  bank_origin: string;
}

export async function logAudit(
  bankKey: string,
  entry: AuditLogEntry
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('[Audit Logger] Sending to edge function:', {
      bankKey,
      edgeFunctionUrl: `${supabaseUrl}/functions/v1/audit-log`,
      entry
    });

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/audit-log`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bankKey,
        logEntry: entry
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('[Audit Logger] Edge function error:', response.status, responseData);
      return { success: false, error: responseData.error || 'Unknown error' };
    }

    console.log('[Audit Logger] Successfully logged audit entry:', responseData);
    return { success: true };
  } catch (error) {
    console.error('[Audit Logger] Failed to log audit entry:', error);
    return { success: false, error: String(error) };
  }
}

export function generateChangesSummary(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  tableName: string,
  oldData?: any,
  newData?: any
): string {
  const tableDisplay = tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (action === 'CREATE') {
    return `Created new ${tableDisplay} record`;
  }

  if (action === 'DELETE') {
    return `Deleted ${tableDisplay} record`;
  }

  if (action === 'UPDATE' && oldData && newData) {
    const changes: string[] = [];

    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        changes.push(`${fieldName}: "${oldData[key]}" → "${newData[key]}"`);
      }
    }

    if (changes.length === 0) {
      return `Updated ${tableDisplay} record`;
    }

    return `Updated ${tableDisplay}: ${changes.join(', ')}`;
  }

  return `Updated ${tableDisplay} record`;
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
