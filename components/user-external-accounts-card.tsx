'use client';

import { useState, useEffect } from 'react';
import { UserWithBank, ExternalAccount } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, CreditCard as Edit, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Loader as Loader2, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

interface UserExternalAccountsCardProps {
  user: UserWithBank;
}

const accountTypes = ['Checking', 'Savings', 'Business', 'Money Market'];
const currencies = ['USD', 'EUR', 'CAD', 'GBP', 'JPY'];

export function UserExternalAccountsCard({ user }: UserExternalAccountsCardProps) {
  const [accounts, setAccounts] = useState<ExternalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState<ExternalAccount | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: 'Checking',
    currency: 'USD',
    is_verified: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; accountId: string | null }>({ open: false, accountId: null });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/external-accounts?user_id=${user.id}&bank_key=${user.bank_key}`);
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching external accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user.id, user.bank_key]);

  const handleOpenDialog = (account?: ExternalAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        account_name: account.account_name,
        bank_name: account.bank_name,
        account_number: account.account_number,
        routing_number: account.routing_number || '',
        account_type: account.account_type,
        currency: account.currency,
        is_verified: account.is_verified,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        account_name: '',
        bank_name: '',
        account_number: '',
        routing_number: '',
        account_type: 'Checking',
        currency: 'USD',
        is_verified: false,
      });
    }
    setShowDialog(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!editingAccount && (!formData.account_name.trim() || !formData.bank_name.trim() || !formData.account_number.trim())) {
      setError('Account name, bank name, and account number are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const endpoint = editingAccount
        ? '/api/external-accounts/update'
        : '/api/external-accounts/create';

      const payload = {
        bank_key: user.bank_key,
        user_id: user.id,
        account_name: formData.account_name,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        routing_number: formData.routing_number,
        account_type: formData.account_type,
        currency: formData.currency,
        is_verified: formData.is_verified,
        ...(editingAccount && { account_id: editingAccount.id }),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(editingAccount ? 'External account updated successfully!' : 'External account added successfully!');
        await fetchAccounts();
        setTimeout(() => {
          setShowDialog(false);
          setSuccess('');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save external account');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.accountId) return;

    try {
      const response = await fetch('/api/external-accounts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_key: user.bank_key,
          account_id: deleteConfirm.accountId,
        }),
      });

      if (response.ok) {
        await fetchAccounts();
        toast.success('External account deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete external account');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return '••••' + accountNumber.slice(-4);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">Loading external accounts...</CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">External Accounts</CardTitle>
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-1" />
              Add Account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No external accounts found</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <h4 className="font-medium text-sm truncate">{account.account_name}</h4>
                        {account.is_verified && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p><span className="font-medium">Bank:</span> {account.bank_name}</p>
                        <p><span className="font-medium">Account:</span> {maskAccountNumber(account.account_number)}</p>
                        {account.routing_number && (
                          <p><span className="font-medium">Routing:</span> {account.routing_number}</p>
                        )}
                        <div className="flex items-center gap-4 pt-1">
                          <Badge variant="outline" className="text-xs">
                            {account.account_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {account.currency}
                          </Badge>
                          <span className="text-gray-400">{new Date(account.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDialog(account)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm({ open: true, accountId: account.id })}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit External Account' : 'Add External Account'}</DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Update the external account details' : 'Add a new external bank account for this user'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="My Savings Account"
              />
            </div>

            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Chase Bank"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label>Routing Number (Optional)</Label>
                <Input
                  value={formData.routing_number}
                  onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                  placeholder="021000021"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(value) => setFormData({ ...formData, account_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-verified"
                checked={formData.is_verified}
                onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
              />
              <Label htmlFor="is-verified">Mark as Verified</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingAccount ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editingAccount ? 'Update' : 'Add'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, accountId: null })}
        title="Delete External Account"
        description="Are you sure you want to delete this external account? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
}
