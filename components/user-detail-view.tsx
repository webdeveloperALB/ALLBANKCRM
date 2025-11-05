'use client';

import { useState, useEffect } from 'react';
import { UserWithBank, UserPresence } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Circle, Wallet, CreditCard, Bitcoin, Send, Activity, MessageSquare, FileBarChart, Building2, RefreshCw, Trash2, Pencil, CheckCircle, XCircle } from 'lucide-react';
import { KYCDocumentsDialog } from '@/components/kyc-documents-dialog';
import { UserEditDialog } from '@/components/user-edit-dialog';
import { BalanceManager } from '@/components/balance-manager';
import { UserTaxesCard } from '@/components/user-taxes-card';
import { UserMessagesCard } from '@/components/user-messages-card';
import { UserActivitiesCard } from '@/components/user-activities-card';
import { UserExternalAccountsCard } from '@/components/user-external-accounts-card';
import { UserTransfersCard } from '@/components/user-transfers-card';
import { UserCryptoBalancesCard } from '@/components/user-crypto-balances-card';
import { UserCryptoTransactionsCard } from '@/components/user-crypto-transactions-card';
import { UserCardsManagement } from '@/components/user-cards-management';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

interface UserDetailViewProps {
  user: UserWithBank;
  onBack: () => void;
  onUpdate: () => void;
}

export function UserDetailView({ user, onBack, onUpdate }: UserDetailViewProps) {
  const [viewingKYC, setViewingKYC] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [presence, setPresence] = useState<UserPresence | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPresence = async () => {
      try {
        const response = await fetch(`/api/presence?user_id=${user.id}&bank_key=${user.bank_key}`);
        if (response.ok) {
          const data = await response.json();
          setPresence(data);
        }
      } catch (error) {
        console.error('Error fetching presence:', error);
      }
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 30000);
    return () => clearInterval(interval);
  }, [user.id, user.bank_key]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onUpdate();
      setRefreshKey(prev => prev + 1);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      console.log('Deleting user:', { userId: user.id, bankKey: user.bank_key });

      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id
        })
      });

      console.log('Delete response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Delete successful:', result);
        toast.success('User deleted successfully');
        setShowDeleteDialog(false);
        onBack();
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
        toast.error(error.error || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Error deleting user: ${error.message || 'Unknown error'}`);
    } finally {
      setDeleting(false);
    }
  };

  const updateKYCStatus = async (status: string) => {
    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          updates: { kyc_status: status }
        })
      });

      if (response.ok) {
        toast.success(`KYC status updated to ${status}`);
        await onUpdate();
      } else {
        toast.error('Failed to update KYC status');
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast.error('Error updating KYC status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="bg-white/80 backdrop-blur-md border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onBack} className="hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Users
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="hover:bg-blue-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Circle
                  className={`w-2 h-2 ${presence?.is_online ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
                />
                <span className="text-sm font-medium">
                  {presence?.is_online ? 'Online' : 'Offline'}
                </span>
              </div>

              {user.kyc_status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => updateKYCStatus('approved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve KYC
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateKYCStatus('rejected')}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject KYC
                  </Button>
                </>
              )}

              {user.kyc_status === 'not_started' && (
                <Button
                  size="sm"
                  onClick={() => updateKYCStatus('approved')}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Skip KYC
                </Button>
              )}

              <Button onClick={() => setViewingKYC(true)} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                KYC Documents
              </Button>

              <Button onClick={() => setEditingUser(true)} variant="outline" size="sm">
                <Pencil className="w-4 h-4 mr-2" />
                Edit User
              </Button>

              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                size="sm"
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 animate-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.email}</h1>
              <p className="text-gray-500 mt-1">User ID: {user.id}</p>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {user.bank_name}
            </Badge>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</div>
              <div className="text-base font-medium text-gray-900">{user.password || 'Not set'}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</div>
              <div className="text-base font-medium text-gray-900">
                {presence?.country ? (
                  <>{presence.city ? `${presence.city}, ` : ''}{presence.country}</>
                ) : (
                  'Unknown'
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Roles</div>
              <div className="flex gap-2 flex-wrap">
                {user.is_admin && <Badge className="bg-blue-600">Admin</Badge>}
                {user.is_manager && <Badge variant="outline">Manager</Badge>}
                {user.is_superiormanager && <Badge variant="outline">Superior</Badge>}
                {!user.is_admin && !user.is_manager && !user.is_superiormanager && (
                  <span className="text-sm text-gray-500">No roles assigned</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">KYC Status</div>
              <Badge
                className={
                  user.kyc_status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : user.kyc_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : user.kyc_status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }
              >
                {user.kyc_status || 'Not Started'}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="balances" className="w-full">
          <TabsList className="w-full bg-white border shadow-sm h-12 p-1 mb-6">
            <TabsTrigger value="balances" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Wallet className="w-4 h-4" />
              Balances
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <CreditCard className="w-4 h-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="crypto" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Bitcoin className="w-4 h-4" />
              Cryptocurrency
            </TabsTrigger>
            <TabsTrigger value="transfers" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Send className="w-4 h-4" />
              Transfers
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="other" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <FileBarChart className="w-4 h-4" />
              Taxes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="space-y-6">
            <BalanceManager key={`balance-${refreshKey}`} bankKey={user.bank_key} userId={user.id} />
          </TabsContent>

          <TabsContent value="cards" className="space-y-6">
            <UserCardsManagement key={`cards-${refreshKey}`} user={user} />
          </TabsContent>

          <TabsContent value="crypto" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <UserCryptoBalancesCard key={`crypto-balances-${refreshKey}`} user={user} />
              <UserCryptoTransactionsCard key={`crypto-transactions-${refreshKey}`} user={user} />
            </div>
          </TabsContent>

          <TabsContent value="transfers" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <UserExternalAccountsCard key={`external-accounts-${refreshKey}`} user={user} />
              <UserTransfersCard key={`transfers-${refreshKey}`} user={user} />
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <UserActivitiesCard key={`activities-${refreshKey}`} user={user} />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <UserMessagesCard key={`messages-${refreshKey}`} user={user} />
          </TabsContent>

          <TabsContent value="other" className="space-y-6">
            <UserTaxesCard key={`taxes-${refreshKey}`} user={user} />
          </TabsContent>
        </Tabs>
      </div>

      {viewingKYC && (
        <KYCDocumentsDialog
          user={user}
          onClose={() => setViewingKYC(false)}
        />
      )}

      {editingUser && (
        <UserEditDialog
          user={user}
          onClose={() => setEditingUser(false)}
          onSuccess={() => {
            setEditingUser(false);
            onUpdate();
          }}
        />
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete User Account"
        description={`Are you sure you want to permanently delete ${user.email || 'this user'}? This action will remove the user from auth.users, public.users, and public.profiles tables. This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
