'use client';

import { useState, useEffect } from 'react';
import { UserWithBank, UserPresence } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, Circle } from 'lucide-react';
import { KYCDocumentsDialog } from '@/components/kyc-documents-dialog';
import { BalanceManager } from '@/components/balance-manager';
import { UserTaxesCard } from '@/components/user-taxes-card';
import { UserMessagesCard } from '@/components/user-messages-card';
import { UserActivitiesCard } from '@/components/user-activities-card';
import { UserExternalAccountsCard } from '@/components/user-external-accounts-card';
import { UserTransfersCard } from '@/components/user-transfers-card';
import { UserCryptoBalancesCard } from '@/components/user-crypto-balances-card';
import { UserCryptoTransactionsCard } from '@/components/user-crypto-transactions-card';
import { UserCardsManagement } from '@/components/user-cards-management';

interface UserDetailViewProps {
  user: UserWithBank;
  onBack: () => void;
  onUpdate: () => void;
}

export function UserDetailView({ user, onBack }: UserDetailViewProps) {
  const [viewingKYC, setViewingKYC] = useState(false);
  const [presence, setPresence] = useState<UserPresence | null>(null);

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

  return (
    <div className="w-full py-6 px-6">
      <div className="mb-4">
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users List
        </Button>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">User Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Bank</div>
              <Badge variant="secondary">{user.bank_name}</Badge>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Email</div>
              <div className="text-sm font-medium truncate">{user.email}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Password</div>
              <div className="text-sm font-medium">{user.password || '-'}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <div className="flex items-center gap-2">
                <Circle
                  className={`w-3 h-3 ${presence?.is_online ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
                />
                <span className="text-sm font-medium">
                  {presence?.is_online ? 'Online' : 'Offline'}
                </span>
              </div>
              {presence?.country && (
                <div className="text-xs text-gray-500 mt-1">
                  {presence.city ? `${presence.city}, ` : ''}{presence.country}
                </div>
              )}
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Roles</div>
              <div className="flex gap-1 flex-wrap">
                {user.is_admin && <Badge className="text-xs px-2 py-0">Admin</Badge>}
                {user.is_manager && <Badge variant="outline" className="text-xs px-2 py-0">Manager</Badge>}
                {user.is_superiormanager && <Badge variant="outline" className="text-xs px-2 py-0">Superior</Badge>}
                {!user.is_admin && !user.is_manager && !user.is_superiormanager && (
                  <span className="text-xs text-gray-500">None</span>
                )}
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setViewingKYC(true)}
                size="sm"
                variant="outline"
              >
                <FileText className="w-3 h-3 mr-1" />
                KYC Docs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <BalanceManager bankKey={user.bank_key} userId={user.id} />

      <div className="mt-4">
        <UserTaxesCard user={user} />
      </div>

      <div className="mt-4">
        <UserMessagesCard user={user} />
      </div>

      <div className="mt-4">
        <UserActivitiesCard user={user} />
      </div>

      <div className="mt-4">
        <UserExternalAccountsCard user={user} />
      </div>

      <div className="mt-4">
        <UserTransfersCard user={user} />
      </div>

      <div className="mt-4">
        <UserCryptoBalancesCard user={user} />
      </div>

      <div className="mt-4">
        <UserCryptoTransactionsCard user={user} />
      </div>

      <div className="mt-4">
        <UserCardsManagement user={user} />
      </div>

      {viewingKYC && (
        <KYCDocumentsDialog
          user={user}
          onClose={() => setViewingKYC(false)}
        />
      )}
    </div>
  );
}
