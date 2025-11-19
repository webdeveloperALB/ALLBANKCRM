import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BANKS } from '@/lib/bank-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const userBankKey = searchParams.get('bank_key');
    const isAdmin = searchParams.get('is_admin') === 'true';
    const isManager = searchParams.get('is_manager') === 'true';
    const isSuperiorManager = searchParams.get('is_superiormanager') === 'true';

    if (!userId || !userBankKey) {
      return NextResponse.json({ error: 'User ID and bank key required' }, { status: 400 });
    }

    // Get user's bank config
    const userBankConfig = BANKS[userBankKey];
    if (!userBankConfig || !userBankConfig.serviceRoleKey) {
      console.error(`Missing service role key for bank: ${userBankKey}`);
      return NextResponse.json({ error: 'Bank configuration missing' }, { status: 500 });
    }

    const supabase = createClient(userBankConfig.url, userBankConfig.serviceRoleKey);

    // Pure admin (admin=true, manager=false, superior=false) can access ALL users
    if (isAdmin && !isManager && !isSuperiorManager) {
      return NextResponse.json({ accessibleUserIds: ['*'] });
    }

    // Admin + Manager (admin=true, manager=true) - see only assigned users
    if (isAdmin && isManager && !isSuperiorManager) {
      const { data: directSubordinates, error: directError } = await supabase
        .from('user_hierarchy')
        .select('subordinate_id, relationship_type')
        .eq('superior_id', userId)
        .eq('relationship_type', 'manager_to_user');

      if (directError) {
        console.error('Error fetching hierarchy for manager:', directError);
        return NextResponse.json({ error: 'Failed to fetch hierarchy' }, { status: 500 });
      }

      const userIds = (directSubordinates || []).map(rel => rel.subordinate_id);
      return NextResponse.json({ accessibleUserIds: userIds });
    }

    // Admin + Superior Manager (admin=true, superior=true) - see managers AND their users
    if (isAdmin && isSuperiorManager) {
      const { data: directSubordinates, error: directError } = await supabase
        .from('user_hierarchy')
        .select('subordinate_id, relationship_type')
        .eq('superior_id', userId);

      if (directError) {
        console.error('Error fetching hierarchy for superior manager:', directError);
        return NextResponse.json({ error: 'Failed to fetch hierarchy' }, { status: 500 });
      }

      const accessibleUserIds = new Set<string>();

      // Add all direct subordinates (managers)
      (directSubordinates || []).forEach(rel => {
        accessibleUserIds.add(rel.subordinate_id);
      });

      // Get all users under the managers
      const managerIds = (directSubordinates || [])
        .filter(rel => rel.relationship_type === 'superior_manager_to_manager')
        .map(rel => rel.subordinate_id);

      if (managerIds.length > 0) {
        const { data: managersSubordinates } = await supabase
          .from('user_hierarchy')
          .select('subordinate_id')
          .in('superior_id', managerIds)
          .eq('relationship_type', 'manager_to_user');

        if (managersSubordinates) {
          managersSubordinates.forEach(rel => {
            accessibleUserIds.add(rel.subordinate_id);
          });
        }
      }

      return NextResponse.json({ accessibleUserIds: Array.from(accessibleUserIds) });
    }

    // Fallback - no access
    return NextResponse.json({ accessibleUserIds: [] });
  } catch (error) {
    console.error('Error in accessible-user-ids API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
