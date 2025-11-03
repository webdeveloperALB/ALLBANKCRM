'use client';

import { useState, useEffect } from 'react';
import { UserWithBank } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Save, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface UserTaxes {
  id: string;
  user_id: string;
  taxes: string;
  on_hold: string;
  paid: string;
  created_at: string;
  updated_at: string;
}

interface TransactionHistory {
  id: number;
  created_at: string;
  thType: string;
  thDetails: string;
  thPoi: string;
  thStatus: string;
  uuid: string;
  thEmail: string;
}

interface UserTaxesCardProps {
  user: UserWithBank;
}

export function UserTaxesCard({ user }: UserTaxesCardProps) {
  const [taxes, setTaxes] = useState<UserTaxes | null>(null);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingTransaction, setAddingTransaction] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
  const [editingTransactionData, setEditingTransactionData] = useState<Partial<TransactionHistory>>({});

  const [editData, setEditData] = useState({
    taxes: '0.00',
    on_hold: '0.00',
    paid: '0.00'
  });

  const [newTransaction, setNewTransaction] = useState({
    thType: '',
    thDetails: '',
    thPoi: '',
    thStatus: 'Successful',
    thEmail: user.email,
    created_at: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTaxes();
    fetchTransactionHistory();
  }, []);

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/taxes?bankKey=${user.bank_key}&userId=${user.id}`
      );
      const data = await response.json();

      if (data) {
        setTaxes(data);
        setEditData({
          taxes: data.taxes || '0.00',
          on_hold: data.on_hold || '0.00',
          paid: data.paid || '0.00'
        });
      }
    } catch (error) {
      console.error('Error fetching taxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const response = await fetch(
        `/api/transaction-history?bankKey=${user.bank_key}&userId=${user.id}`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/taxes/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          taxes: editData.taxes,
          on_hold: editData.on_hold,
          paid: editData.paid
        })
      });

      if (response.ok) {
        await fetchTaxes();
      } else {
        const errorData = await response.json();
        alert(`Failed to update taxes: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating taxes:', error);
      alert('Error updating taxes: ' + error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.thDetails || !newTransaction.thPoi) {
      alert('Please fill in all required fields');
      return;
    }

    setAddingTransaction(true);
    try {
      const response = await fetch('/api/transaction-history/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          ...newTransaction
        })
      });

      if (response.ok) {
        await fetchTransactionHistory();
        setNewTransaction({
          thType: '',
          thDetails: '',
          thPoi: '',
          thStatus: 'Successful',
          thEmail: user.email,
          created_at: new Date().toISOString().split('T')[0]
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to add transaction: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Error adding transaction: ' + error);
    } finally {
      setAddingTransaction(false);
    }
  };

  const handleEditTransaction = (transaction: TransactionHistory) => {
    setEditingTransactionId(transaction.id);
    setEditingTransactionData({
      thType: transaction.thType,
      thDetails: transaction.thDetails,
      thPoi: transaction.thPoi,
      thStatus: transaction.thStatus,
      thEmail: transaction.thEmail,
      created_at: transaction.created_at.split('T')[0]
    });
  };

  const handleSaveTransaction = async (transactionId: number) => {
    try {
      console.log('Saving transaction:', { transactionId, data: editingTransactionData });

      const response = await fetch('/api/transaction-history/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          transactionId,
          ...editingTransactionData
        })
      });

      if (response.ok) {
        await fetchTransactionHistory();
        setEditingTransactionId(null);
        setEditingTransactionData({});
      } else {
        const errorData = await response.json();
        const errorMessage = errorData?.error || 'Unknown error occurred';
        console.error('Update failed:', errorData);
        alert(`Failed to update transaction: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      alert(`Error updating transaction: ${errorMessage}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setEditingTransactionData({});
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch('/api/transaction-history/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          transactionId
        })
      });

      if (response.ok) {
        await fetchTransactionHistory();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete transaction: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error deleting transaction: ' + error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-lg">Tax Information</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center justify-center py-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-2xl">Tax Information</CardTitle>
      </CardHeader>
      <CardContent className="pb-4 flex-1 flex flex-col">
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded mb-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">Taxes Owed</div>
            <div className="text-2xl font-mono font-semibold">${taxes?.taxes || '0.00'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">On Hold</div>
            <div className="text-2xl font-mono font-semibold">${taxes?.on_hold || '0.00'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Paid</div>
            <div className="text-2xl font-mono font-semibold">${taxes?.paid || '0.00'}</div>
          </div>
        </div>

        <div className="flex items-end gap-2 mb-4">
          <div className="flex-1">
            <Label htmlFor="taxes" className="text-sm mb-1">Taxes Owed</Label>
            <Input
              id="taxes"
              type="text"
              value={editData.taxes}
              onChange={(e) => setEditData({ ...editData, taxes: e.target.value })}
              placeholder="0.00"
              className="h-9 text-sm"
            />
          </div>

          <div className="flex-1">
            <Label htmlFor="on_hold" className="text-sm mb-1">On Hold</Label>
            <Input
              id="on_hold"
              type="text"
              value={editData.on_hold}
              onChange={(e) => setEditData({ ...editData, on_hold: e.target.value })}
              placeholder="0.00"
              className="h-9 text-sm"
            />
          </div>

          <div className="flex-1">
            <Label htmlFor="paid" className="text-sm mb-1">Paid</Label>
            <Input
              id="paid"
              type="text"
              value={editData.paid}
              onChange={(e) => setEditData({ ...editData, paid: e.target.value })}
              placeholder="0.00"
              className="h-9 text-sm"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} size="sm" className="h-9">
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <div className="flex-1 min-h-0 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-semibold">Transaction History</h3>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <Label htmlFor="thType" className="text-sm mb-1">Transaction Type</Label>
              <Input
                id="thType"
                type="text"
                value={newTransaction.thType}
                onChange={(e) => setNewTransaction({ ...newTransaction, thType: e.target.value })}
                placeholder="e.g. External Deposit"
                className="h-9 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="thStatus" className="text-sm mb-1">Status</Label>
              <Select value={newTransaction.thStatus} onValueChange={(value) => setNewTransaction({ ...newTransaction, thStatus: value })}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Successful">Successful</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="created_at" className="text-sm mb-1">Transaction Date *</Label>
              <Input
                id="created_at"
                type="date"
                value={newTransaction.created_at}
                onChange={(e) => setNewTransaction({ ...newTransaction, created_at: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="thDetails" className="text-sm mb-1">Details</Label>
              <Input
                id="thDetails"
                type="text"
                value={newTransaction.thDetails}
                onChange={(e) => setNewTransaction({ ...newTransaction, thDetails: e.target.value })}
                placeholder="Transaction details"
                className="h-9 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="thPoi" className="text-sm mb-1">POI</Label>
              <Input
                id="thPoi"
                type="text"
                value={newTransaction.thPoi}
                onChange={(e) => setNewTransaction({ ...newTransaction, thPoi: e.target.value })}
                placeholder="Point of interaction"
                className="h-9 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="thEmail" className="text-sm mb-1">Email</Label>
              <Input
                id="thEmail"
                type="email"
                value={newTransaction.thEmail || ''}
                onChange={(e) => setNewTransaction({ ...newTransaction, thEmail: e.target.value })}
                placeholder="Email address"
                className="h-9 text-sm"
              />
            </div>
          </div>

          <Button onClick={handleAddTransaction} disabled={addingTransaction} size="sm" className="mb-3 h-9">
            <Plus className="w-4 h-4 mr-1" />
            {addingTransaction ? 'Adding...' : 'Add Transaction'}
          </Button>

          <ScrollArea className="h-[300px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm w-[130px]">Date</TableHead>
                  <TableHead className="text-sm w-[150px]">Type</TableHead>
                  <TableHead className="text-sm w-[200px]">Details</TableHead>
                  <TableHead className="text-sm w-[150px]">POI</TableHead>
                  <TableHead className="text-sm w-[180px]">Email</TableHead>
                  <TableHead className="text-sm w-[120px]">Status</TableHead>
                  <TableHead className="text-sm w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-gray-500">
                      No transaction history found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      {editingTransactionId === transaction.id ? (
                        <>
                          <TableCell className="text-sm w-[130px]">
                            <Input
                              type="date"
                              value={editingTransactionData.created_at || ''}
                              onChange={(e) => setEditingTransactionData({ ...editingTransactionData, created_at: e.target.value })}
                              className="h-8 text-xs w-full min-w-[120px]"
                            />
                          </TableCell>
                          <TableCell className="text-sm w-[150px]">
                            <Input
                              type="text"
                              value={editingTransactionData.thType || ''}
                              onChange={(e) => setEditingTransactionData({ ...editingTransactionData, thType: e.target.value })}
                              className="h-8 text-xs w-full min-w-[140px]"
                            />
                          </TableCell>
                          <TableCell className="text-sm w-[200px]">
                            <Input
                              type="text"
                              value={editingTransactionData.thDetails || ''}
                              onChange={(e) => setEditingTransactionData({ ...editingTransactionData, thDetails: e.target.value })}
                              className="h-8 text-xs w-full min-w-[180px]"
                            />
                          </TableCell>
                          <TableCell className="text-sm w-[150px]">
                            <Input
                              type="text"
                              value={editingTransactionData.thPoi || ''}
                              onChange={(e) => setEditingTransactionData({ ...editingTransactionData, thPoi: e.target.value })}
                              className="h-8 text-xs w-full min-w-[140px]"
                            />
                          </TableCell>
                          <TableCell className="text-sm w-[180px]">
                            <Input
                              type="email"
                              value={editingTransactionData.thEmail || ''}
                              onChange={(e) => setEditingTransactionData({ ...editingTransactionData, thEmail: e.target.value })}
                              className="h-8 text-xs w-full min-w-[170px]"
                            />
                          </TableCell>
                          <TableCell className="text-sm w-[120px]">
                            <Select
                              value={editingTransactionData.thStatus}
                              onValueChange={(value) => setEditingTransactionData({ ...editingTransactionData, thStatus: value })}
                            >
                              <SelectTrigger className="h-8 text-xs w-full min-w-[110px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Successful">Successful</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Failed">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm w-[100px]">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSaveTransaction(transaction.id)}
                                className="h-7 w-7 p-0"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                className="h-7 w-7 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-sm w-[130px]">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm w-[150px]">{transaction.thType}</TableCell>
                          <TableCell className="text-sm w-[200px]">{transaction.thDetails}</TableCell>
                          <TableCell className="text-sm w-[150px]">{transaction.thPoi}</TableCell>
                          <TableCell className="text-sm w-[180px]">{transaction.thEmail || '-'}</TableCell>
                          <TableCell className="text-sm w-[120px]">
                            <span className={transaction.thStatus === 'Successful' ? 'text-green-600' : transaction.thStatus === 'Pending' ? 'text-yellow-600' : 'text-red-600'}>
                              {transaction.thStatus}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm w-[100px]">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditTransaction(transaction)}
                                className="h-7 w-7 p-0"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
