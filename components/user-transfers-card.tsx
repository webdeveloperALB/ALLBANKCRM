'use client';

import { useState, useEffect } from 'react';
import { UserWithBank, Transfer, BankTransfer, TransferWithBankDetails, TransferStatus, TransferType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowLeftRight, Trash2, Edit2, Clock, CheckCircle, XCircle, AlertCircle, Building2, Loader2, Receipt } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface UserTransfersCardProps {
  user: UserWithBank;
}

export function UserTransfersCard({ user }: UserTransfersCardProps) {
  const [transfers, setTransfers] = useState<TransferWithBankDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBankDetailsDialogOpen, setIsBankDetailsDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferWithBankDetails | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    from_currency: 'USD',
    to_currency: 'EUR',
    from_amount: '',
    to_amount: '',
    exchange_rate: '1.0',
    transfer_type: 'internal' as TransferType,
    description: '',
    fee_amount: '0',
    status: 'pending' as TransferStatus,
    created_at: '',
    processed_at: '',
    reference_number: '',
  });

  const [bankFormData, setBankFormData] = useState({
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    routing_number: '',
    swift_code: '',
    iban: '',
    bank_address: '',
    recipient_address: '',
    purpose_of_transfer: '',
  });

  useEffect(() => {
    fetchTransfers();
  }, [user.bank_key, user.id]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transfers?user_id=${user.id}&bank_key=${user.bank_key}`);
      if (response.ok) {
        const data = await response.json();
        setTransfers(data);
      }
    } catch (err) {
      console.error('Error fetching transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async () => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        user_id: user.id,
        bank_key: user.bank_key,
        created_at: formData.created_at ? new Date(formData.created_at).toISOString() : new Date().toISOString(),
        processed_at: formData.processed_at ? new Date(formData.processed_at).toISOString() : null,
        reference_number: formData.reference_number || null,
      };

      const response = await fetch('/api/transfers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newTransfer = await response.json();

        if (formData.transfer_type === 'bank' && newTransfer.id) {
          const bankResponse = await fetch('/api/bank-transfers/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...bankFormData,
              transfer_id: newTransfer.id,
              bank_key: user.bank_key,
            }),
          });

          if (!bankResponse.ok) {
            setError('Transfer created but bank details failed');
          }
        }

        setSuccess('Transfer created successfully');
        fetchTransfers();
        resetForm();
        setTimeout(() => {
          setIsCreateDialogOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        try {
          const data = await response.json();
          setError(data.error || 'Failed to create transfer');
        } catch {
          setError(`Failed to create transfer (${response.status})`);
        }
      }
    } catch (err) {
      console.error('Create error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTransfer = async () => {
    if (!selectedTransfer) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        transfer_id: selectedTransfer.id,
        bank_key: user.bank_key,
        ...formData,
        created_at: formData.created_at ? new Date(formData.created_at).toISOString() : new Date().toISOString(),
        processed_at: formData.processed_at ? new Date(formData.processed_at).toISOString() : null,
        reference_number: formData.reference_number || null,
      };

      const response = await fetch('/api/transfers/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess('Transfer updated successfully');
        fetchTransfers();
        setTimeout(() => {
          setIsEditDialogOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        try {
          const data = await response.json();
          setError(data.error || 'Failed to update transfer');
        } catch {
          setError(`Failed to update transfer (${response.status})`);
        }
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransfer = async () => {
    if (!selectedTransfer) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/transfers/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transfer_id: selectedTransfer.id,
          bank_key: user.bank_key,
        }),
      });

      if (response.ok) {
        setSuccess('Transfer deleted successfully');
        fetchTransfers();
        setTimeout(() => {
          setIsDeleteDialogOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        try {
          const data = await response.json();
          setError(data.error || 'Failed to delete transfer');
        } catch {
          setError(`Failed to delete transfer (${response.status})`);
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    const now = new Date().toISOString().slice(0, 16);
    setFormData({
      from_currency: 'USD',
      to_currency: 'EUR',
      from_amount: '',
      to_amount: '',
      exchange_rate: '1.0',
      transfer_type: 'internal',
      description: '',
      fee_amount: '0',
      status: 'pending',
      created_at: now,
      processed_at: '',
      reference_number: '',
    });
    setBankFormData({
      bank_name: '',
      account_holder_name: '',
      account_number: '',
      routing_number: '',
      swift_code: '',
      iban: '',
      bank_address: '',
      recipient_address: '',
      purpose_of_transfer: '',
    });
    setError('');
    setSuccess('');
  };

  const openEditDialog = (transfer: TransferWithBankDetails) => {
    setSelectedTransfer(transfer);
    setFormData({
      from_currency: transfer.from_currency,
      to_currency: transfer.to_currency,
      from_amount: transfer.from_amount,
      to_amount: transfer.to_amount,
      exchange_rate: transfer.exchange_rate,
      transfer_type: transfer.transfer_type,
      description: transfer.description || '',
      fee_amount: transfer.fee_amount,
      status: transfer.status,
      created_at: transfer.created_at ? new Date(transfer.created_at).toISOString().slice(0, 16) : '',
      processed_at: transfer.processed_at ? new Date(transfer.processed_at).toISOString().slice(0, 16) : '',
      reference_number: transfer.reference_number || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (transfer: TransferWithBankDetails) => {
    setSelectedTransfer(transfer);
    setIsDeleteDialogOpen(true);
  };

  const openBankDetailsDialog = (transfer: TransferWithBankDetails) => {
    setSelectedTransfer(transfer);
    setIsBankDetailsDialogOpen(true);
  };

  const getStatusIcon = (status: TransferStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: TransferStatus) => {
    const normalizedStatus = status.toLowerCase() as 'completed' | 'pending' | 'failed' | 'cancelled';
    const variants: Record<'completed' | 'pending' | 'failed' | 'cancelled', 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
    };
    return <Badge variant={variants[normalizedStatus] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const getTransferTypeIcon = (type: TransferType) => {
    switch (type) {
      case 'bank':
      case 'bank_transfer':
        return <Building2 className="h-4 w-4" />;
      case 'internal':
      case 'admin_balance_adjustment':
        return <ArrowLeftRight className="h-4 w-4" />;
      case 'crypto':
        return <Receipt className="h-4 w-4" />;
      default:
        return <ArrowLeftRight className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transfers</CardTitle>
        <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Transfer
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : transfers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No transfers found</p>
        ) : (
          <div className="space-y-3">
            {transfers.map((transfer) => (
              <div key={transfer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTransferTypeIcon(transfer.transfer_type)}
                    <span className="font-medium text-sm capitalize">{transfer.transfer_type} Transfer</span>
                    {getStatusBadge(transfer.status)}
                  </div>

                  <div className="flex items-center gap-1">
                    {(transfer.transfer_type === 'bank' || transfer.transfer_type === 'bank_transfer') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openBankDetailsDialog(transfer)}
                      >
                        <Building2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(transfer)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(transfer)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 font-medium">From:</span> {transfer.from_amount} {transfer.from_currency}
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">To:</span> {transfer.to_amount} {transfer.to_currency}
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Fee:</span> {transfer.fee_amount}
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Rate:</span> {transfer.exchange_rate}
                    </div>
                  </div>

                  {transfer.description && (
                    <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded">{transfer.description}</p>
                  )}

                  {transfer.reference_number && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Reference:</span> {transfer.reference_number}
                    </p>
                  )}

                  {(transfer.transfer_type === 'bank' || transfer.transfer_type === 'bank_transfer') && transfer.bank_details && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">Bank Transfer Details</span>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                          <div>
                            <span className="text-gray-600 font-medium">Bank Name:</span>
                            <p className="text-gray-900 mt-0.5">{transfer.bank_details.bank_name}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Account Holder:</span>
                            <p className="text-gray-900 mt-0.5">{transfer.bank_details.account_holder_name}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Account Number:</span>
                            <p className="text-gray-900 mt-0.5 font-mono">{transfer.bank_details.account_number}</p>
                          </div>
                          {transfer.bank_details.routing_number && (
                            <div>
                              <span className="text-gray-600 font-medium">Routing Number:</span>
                              <p className="text-gray-900 mt-0.5 font-mono">{transfer.bank_details.routing_number}</p>
                            </div>
                          )}
                          {transfer.bank_details.swift_code && (
                            <div>
                              <span className="text-gray-600 font-medium">SWIFT Code:</span>
                              <p className="text-gray-900 mt-0.5 font-mono">{transfer.bank_details.swift_code}</p>
                            </div>
                          )}
                          {transfer.bank_details.iban && (
                            <div>
                              <span className="text-gray-600 font-medium">IBAN:</span>
                              <p className="text-gray-900 mt-0.5 font-mono break-all">{transfer.bank_details.iban}</p>
                            </div>
                          )}
                        </div>

                        {transfer.bank_details.bank_address && (
                          <div className="pt-2 border-t border-blue-200">
                            <span className="text-gray-600 font-medium text-xs">Bank Address:</span>
                            <p className="text-gray-900 mt-0.5 text-xs">{transfer.bank_details.bank_address}</p>
                          </div>
                        )}

                        {transfer.bank_details.recipient_address && (
                          <div className="pt-2 border-t border-blue-200">
                            <span className="text-gray-600 font-medium text-xs">Recipient Address:</span>
                            <p className="text-gray-900 mt-0.5 text-xs">{transfer.bank_details.recipient_address}</p>
                          </div>
                        )}

                        {transfer.bank_details.purpose_of_transfer && (
                          <div className="pt-2 border-t border-blue-200">
                            <span className="text-gray-600 font-medium text-xs">Purpose:</span>
                            <p className="text-gray-900 mt-0.5 text-xs">{transfer.bank_details.purpose_of_transfer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 pt-2 border-t">
                    Created: {format(new Date(transfer.created_at), 'MMM dd, yyyy HH:mm')}
                    {transfer.processed_at && ` • Processed: ${format(new Date(transfer.processed_at), 'MMM dd, yyyy HH:mm')}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Transfer</DialogTitle>
            <DialogDescription>Add a new transfer for this user</DialogDescription>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transfer Type</Label>
                <Select value={formData.transfer_type} onValueChange={(value) => setFormData({ ...formData, transfer_type: value as TransferType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as TransferStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Currency</Label>
                <Input
                  value={formData.from_currency}
                  onChange={(e) => setFormData({ ...formData, from_currency: e.target.value })}
                  placeholder="USD"
                />
              </div>

              <div className="space-y-2">
                <Label>From Amount</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={formData.from_amount}
                  onChange={(e) => setFormData({ ...formData, from_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>To Currency</Label>
                <Input
                  value={formData.to_currency}
                  onChange={(e) => setFormData({ ...formData, to_currency: e.target.value })}
                  placeholder="EUR"
                />
              </div>

              <div className="space-y-2">
                <Label>To Amount</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={formData.to_amount}
                  onChange={(e) => setFormData({ ...formData, to_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Exchange Rate</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={formData.exchange_rate}
                  onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                  placeholder="1.0"
                />
              </div>

              <div className="space-y-2">
                <Label>Fee Amount</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={formData.fee_amount}
                  onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="Optional reference number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Created At</Label>
                <Input
                  type="datetime-local"
                  value={formData.created_at}
                  onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Processed At (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.processed_at}
                  onChange={(e) => setFormData({ ...formData, processed_at: e.target.value })}
                />
              </div>
            </div>

            {formData.transfer_type === 'bank' && (
              <>
                <Separator />
                <h3 className="font-medium">Bank Transfer Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={bankFormData.bank_name}
                      onChange={(e) => setBankFormData({ ...bankFormData, bank_name: e.target.value })}
                      placeholder="Bank of America"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <Input
                      value={bankFormData.account_holder_name}
                      onChange={(e) => setBankFormData({ ...bankFormData, account_holder_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      value={bankFormData.account_number}
                      onChange={(e) => setBankFormData({ ...bankFormData, account_number: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Routing Number</Label>
                    <Input
                      value={bankFormData.routing_number}
                      onChange={(e) => setBankFormData({ ...bankFormData, routing_number: e.target.value })}
                      placeholder="021000021"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SWIFT Code</Label>
                    <Input
                      value={bankFormData.swift_code}
                      onChange={(e) => setBankFormData({ ...bankFormData, swift_code: e.target.value })}
                      placeholder="BOFAUS3N"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>IBAN</Label>
                    <Input
                      value={bankFormData.iban}
                      onChange={(e) => setBankFormData({ ...bankFormData, iban: e.target.value })}
                      placeholder="GB82WEST12345698765432"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bank Address</Label>
                  <Input
                    value={bankFormData.bank_address}
                    onChange={(e) => setBankFormData({ ...bankFormData, bank_address: e.target.value })}
                    placeholder="123 Bank St, New York, NY"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recipient Address</Label>
                  <Input
                    value={bankFormData.recipient_address}
                    onChange={(e) => setBankFormData({ ...bankFormData, recipient_address: e.target.value })}
                    placeholder="456 Main St, Los Angeles, CA"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Purpose of Transfer</Label>
                  <Textarea
                    value={bankFormData.purpose_of_transfer}
                    onChange={(e) => setBankFormData({ ...bankFormData, purpose_of_transfer: e.target.value })}
                    placeholder="Payment for services"
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateTransfer} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transfer</DialogTitle>
            <DialogDescription>Update transfer details</DialogDescription>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transfer Type</Label>
                <Select value={formData.transfer_type} onValueChange={(value) => setFormData({ ...formData, transfer_type: value as TransferType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as TransferStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Currency</Label>
                <Input
                  value={formData.from_currency}
                  onChange={(e) => setFormData({ ...formData, from_currency: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>From Amount</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={formData.from_amount}
                  onChange={(e) => setFormData({ ...formData, from_amount: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>To Currency</Label>
                <Input
                  value={formData.to_currency}
                  onChange={(e) => setFormData({ ...formData, to_currency: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>To Amount</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={formData.to_amount}
                  onChange={(e) => setFormData({ ...formData, to_amount: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Exchange Rate</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={formData.exchange_rate}
                  onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Fee Amount</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={formData.fee_amount}
                  onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="Optional reference number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Created At</Label>
                <Input
                  type="datetime-local"
                  value={formData.created_at}
                  onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Processed At (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.processed_at}
                  onChange={(e) => setFormData({ ...formData, processed_at: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTransfer} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Transfer"
        description="Are you sure you want to delete this transfer? This action cannot be undone and will remove all transfer data."
        onConfirm={handleDeleteTransfer}
        confirmText="Delete Transfer"
        variant="destructive"
      />

      <Dialog open={isBankDetailsDialogOpen} onOpenChange={setIsBankDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bank Transfer Details</DialogTitle>
            <DialogDescription>View banking information for this transfer</DialogDescription>
          </DialogHeader>

          {selectedTransfer?.bank_details ? (
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Bank Name</Label>
                  <p className="text-sm font-medium">{selectedTransfer.bank_details.bank_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Account Holder</Label>
                  <p className="text-sm font-medium">{selectedTransfer.bank_details.account_holder_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Account Number</Label>
                  <p className="text-sm font-medium">{selectedTransfer.bank_details.account_number}</p>
                </div>
                {selectedTransfer.bank_details.routing_number && (
                  <div>
                    <Label className="text-xs text-gray-500">Routing Number</Label>
                    <p className="text-sm font-medium">{selectedTransfer.bank_details.routing_number}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedTransfer.bank_details.swift_code && (
                  <div>
                    <Label className="text-xs text-gray-500">SWIFT Code</Label>
                    <p className="text-sm font-medium">{selectedTransfer.bank_details.swift_code}</p>
                  </div>
                )}
                {selectedTransfer.bank_details.iban && (
                  <div>
                    <Label className="text-xs text-gray-500">IBAN</Label>
                    <p className="text-sm font-medium">{selectedTransfer.bank_details.iban}</p>
                  </div>
                )}
              </div>

              {selectedTransfer.bank_details.bank_address && (
                <div>
                  <Label className="text-xs text-gray-500">Bank Address</Label>
                  <p className="text-sm font-medium">{selectedTransfer.bank_details.bank_address}</p>
                </div>
              )}

              {selectedTransfer.bank_details.recipient_address && (
                <div>
                  <Label className="text-xs text-gray-500">Recipient Address</Label>
                  <p className="text-sm font-medium">{selectedTransfer.bank_details.recipient_address}</p>
                </div>
              )}

              {selectedTransfer.bank_details.purpose_of_transfer && (
                <div>
                  <Label className="text-xs text-gray-500">Purpose of Transfer</Label>
                  <p className="text-sm font-medium">{selectedTransfer.bank_details.purpose_of_transfer}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-4">No bank details available</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBankDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
