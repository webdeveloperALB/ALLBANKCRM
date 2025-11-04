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
import { Textarea } from '@/components/ui/textarea';
import { Bitcoin, Plus, Pencil, Trash2, X, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface CryptoTransaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: string;
  currency: string;
  crypto_type: string;
  description: string;
  status: string;
  price_per_unit: string | null;
  total_value: string | null;
  wallet_address: string | null;
  network: string | null;
  transaction_hash: string | null;
  gas_fee: string | null;
  admin_notes: string | null;
  created_at: string;
}

interface UserCryptoTransactionsCardProps {
  user: UserWithBank;
}

export function UserCryptoTransactionsCard({ user }: UserCryptoTransactionsCardProps) {
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTransaction, setAddingTransaction] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editingTransactionData, setEditingTransactionData] = useState<Partial<CryptoTransaction>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; transactionId: string | null }>({ open: false, transactionId: null });

  const [newTransaction, setNewTransaction] = useState({
    transaction_type: 'Transfer',
    amount: '',
    currency: 'USD',
    crypto_type: 'BTC',
    description: '',
    status: 'Pending',
    price_per_unit: null,
    total_value: null,
    wallet_address: '',
    network: 'bitcoin',
    transaction_hash: '',
    gas_fee: null,
    admin_notes: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/crypto-transactions?bankKey=${user.bank_key}&userId=${user.id}`
      );
      const data = await response.json();
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching crypto transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    setAddingTransaction(true);
    try {
      const response = await fetch('/api/crypto-transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          ...newTransaction
        })
      });

      if (response.ok) {
        setNewTransaction({
          transaction_type: 'Transfer',
          amount: '',
          currency: 'USD',
          crypto_type: 'BTC',
          description: '',
          status: 'Pending',
          price_per_unit: null,
          total_value: null,
          wallet_address: '',
          network: 'bitcoin',
          transaction_hash: '',
          gas_fee: null,
          admin_notes: ''
        });
        await fetchTransactions();
        toast.success('Transaction created successfully');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create transaction: ${errorData.error}`);
      }
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast.error('Error creating transaction: ' + error.message);
    } finally {
      setAddingTransaction(false);
    }
  };

  const handleEditTransaction = (transaction: CryptoTransaction) => {
    setEditingTransactionId(transaction.id);
    setEditingTransactionData({
      transaction_type: transaction.transaction_type,
      amount: transaction.amount,
      currency: transaction.currency,
      crypto_type: transaction.crypto_type,
      description: transaction.description,
      status: transaction.status,
      price_per_unit: transaction.price_per_unit || null,
      total_value: transaction.total_value || null,
      wallet_address: transaction.wallet_address || '',
      network: transaction.network || 'bitcoin',
      transaction_hash: transaction.transaction_hash || '',
      gas_fee: transaction.gas_fee || null,
      admin_notes: transaction.admin_notes || ''
    });
  };

  const handleSaveTransaction = async (transactionId: string) => {
    try {
      const response = await fetch('/api/crypto-transactions/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          transactionId,
          ...editingTransactionData
        })
      });

      if (response.ok) {
        await fetchTransactions();
        setEditingTransactionId(null);
        setEditingTransactionData({});
        toast.success('Transaction updated successfully');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData?.error || 'Unknown error occurred';
        toast.error(`Failed to update transaction: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      toast.error(`Error updating transaction: ${errorMessage}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setEditingTransactionData({});
  };

  const handleDeleteTransaction = async () => {
    if (!deleteConfirm.transactionId) return;

    try {
      const response = await fetch('/api/crypto-transactions/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          transactionId: deleteConfirm.transactionId
        })
      });

      if (response.ok) {
        await fetchTransactions();
        toast.success('Transaction deleted successfully');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete transaction: ${errorData.error}`);
      }
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error('Error deleting transaction: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Processing': 'bg-blue-100 text-blue-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-lg">Crypto Transactions</CardTitle>
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
    <>
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Bitcoin className="w-6 h-6" />
            Crypto Transactions
          </CardTitle>
          <CardDescription>Manage cryptocurrency deposits, withdrawals, and trades</CardDescription>
        </CardHeader>
        <CardContent className="pb-4 flex-1 flex flex-col space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Transaction
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="new-crypto" className="text-xs">Crypto</Label>
                <Select
                  value={newTransaction.crypto_type}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, crypto_type: value })}
                >
                  <SelectTrigger id="new-crypto" className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="new-amount" className="text-xs">Amount</Label>
                <Input
                  id="new-amount"
                  type="text"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  placeholder="0.00000000"
                  className="h-8 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="new-network" className="text-xs">Network</Label>
                <Select
                  value={newTransaction.network}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, network: value })}
                >
                  <SelectTrigger id="new-network" className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="lightning">Lightning</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    <SelectItem value="optimism">Optimism</SelectItem>
                    <SelectItem value="tron">Tron</SelectItem>
                    <SelectItem value="bsc">BSC</SelectItem>
                    <SelectItem value="avalanche">Avalanche</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="new-status" className="text-xs">Status</Label>
                <Select
                  value={newTransaction.status}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, status: value })}
                >
                  <SelectTrigger id="new-status" className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="new-wallet" className="text-xs">Wallet Address</Label>
                <Input
                  id="new-wallet"
                  type="text"
                  value={newTransaction.wallet_address}
                  onChange={(e) => setNewTransaction({ ...newTransaction, wallet_address: e.target.value })}
                  placeholder="Wallet address"
                  className="h-8 text-sm"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="new-description" className="text-xs">Description</Label>
                <Textarea
                  id="new-description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="Transaction description"
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>

            <Button onClick={handleAddTransaction} disabled={addingTransaction} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {addingTransaction ? 'Adding...' : 'Add Transaction'}
            </Button>
          </div>

          <div className="flex-1 border rounded-lg">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="w-[80px]">Crypto</TableHead>
                    <TableHead className="w-[140px]">Amount</TableHead>
                    <TableHead className="w-[120px]">Network</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[200px]">Wallet</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        {editingTransactionId === transaction.id ? (
                          <>
                            <TableCell className="text-xs">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={editingTransactionData.crypto_type || 'BTC'}
                                onValueChange={(value) => setEditingTransactionData({ ...editingTransactionData, crypto_type: value })}
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="BTC">BTC</SelectItem>
                                  <SelectItem value="ETH">ETH</SelectItem>
                                  <SelectItem value="USDT">USDT</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                value={editingTransactionData.amount || ''}
                                onChange={(e) => setEditingTransactionData({ ...editingTransactionData, amount: e.target.value })}
                                className="h-7 text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={editingTransactionData.network || 'bitcoin'}
                                onValueChange={(value) => setEditingTransactionData({ ...editingTransactionData, network: value })}
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bitcoin">Bitcoin</SelectItem>
                                  <SelectItem value="lightning">Lightning</SelectItem>
                                  <SelectItem value="ethereum">Ethereum</SelectItem>
                                  <SelectItem value="polygon">Polygon</SelectItem>
                                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                                  <SelectItem value="optimism">Optimism</SelectItem>
                                  <SelectItem value="tron">Tron</SelectItem>
                                  <SelectItem value="bsc">BSC</SelectItem>
                                  <SelectItem value="avalanche">Avalanche</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={editingTransactionData.status || 'Pending'}
                                onValueChange={(value) => setEditingTransactionData({ ...editingTransactionData, status: value })}
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Processing">Processing</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                value={editingTransactionData.wallet_address || ''}
                                onChange={(e) => setEditingTransactionData({ ...editingTransactionData, wallet_address: e.target.value })}
                                className="h-7 text-xs"
                                placeholder="Wallet address"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSaveTransaction(transaction.id)}
                                  className="h-7 px-2"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelEdit}
                                  className="h-7 px-2"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="text-xs">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-xs font-semibold">{transaction.crypto_type}</TableCell>
                            <TableCell className="text-xs font-mono">{transaction.amount}</TableCell>
                            <TableCell className="text-xs capitalize">{transaction.network}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusBadge(transaction.status)} text-xs`}>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs font-mono truncate max-w-[200px]">
                              {transaction.wallet_address || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditTransaction(transaction)}
                                  className="h-7 px-2"
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteConfirm({ open: true, transactionId: transaction.id })}
                                  className="h-7 px-2"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
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

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, transactionId: null })}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone and may affect the user's balance."
        onConfirm={handleDeleteTransaction}
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
}
