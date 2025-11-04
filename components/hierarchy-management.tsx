'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, Shield, ShieldCheck, Trash2, Network, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { getBankClient } from '@/lib/supabase-multi';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  is_manager: boolean;
  is_superiormanager: boolean;
  bank_origin: string;
  bank_key: string;
}

interface HierarchyRelationship {
  id: string;
  superior_id: string;
  subordinate_id: string;
  relationship_type: 'manager_to_user' | 'superior_manager_to_manager';
  superior_name: string;
  subordinate_name: string;
  created_at: string;
}

export function HierarchyManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // All users including non-admins
  const [relationships, setRelationships] = useState<HierarchyRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignType, setAssignType] = useState<'manager' | 'superior_manager' | 'assign_users'>('manager');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedSuperiorId, setSelectedSuperiorId] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; relationshipId: string | null }>({
    open: false,
    relationshipId: null
  });
  const [managerPopoverOpen, setManagerPopoverOpen] = useState(false);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users from all banks
      const bankConfigs = [
        { key: 'digitalchain', name: 'Digital Chain Bank' },
        { key: 'cayman', name: 'Cayman Bank' },
        { key: 'lithuanian', name: 'Lithuanian Bank' }
      ];

      const adminUsers: User[] = [];
      const allUsersArray: User[] = [];

      for (const bank of bankConfigs) {
        const supabase = getBankClient(bank.key);

        // Fetch admin users for role management
        const { data: adminData, error: adminError } = await supabase
          .from('users')
          .select('id, email, full_name, is_admin, is_manager, is_superiormanager, bank_origin')
          .eq('is_admin', true)
          .order('email');

        if (adminError) {
          console.error(`Error fetching admins from ${bank.name}:`, adminError);
        } else if (adminData) {
          const usersWithBank = adminData.map(user => ({
            ...user,
            bank_key: bank.key,
            bank_origin: user.bank_origin || bank.name
          }));
          adminUsers.push(...usersWithBank);
        }

        // Fetch ALL users for assignment
        const { data: allData, error: allError } = await supabase
          .from('users')
          .select('id, email, full_name, is_admin, is_manager, is_superiormanager, bank_origin')
          .order('email');

        if (allError) {
          console.error(`Error fetching all users from ${bank.name}:`, allError);
        } else if (allData) {
          const usersWithBank = allData.map(user => ({
            ...user,
            bank_key: bank.key,
            bank_origin: user.bank_origin || bank.name
          }));
          allUsersArray.push(...usersWithBank);
        }
      }

      setUsers(adminUsers);
      setAllUsers(allUsersArray);

      // Fetch hierarchy relationships from all banks
      const allRelationships: any[] = [];

      for (const bank of bankConfigs) {
        const supabase = getBankClient(bank.key);

        const { data: hierarchyData, error: hierarchyError } = await supabase
          .from('user_hierarchy')
          .select(`
            id,
            superior_id,
            subordinate_id,
            relationship_type,
            created_at,
            superior:superior_id(full_name, email),
            subordinate:subordinate_id(full_name, email)
          `)
          .order('created_at', { ascending: false });

        if (hierarchyError) {
          console.error(`Error fetching hierarchy from ${bank.name}:`, hierarchyError);
          continue;
        }

        if (hierarchyData) {
          allRelationships.push(...hierarchyData);
        }
      }

      const formattedRelationships = (allRelationships || []).map((rel: any) => ({
        id: rel.id,
        superior_id: rel.superior_id,
        subordinate_id: rel.subordinate_id,
        relationship_type: rel.relationship_type,
        superior_name: rel.superior?.full_name || rel.superior?.email || 'Unknown',
        subordinate_name: rel.subordinate?.full_name || rel.subordinate?.email || 'Unknown',
        created_at: rel.created_at
      }));

      setRelationships(formattedRelationships);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load hierarchy data');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeManager = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        toast.error('User not found');
        return;
      }

      const supabase = getBankClient(user.bank_key);

      const { error } = await supabase
        .from('users')
        .update({ is_manager: true })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User promoted to Manager');
      await fetchData();
    } catch (error: any) {
      toast.error('Failed to promote user: ' + error.message);
    }
  };

  const handleMakeSuperiorManager = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        toast.error('User not found');
        return;
      }

      const supabase = getBankClient(user.bank_key);

      const { error } = await supabase
        .from('users')
        .update({ is_superiormanager: true })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User promoted to Superior Manager');
      await fetchData();
    } catch (error: any) {
      toast.error('Failed to promote user: ' + error.message);
    }
  };

  const handleAssignUsersToManager = async () => {
    console.log('=== ASSIGN BUTTON CLICKED ===');
    console.log('handleAssignUsersToManager called', { selectedSuperiorId, selectedUserId });

    if (assigning) {
      console.log('Already assigning, skipping...');
      return;
    }

    if (!selectedSuperiorId || !selectedUserId) {
      console.log('Missing selections');
      toast.error('Please select both manager and user');
      return;
    }

    try {
      setAssigning(true);
      console.log('Starting assignment process...');

      const manager = users.find(u => u.id === selectedSuperiorId);
      const user = allUsers.find(u => u.id === selectedUserId);

      console.log('Manager:', manager);
      console.log('User:', user);
      console.log('All users count:', allUsers.length);

      if (!manager || !user) {
        toast.error('Manager or user not found');
        return;
      }

      if (manager.bank_key !== user.bank_key) {
        toast.error('Manager and user must be from the same bank');
        return;
      }

      console.log('Inserting hierarchy with bank:', manager.bank_key);
      const supabase = getBankClient(manager.bank_key);

      const { data, error } = await supabase
        .from('user_hierarchy')
        .insert({
          superior_id: selectedSuperiorId,
          subordinate_id: selectedUserId,
          relationship_type: 'manager_to_user'
        })
        .select();

      console.log('Insert result:', { data, error });

      if (error) throw error;

      toast.success('User assigned to manager successfully');
      setShowAssignDialog(false);
      setSelectedSuperiorId('');
      setSelectedUserId('');
      setManagerPopoverOpen(false);
      setUserPopoverOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error('Error assigning user:', error);
      toast.error('Failed to assign user: ' + error.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignManagerToSuperior = async () => {
    if (!selectedSuperiorId || !selectedUserId) {
      toast.error('Please select both superior manager and manager');
      return;
    }

    try {
      const superiorManager = users.find(u => u.id === selectedSuperiorId);
      const manager = users.find(u => u.id === selectedUserId);

      if (!superiorManager || !manager) {
        toast.error('Superior manager or manager not found');
        return;
      }

      if (superiorManager.bank_key !== manager.bank_key) {
        toast.error('Superior manager and manager must be from the same bank');
        return;
      }

      const supabase = getBankClient(superiorManager.bank_key);

      const { error } = await supabase
        .from('user_hierarchy')
        .insert({
          superior_id: selectedSuperiorId,
          subordinate_id: selectedUserId,
          relationship_type: 'superior_manager_to_manager'
        });

      if (error) throw error;

      toast.success('Manager assigned to superior manager successfully');
      setShowAssignDialog(false);
      setSelectedSuperiorId('');
      setSelectedUserId('');
      await fetchData();
    } catch (error: any) {
      toast.error('Failed to assign manager: ' + error.message);
    }
  };

  const handleDeleteRelationship = async () => {
    if (!deleteConfirm.relationshipId) return;

    try {
      // Try to delete from all banks
      const bankKeys = ['digitalchain', 'cayman', 'lithuanian'];
      let deleted = false;

      for (const bankKey of bankKeys) {
        const supabase = getBankClient(bankKey);

        const { error } = await supabase
          .from('user_hierarchy')
          .delete()
          .eq('id', deleteConfirm.relationshipId);

        if (!error) {
          deleted = true;
          break;
        }
      }

      if (deleted) {
        toast.success('Hierarchy relationship removed');
        await fetchData();
      } else {
        throw new Error('Relationship not found');
      }
    } catch (error: any) {
      toast.error('Failed to remove relationship: ' + error.message);
    }
  };

  const getManagers = () => users.filter(u => u.is_manager && u.is_admin);
  const getSuperiorManagers = () => users.filter(u => u.is_superiormanager && u.is_admin);
  const getRegularUsers = () => users.filter(u => !u.is_manager && !u.is_superiormanager && u.is_admin);
  const getNonAdminUsers = () => users.filter(u => !u.is_admin);

  // Get ALL users from the same bank as the selected manager (not just admins)
  const getUsersForSelectedManager = () => {
    if (!selectedSuperiorId) return [];
    const manager = users.find(u => u.id === selectedSuperiorId);
    if (!manager) return [];
    // Return ALL users from the same bank, excluding managers and superior managers
    return allUsers.filter(u =>
      u.bank_key === manager.bank_key &&
      !u.is_manager &&
      !u.is_superiormanager &&
      u.id !== manager.id
    );
  };

  // Get managers from the same bank as the selected superior manager
  const getManagersForSelectedSuperior = () => {
    if (!selectedSuperiorId) return [];
    const superiorManager = users.find(u => u.id === selectedSuperiorId);
    if (!superiorManager) return [];
    return getManagers().filter(u => u.bank_key === superiorManager.bank_key && !u.is_superiormanager);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Network className="w-6 h-6" />
                User Hierarchy Management
              </CardTitle>
              <CardDescription>
                Manage managers, superior managers, and user assignments
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => {
                setAssignType('assign_users');
                setShowAssignDialog(true);
              }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Assign Users to Manager
              </Button>
              <Button onClick={() => {
                setAssignType('superior_manager');
                setShowAssignDialog(true);
              }} variant="secondary">
                <Shield className="w-4 h-4 mr-2" />
                Assign Manager to Superior
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Hierarchy Rules:</strong> Only users with is_admin=true can access this panel.
              Admins have full access. Managers can only access their assigned users.
              Superior Managers can access their assigned managers and their users.
            </AlertDescription>
          </Alert>

          {/* User Roles Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Roles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Regular Admin Users */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Regular Admin Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getRegularUsers().length === 0 ? (
                    <p className="text-sm text-gray-500">No regular users</p>
                  ) : (
                    getRegularUsers().map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{user.full_name || user.email}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <Badge variant="secondary" className="text-xs mt-1">{user.bank_origin}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMakeManager(user.id)}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            Make Manager
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Managers */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Managers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getManagers().length === 0 ? (
                    <p className="text-sm text-gray-500">No managers</p>
                  ) : (
                    getManagers().map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 border rounded bg-blue-50">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{user.full_name || user.email}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">Manager</Badge>
                            <Badge variant="secondary" className="text-xs">{user.bank_origin}</Badge>
                          </div>
                        </div>
                        {!user.is_superiormanager && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMakeSuperiorManager(user.id)}
                          >
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Promote
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Superior Managers */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Superior Managers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getSuperiorManagers().length === 0 ? (
                    <p className="text-sm text-gray-500">No superior managers</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getSuperiorManagers().map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 border rounded bg-green-50">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{user.full_name || user.email}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">Superior Manager</Badge>
                              <Badge variant="secondary" className="text-xs">{user.bank_origin}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Hierarchy Relationships */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Network className="w-5 h-5" />
              Current Hierarchy Relationships
            </h3>
            {relationships.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No hierarchy relationships established yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {relationships.map(rel => (
                  <Card key={rel.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={rel.relationship_type === 'manager_to_user' ? 'default' : 'secondary'}>
                              {rel.relationship_type === 'manager_to_user' ? 'Manager → User' : 'Superior Manager → Manager'}
                            </Badge>
                          </div>
                          <p className="text-sm mt-2">
                            <span className="font-semibold">{rel.superior_name}</span>
                            {' manages '}
                            <span className="font-semibold">{rel.subordinate_name}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created {new Date(rel.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm({ open: true, relationshipId: rel.id })}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {assignType === 'assign_users' ? 'Assign User to Manager' : 'Assign Manager to Superior Manager'}
            </DialogTitle>
            <DialogDescription>
              {assignType === 'assign_users'
                ? 'Select a manager and a user to assign to them'
                : 'Select a superior manager and a manager to assign to them'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                {assignType === 'assign_users' ? 'Select Manager' : 'Select Superior Manager'}
              </Label>
              <Popover open={managerPopoverOpen} onOpenChange={setManagerPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={managerPopoverOpen}
                    className="w-full justify-between"
                  >
                    {selectedSuperiorId
                      ? (() => {
                          const selected = (assignType === 'assign_users' ? getManagers() : getSuperiorManagers()).find(u => u.id === selectedSuperiorId);
                          return selected ? `${selected.full_name || selected.email} (${selected.bank_origin})` : 'Select...';
                        })()
                      : assignType === 'assign_users' ? 'Choose a manager...' : 'Choose a superior manager...'}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {(assignType === 'assign_users' ? getManagers() : getSuperiorManagers()).map(user => (
                          <CommandItem
                            key={user.id}
                            value={`${user.full_name || user.email} ${user.email}`}
                            onSelect={() => {
                              setSelectedSuperiorId(user.id);
                              setSelectedUserId('');
                              setManagerPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedSuperiorId === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {user.full_name || user.email} ({user.bank_origin})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>
                {assignType === 'assign_users' ? 'Select User (from same bank)' : 'Select Manager (from same bank)'}
              </Label>
              <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userPopoverOpen}
                    className="w-full justify-between"
                    disabled={!selectedSuperiorId}
                  >
                    {selectedUserId
                      ? (() => {
                          const selected = (assignType === 'assign_users' ? getUsersForSelectedManager() : getManagersForSelectedSuperior()).find(u => u.id === selectedUserId);
                          return selected ? `${selected.full_name || selected.email} (${selected.bank_origin})` : 'Select...';
                        })()
                      : !selectedSuperiorId
                      ? 'First select a manager/superior...'
                      : assignType === 'assign_users' ? 'Choose a user...' : 'Choose a manager...'}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                      <CommandEmpty>No users from the same bank.</CommandEmpty>
                      <CommandGroup>
                        {(assignType === 'assign_users' ? getUsersForSelectedManager() : getManagersForSelectedSuperior()).map(user => (
                          <CommandItem
                            key={user.id}
                            value={`${user.full_name || user.email} ${user.email}`}
                            onSelect={() => {
                              setSelectedUserId(user.id);
                              setUserPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUserId === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {user.full_name || user.email} ({user.bank_origin})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAssignDialog(false);
              setSelectedSuperiorId('');
              setSelectedUserId('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log('Assign button clicked!');
                console.log('assignType:', assignType);
                if (assignType === 'assign_users') {
                  handleAssignUsersToManager();
                } else {
                  handleAssignManagerToSuperior();
                }
              }}
              disabled={assigning}
            >
              {assigning ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, relationshipId: null })}
        title="Remove Hierarchy Relationship"
        description="Are you sure you want to remove this hierarchy relationship? This will not delete the users, only remove the management relationship."
        onConfirm={handleDeleteRelationship}
        confirmText="Remove"
        variant="destructive"
      />
    </>
  );
}
