import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get all user IDs that a given user can access based on hierarchy
 * - Admins (pure admin role only) can access all users
 * - Managers can access their assigned users
 * - Superior Managers can access their assigned managers AND all users under those managers
 */
export async function getAccessibleUserIds(
  userId: string,
  isAdmin: boolean,
  isManager: boolean,
  isSuperiorManager: boolean,
  bankClient: SupabaseClient<any>
): Promise<string[]> {
  // Pure admins (admin role WITHOUT manager/superior roles) can see everyone
  if (isAdmin && !isManager && !isSuperiorManager) {
    console.log('  👑 Pure admin - returning all access');
    return ['*']; // Special marker meaning "all users"
  }

  const accessibleUserIds = new Set<string>();

  console.log(`  🔍 Querying hierarchy for user: ${userId}`);

  // Get direct subordinates (users directly assigned to this manager)
  const { data: directSubordinates, error: directError } = await bankClient
    .from('user_hierarchy')
    .select('subordinate_id, relationship_type')
    .eq('superior_id', userId);

  if (directError) {
    console.error('  ❌ Error fetching direct subordinates:', directError);
    console.error('  📝 Error code:', directError.code);
    console.error('  📝 Error message:', directError.message);
    console.error('  📝 Error details:', directError.details);
    return [];
  }

  if (!directSubordinates || directSubordinates.length === 0) {
    console.log('  ℹ️ No direct subordinates found (query returned:', directSubordinates, ')');
    return [];
  }

  console.log(`  📊 Found ${directSubordinates.length} direct relationships`);
  console.log('  📋 Raw hierarchy data:', JSON.stringify(directSubordinates, null, 2));

  // Add all direct subordinates
  directSubordinates.forEach(rel => {
    accessibleUserIds.add(rel.subordinate_id);
    console.log(`  ➕ Added subordinate: ${rel.subordinate_id} (${rel.relationship_type})`);
  });

  // If superior manager, also get all users under their managers
  if (isSuperiorManager) {
    console.log('  🔝 Processing superior manager hierarchy...');
    const managerIds = directSubordinates
      .filter(rel => rel.relationship_type === 'superior_manager_to_manager')
      .map(rel => rel.subordinate_id);

    console.log(`  👥 Found ${managerIds.length} managers under this superior manager`);

    if (managerIds.length > 0) {
      // Get all users under these managers
      const { data: managersSubordinates, error: managersError } = await bankClient
        .from('user_hierarchy')
        .select('subordinate_id')
        .in('superior_id', managerIds)
        .eq('relationship_type', 'manager_to_user');

      if (!managersError && managersSubordinates) {
        console.log(`  📝 Found ${managersSubordinates.length} users under managers`);
        managersSubordinates.forEach(rel => {
          accessibleUserIds.add(rel.subordinate_id);
          console.log(`  ➕ Added user under manager: ${rel.subordinate_id}`);
        });
      } else if (managersError) {
        console.error('  ❌ Error fetching managers subordinates:', managersError);
      }
    }
  }

  const result = Array.from(accessibleUserIds);
  console.log(`  ✅ Total accessible users: ${result.length}`);
  return result;
}
