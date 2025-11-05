import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const BANKS = {
  'cayman': {
    name: 'Cayman Bank',
    url: 'https://rswfgdklidaljidagkxp.supabase.co',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzd2ZnZGtsaWRhbGppZGFna3hwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTY1OTA3NywiZXhwIjoyMDc3MjM1MDc3fQ.vXTlkRhmsqSO2pDJ9b_Yyth6urRNHJI7yhXMS7kGn4k'
  },
  'lithuanian': {
    name: 'Lithuanian Bank',
    url: 'https://asvvmnifwvnyrxvxewvv.supabase.co',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdnZtbmlmd3ZueXJ4dnhld3Z2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU2MzY2MSwiZXhwIjoyMDc3MTM5NjYxfQ.ugTFp4rRITjnAOB4IBOHv7siXRaVkkz4kurxuW2g7W4'
  },
  'digitalchain': {
    name: 'Digital Chain Bank',
    url: 'https://bzemaxsqlhydefzjehup.supabase.co',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZW1heHNxbGh5ZGVmemplaHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ0MjY4NiwiZXhwIjoyMDY3MDE4Njg2fQ.9EfkiHUecc3dUEYsIGk8R6RnsywTgs4urUv_Ts2Otcw'
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AuditLogEntry {
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { bankKey, logEntry } = await req.json() as {
      bankKey: string;
      logEntry: AuditLogEntry;
    };

    console.log('[Edge Function] Received audit log request:', { bankKey, logEntry });

    if (!bankKey || !logEntry) {
      console.error('[Edge Function] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const config = BANKS[bankKey as keyof typeof BANKS];
    if (!config) {
      console.error('[Edge Function] Invalid bank key:', bankKey);
      return new Response(
        JSON.stringify({ error: 'Invalid bank key' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('[Edge Function] Using bank config:', config.name, config.url);

    const client = createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Generate a UUID for the audit log
    const auditLogId = crypto.randomUUID();

    console.log('[Edge Function] Inserting audit log with ID:', auditLogId);

    // Insert audit log
    const { data: insertedData, error: insertError } = await client
      .from('audit_logs')
      .insert({
        id: auditLogId,
        user_id: logEntry.user_id || null,
        user_email: logEntry.user_email,
        action: logEntry.action,
        table_name: logEntry.table_name,
        record_id: logEntry.record_id,
        old_data: logEntry.old_data || null,
        new_data: logEntry.new_data || null,
        changes_summary: logEntry.changes_summary,
        ip_address: logEntry.ip_address || null,
        user_agent: logEntry.user_agent || null,
        timestamp: logEntry.timestamp,
        bank_origin: logEntry.bank_origin
      })
      .select();

    if (insertError) {
      console.error('[Edge Function] Error inserting audit log:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create audit log', details: insertError.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('[Edge Function] Successfully inserted audit log:', insertedData);

    return new Response(
      JSON.stringify({ success: true, data: insertedData }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[Edge Function] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process audit log', details: String(error) }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
