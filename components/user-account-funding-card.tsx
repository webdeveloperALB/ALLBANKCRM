'use client';

import { useState, useEffect } from 'react';
import { UserWithBank } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, Loader2, Building2, Bitcoin, CheckCircle, XCircle, Clock, Edit2, Trash2, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

interface UserAccountFundingCardProps {
  user: UserWithBank;
}

interface FundAccount {
  id: string;
  user_id: string;
  funding_method: 'crypto' | 'bank';
  status: 'pending' | 'success';
  amount: string;
  currency: string;
  user_name: string;
  user_email: string;
  crypto_type?: string | null;
  crypto_address?: string | null;
  bank_beneficiary?: string | null;
  bank_iban?: string | null;
  bank_bic?: string | null;
  bank_name?: string | null;
  reference_number?: string | null;
  created_at: string;
  updated_at: string;
}

interface UserBankDetails {
  id: string;
  user_id: string;
  beneficiary: string;
  iban: string;
  bic: string;
  bank_name: string;
  created_at: string;
  updated_at: string;
}

interface CryptoWallet {
  id: string;
  user_id: string;
  crypto_type: 'bitcoin' | 'ethereum' | 'usdt_erc20' | 'usdt_trc20';
  wallet_address: string;
  label: string;
  symbol: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CRYPTO_TYPES = [
  { value: 'bitcoin', label: 'Bitcoin', symbol: 'BTC' },
  { value: 'ethereum', label: 'Ethereum', symbol: 'ETH' },
  { value: 'usdt_erc20', label: 'USDT (ERC20)', symbol: 'USDT' },
  { value: 'usdt_trc20', label: 'USDT (TRC20)', symbol: 'USDT' },
];

export function UserAccountFundingCard({ user }: UserAccountFundingCardProps) {
  const [fundingRequests, setFundingRequests] = useState<FundAccount[]>([]);
  const [bankDetails, setBankDetails] = useState<UserBankDetails | null>(null);
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedRequest, setSelectedRequest] = useState<FundAccount | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBankDetailsDialogOpen, setIsBankDetailsDialogOpen] = useState(false);
  const [isCryptoWalletsDialogOpen, setIsCryptoWalletsDialogOpen] = useState(false);
  const [isAddWalletDialogOpen, setIsAddWalletDialogOpen] = useState(false);
  const [isEditWalletDialogOpen, setIsEditWalletDialogOpen] = useState(false);
  const [isDeleteWalletDialogOpen, setIsDeleteWalletDialogOpen] = useState(false);

  const [bankDetailsForm, setBankDetailsForm] = useState({
    beneficiary: '',
    iban: '',
    bic: '',
    bank_name: '',
  });

  const [walletForm, setWalletForm] = useState({
    crypto_type: 'bitcoin' as CryptoWallet['crypto_type'],
    wallet_address: '',
    label: 'Bitcoin',
    symbol: 'BTC',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, [user.bank_key, user.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchFundingRequests(), fetchBankDetails(), fetchCryptoWallets()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFundingRequests = async () => {
    try {
      const response = await fetch(`/api/fund-accounts?user_id=${user.id}&bank_key=${user.bank_key}`);
      if (response.ok) {
        const data = await response.json();
        setFundingRequests(data);
      }
    } catch (err) {
      console.error('Error fetching funding requests:', err);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const response = await fetch(`/api/user-bank-details?user_id=${user.id}&bank_key=${user.bank_key}`);
      if (response.ok) {
        const data = await response.json();
        setBankDetails(data);
        if (data) {
          setBankDetailsForm({
            beneficiary: data.beneficiary,
            iban: data.iban,
            bic: data.bic,
            bank_name: data.bank_name,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching bank details:', err);
    }
  };

  const fetchCryptoWallets = async () => {
    try {
      const response = await fetch(`/api/crypto-wallets?user_id=${user.id}&bank_key=${user.bank_key}`);
      if (response.ok) {
        const data = await response.json();
        setCryptoWallets(data);
      }
    } catch (err) {
      console.error('Error fetching crypto wallets:', err);
    }
  };

  const getDefaultWallets = async () => {
    try {
      const response = await fetch(`/api/crypto-wallets?user_id=null&bank_key=${user.bank_key}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.error('Error fetching default wallets:', err);
    }
    return [];
  };

  const handleUpdateStatus = async (newStatus: 'pending' | 'success') => {
    if (!selectedRequest) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/fund-accounts/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fund_account_id: selectedRequest.id,
          bank_key: user.bank_key,
          status: newStatus,
        }),
      });

      if (response.ok) {
        setSuccess(`Status updated to ${newStatus}`);
        fetchFundingRequests();
        setTimeout(() => {
          setIsStatusDialogOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/fund-accounts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fund_account_id: selectedRequest.id,
          bank_key: user.bank_key,
        }),
      });

      if (response.ok) {
        setSuccess('Funding request deleted successfully');
        fetchFundingRequests();
        setTimeout(() => {
          setIsDeleteDialogOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete request');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveBankDetails = async () => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/user-bank-details/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          bank_key: user.bank_key,
          ...bankDetailsForm,
        }),
      });

      if (response.ok) {
        setSuccess('Bank details updated successfully');
        fetchBankDetails();
        setTimeout(() => {
          setIsBankDetailsDialogOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update bank details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const resetWalletForm = () => {
    setWalletForm({
      crypto_type: 'bitcoin',
      wallet_address: '',
      label: 'Bitcoin',
      symbol: 'BTC',
      is_active: true,
    });
    setError('');
    setSuccess('');
  };

  const openAddWalletDialog = () => {
    resetWalletForm();
    setIsAddWalletDialogOpen(true);
  };

  const openEditWalletDialog = async (wallet: CryptoWallet) => {
    setSelectedWallet(wallet);

    const defaultWallets = await getDefaultWallets();
    const defaultWallet = defaultWallets.find((w: CryptoWallet) => w.crypto_type === wallet.crypto_type);

    setWalletForm({
      crypto_type: wallet.crypto_type,
      wallet_address: wallet.wallet_address || (defaultWallet?.wallet_address || ''),
      label: wallet.label || (defaultWallet?.label || wallet.crypto_type),
      symbol: wallet.symbol || (defaultWallet?.symbol || ''),
      is_active: wallet.is_active,
    });
    setError('');
    setSuccess('');
    setIsEditWalletDialogOpen(true);
  };

  const openDeleteWalletDialog = (wallet: CryptoWallet) => {
    setSelectedWallet(wallet);
    setIsDeleteWalletDialogOpen(true);
  };

  const handleCryptoTypeChange = (value: string) => {
    const cryptoType = CRYPTO_TYPES.find(t => t.value === value);
    if (cryptoType) {
      setWalletForm({
        ...walletForm,
        crypto_type: value as CryptoWallet['crypto_type'],
        symbol: cryptoType.symbol,
        label: cryptoType.label,
      });
    }
  };

  const handleAddWallet = async () => {
    if (!walletForm.wallet_address.trim() || !walletForm.label.trim()) {
      setError('Wallet address and label are required');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/crypto-wallets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          bank_key: user.bank_key,
          ...walletForm,
        }),
      });

      if (response.ok) {
        setSuccess('Wallet added successfully');
        fetchCryptoWallets();
        setTimeout(() => {
          setIsAddWalletDialogOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add wallet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateWallet = async () => {
    if (!selectedWallet || !walletForm.wallet_address.trim() || !walletForm.label.trim()) {
      setError('Wallet address and label are required');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/crypto-wallets/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_id: selectedWallet.id,
          user_id: user.id,
          bank_key: user.bank_key,
          ...walletForm,
        }),
      });

      if (response.ok) {
        setSuccess('Wallet updated successfully');
        fetchCryptoWallets();
        setTimeout(() => {
          setIsEditWalletDialogOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update wallet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWallet = async () => {
    if (!selectedWallet) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/crypto-wallets/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_id: selectedWallet.id,
          user_id: user.id,
          bank_key: user.bank_key,
        }),
      });

      if (response.ok) {
        setSuccess('Wallet deleted successfully');
        fetchCryptoWallets();
        setTimeout(() => {
          setIsDeleteWalletDialogOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete wallet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const openStatusDialog = (request: FundAccount) => {
    setSelectedRequest(request);
    setIsStatusDialogOpen(true);
  };

  const openDeleteDialog = (request: FundAccount) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  const openBankDetailsDialog = () => {
    if (bankDetails) {
      setBankDetailsForm({
        beneficiary: bankDetails.beneficiary,
        iban: bankDetails.iban,
        bic: bankDetails.bic,
        bank_name: bankDetails.bank_name,
      });
    }
    setIsBankDetailsDialogOpen(true);
  };

  const openCryptoWalletsDialog = () => {
    setError('');
    setSuccess('');
    setIsCryptoWalletsDialogOpen(true);
  };

  const getStatusBadge = (status: 'pending' | 'success') => {
    if (status === 'success') {
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
    }
    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  const getFundingMethodIcon = (method: 'crypto' | 'bank') => {
    if (method === 'crypto') {
      return <Bitcoin className="h-4 w-4 text-orange-600" />;
    }
    return <Building2 className="h-4 w-4 text-blue-600" />;
  };

  const getCryptoTypeLabel = (type: string) => {
    return CRYPTO_TYPES.find(t => t.value === type)?.label || type;
  };

  const getCryptoIcon = (type: string) => {
    const colors: Record<string, string> = {
      bitcoin: 'text-orange-500',
      ethereum: 'text-blue-500',
      usdt_erc20: 'text-green-500',
      usdt_trc20: 'text-teal-500',
    };
    return <Bitcoin className={`h-5 w-5 ${colors[type] || 'text-gray-500'}`} />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Account Funding</CardTitle>
        <div className="flex gap-2">
          <Button onClick={openBankDetailsDialog} size="sm" variant="outline">
            <Building2 className="h-4 w-4 mr-1" />
            Edit Bank Details
          </Button>
          <Button onClick={openCryptoWalletsDialog} size="sm" variant="outline">
            <Wallet className="h-4 w-4 mr-1" />
            Edit Crypto Wallets
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : fundingRequests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No funding requests found</p>
            ) : (
              <div className="space-y-3">
                {fundingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getFundingMethodIcon(request.funding_method)}
                        <span className="font-medium text-sm capitalize">{request.funding_method} Funding</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openStatusDialog(request)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(request)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-gray-500 font-medium">Amount:</span>
                          <p className="text-gray-900 mt-0.5">{request.amount} {request.currency}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">Name:</span>
                          <p className="text-gray-900 mt-0.5">{request.user_name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">Email:</span>
                          <p className="text-gray-900 mt-0.5">{request.user_email}</p>
                        </div>
                        {request.reference_number && (
                          <div>
                            <span className="text-gray-500 font-medium">Reference:</span>
                            <p className="text-gray-900 mt-0.5 font-mono text-xs">{request.reference_number}</p>
                          </div>
                        )}
                      </div>

                      {request.funding_method === 'crypto' && request.crypto_type && (
                        <div className="mt-3 pt-3 border-t bg-orange-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Bitcoin className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-semibold text-orange-900">Crypto Details</span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-gray-600 font-medium">Type:</span>
                              <p className="text-gray-900 mt-0.5 capitalize">{request.crypto_type}</p>
                            </div>
                            {request.crypto_address && (
                              <div>
                                <span className="text-gray-600 font-medium">Address:</span>
                                <p className="text-gray-900 mt-0.5 font-mono break-all text-xs">{request.crypto_address}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {request.funding_method === 'bank' && request.bank_beneficiary && (
                        <div className="mt-3 pt-3 border-t bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-900">Bank Details</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div>
                              <span className="text-gray-600 font-medium">Beneficiary:</span>
                              <p className="text-gray-900 mt-0.5">{request.bank_beneficiary}</p>
                            </div>
                            {request.bank_name && (
                              <div>
                                <span className="text-gray-600 font-medium">Bank Name:</span>
                                <p className="text-gray-900 mt-0.5">{request.bank_name}</p>
                              </div>
                            )}
                            {request.bank_iban && (
                              <div>
                                <span className="text-gray-600 font-medium">IBAN:</span>
                                <p className="text-gray-900 mt-0.5 font-mono break-all">{request.bank_iban}</p>
                              </div>
                            )}
                            {request.bank_bic && (
                              <div>
                                <span className="text-gray-600 font-medium">BIC/SWIFT:</span>
                                <p className="text-gray-900 mt-0.5 font-mono">{request.bank_bic}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 pt-2 border-t">
                        Created: {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </CardContent>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Funding Status</DialogTitle>
            <DialogDescription>
              Change the status of this funding request
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {selectedRequest && (
            <div className="py-4 space-y-4">
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-600">Amount: <span className="font-medium text-gray-900">{selectedRequest.amount} {selectedRequest.currency}</span></p>
                <p className="text-sm text-gray-600 mt-1">Current Status: {getStatusBadge(selectedRequest.status)}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdateStatus('success')}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approve
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('pending')}
                  disabled={submitting}
                  variant="outline"
                  className="flex-1"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Set Pending
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} disabled={submitting}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Funding Request"
        description="Are you sure you want to delete this funding request? This action cannot be undone."
        onConfirm={handleDeleteRequest}
        confirmText="Delete Request"
        variant="destructive"
      />

      <Dialog open={isBankDetailsDialogOpen} onOpenChange={setIsBankDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bank Details</DialogTitle>
            <DialogDescription>
              Update the user's bank information
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Beneficiary Name</Label>
              <Input
                value={bankDetailsForm.beneficiary}
                onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, beneficiary: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                value={bankDetailsForm.bank_name}
                onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, bank_name: e.target.value })}
                placeholder="Bank of Example"
              />
            </div>

            <div className="space-y-2">
              <Label>IBAN</Label>
              <Input
                value={bankDetailsForm.iban}
                onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, iban: e.target.value })}
                placeholder="GB82WEST12345698765432"
              />
            </div>

            <div className="space-y-2">
              <Label>BIC/SWIFT Code</Label>
              <Input
                value={bankDetailsForm.bic}
                onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, bic: e.target.value })}
                placeholder="BOFAUS3N"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBankDetailsDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveBankDetails} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCryptoWalletsDialogOpen} onOpenChange={setIsCryptoWalletsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Crypto Wallets</DialogTitle>
            <DialogDescription>
              View and manage cryptocurrency wallet addresses for this user
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            {cryptoWallets.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">No crypto wallets configured</p>
                <Button onClick={openAddWalletDialog} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Create New and Edit Wallet
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <Button onClick={openAddWalletDialog} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Wallet
                  </Button>
                </div>
                <div className="space-y-3">
                  {cryptoWallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className={`border rounded-lg p-4 ${!wallet.is_active ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getCryptoIcon(wallet.crypto_type)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{wallet.label}</span>
                              <Badge variant="outline" className="text-xs">
                                {wallet.symbol}
                              </Badge>
                              {wallet.is_active ? (
                                <Badge variant="default" className="text-xs bg-green-600">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {getCryptoTypeLabel(wallet.crypto_type)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditWalletDialog(wallet)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteWalletDialog(wallet)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded p-3">
                        <Label className="text-xs text-gray-600">Wallet Address</Label>
                        <p className="text-xs font-mono text-gray-900 mt-1 break-all">
                          {wallet.wallet_address}
                        </p>
                      </div>

                      <p className="text-xs text-gray-400 mt-2">
                        Updated: {format(new Date(wallet.updated_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCryptoWalletsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddWalletDialogOpen} onOpenChange={setIsAddWalletDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Crypto Wallet</DialogTitle>
            <DialogDescription>
              Add a new cryptocurrency wallet address for this user
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cryptocurrency Type</Label>
              <Select value={walletForm.crypto_type} onValueChange={handleCryptoTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRYPTO_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} ({type.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Wallet Label (Auto-filled)</Label>
              <Input
                value={walletForm.label}
                onChange={(e) => setWalletForm({ ...walletForm, label: e.target.value })}
                placeholder="Auto-filled based on crypto type"
              />
            </div>

            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <Input
                value={walletForm.wallet_address}
                onChange={(e) => setWalletForm({ ...walletForm, wallet_address: e.target.value })}
                placeholder="Enter wallet address"
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active Wallet</Label>
              <Switch
                id="is_active"
                checked={walletForm.is_active}
                onCheckedChange={(checked) => setWalletForm({ ...walletForm, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddWalletDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleAddWallet} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditWalletDialogOpen} onOpenChange={setIsEditWalletDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Crypto Wallet</DialogTitle>
            <DialogDescription>
              Update the cryptocurrency wallet information
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cryptocurrency Type</Label>
              <Select value={walletForm.crypto_type} onValueChange={handleCryptoTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRYPTO_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} ({type.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Wallet Label (Auto-filled)</Label>
              <Input
                value={walletForm.label}
                onChange={(e) => setWalletForm({ ...walletForm, label: e.target.value })}
                placeholder="Auto-filled based on crypto type"
              />
            </div>

            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <Input
                value={walletForm.wallet_address}
                onChange={(e) => setWalletForm({ ...walletForm, wallet_address: e.target.value })}
                placeholder="Enter wallet address"
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit_is_active">Active Wallet</Label>
              <Switch
                id="edit_is_active"
                checked={walletForm.is_active}
                onCheckedChange={(checked) => setWalletForm({ ...walletForm, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditWalletDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWallet} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteWalletDialogOpen}
        onOpenChange={setIsDeleteWalletDialogOpen}
        title="Delete Crypto Wallet"
        description="Are you sure you want to delete this wallet? This action cannot be undone."
        onConfirm={handleDeleteWallet}
        confirmText="Delete Wallet"
        variant="destructive"
      />
    </Card>
  );
}
