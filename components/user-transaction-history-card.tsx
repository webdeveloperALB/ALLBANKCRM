'use client';

import { useState, useEffect } from 'react';
import { UserWithBank } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface TransactionHistory {
  id: number;
  created_at: string;
  thType: string;
  thDetails: string;
  thPoi: string;
  thStatus: string;
  thEmail: string;
}

interface UserTransactionHistoryCardProps {
  user: UserWithBank;
}

export function UserTransactionHistoryCard({ user }: UserTransactionHistoryCardProps) {
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<TransactionHistory>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const [newTx, setNewTx] = useState({
    thType: '',
    thDetails: '',
    thPoi: '',
    thStatus: 'Successful',
    thEmail: user.email,
    created_at: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactions();
  }, [user.bank_key, user.id]);

  const fetchTransactions = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newTx.thDetails || !newTx.thPoi) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/transaction-history/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          ...newTx
        })
      });

      if (response.ok) {
        toast.success('Transaction added');
        setNewTx({
          thType: '',
          thDetails: '',
          thPoi: '',
          thStatus: 'Successful',
          thEmail: user.email,
          created_at: new Date().toISOString().split('T')[0]
        });
        setShowAdd(false);
        fetchTransactions();
      } else {
        toast.error('Failed to add transaction');
      }
    } catch (error) {
      toast.error('Error adding transaction');
    }
  };

  const handleEdit = (tx: TransactionHistory) => {
    setEditingId(tx.id);
    setEditData({
      thType: tx.thType,
      thDetails: tx.thDetails,
      thPoi: tx.thPoi,
      thStatus: tx.thStatus,
      thEmail: tx.thEmail,
      created_at: tx.created_at.split('T')[0]
    });
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const response = await fetch('/api/transaction-history/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          transactionId: id,
          ...editData
        })
      });

      if (response.ok) {
        toast.success('Transaction updated');
        setEditingId(null);
        setEditData({});
        fetchTransactions();
      } else {
        toast.error('Failed to update');
      }
    } catch (error) {
      toast.error('Error updating');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      console.log('Deleting transaction:', { transactionId: deleteConfirm.id, bankKey: user.bank_key });
      const response = await fetch('/api/transaction-history/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          transactionId: deleteConfirm.id
        })
      });

      const result = await response.json();
      console.log('Delete response:', result);

      if (response.ok) {
        toast.success('Transaction deleted');
        setDeleteConfirm({ open: false, id: null });
        fetchTransactions();
      } else {
        console.error('Delete failed:', result);
        toast.error('Failed to delete: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error deleting: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;

  return (
    <div className="bg-white border rounded-lg">
      <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Transaction History</h3>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {showAdd && (
        <div className="p-3 border-b bg-gray-50 space-y-2">
          <div className="grid grid-cols-6 gap-2">
            <Input
              placeholder="Type"
              value={newTx.thType}
              onChange={(e) => setNewTx({ ...newTx, thType: e.target.value })}
              className="h-8 text-xs"
            />
            <Input
              placeholder="Details"
              value={newTx.thDetails}
              onChange={(e) => setNewTx({ ...newTx, thDetails: e.target.value })}
              className="h-8 text-xs"
            />
            <Input
              placeholder="POI"
              value={newTx.thPoi}
              onChange={(e) => setNewTx({ ...newTx, thPoi: e.target.value })}
              className="h-8 text-xs"
            />
            <Input
              type="email"
              placeholder="Email"
              value={newTx.thEmail || ''}
              onChange={(e) => setNewTx({ ...newTx, thEmail: e.target.value })}
              className="h-8 text-xs"
            />
            <Input
              type="date"
              value={newTx.created_at}
              onChange={(e) => setNewTx({ ...newTx, created_at: e.target.value })}
              className="h-8 text-xs"
            />
            <div className="flex gap-1">
              <Select value={newTx.thStatus} onValueChange={(v) => setNewTx({ ...newTx, thStatus: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Successful">Successful</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAdd} size="sm" className="h-7 text-xs">
            Add Transaction
          </Button>
        </div>
      )}

      <div className="p-3 max-h-80 overflow-auto">
        {transactions.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-4">No transaction history</div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-2 text-xs py-2 border-b last:border-b-0">
                {editingId === tx.id ? (
                  <>
                    <Input
                      type="date"
                      value={editData.created_at || ''}
                      onChange={(e) => setEditData({ ...editData, created_at: e.target.value })}
                      className="h-7 text-xs w-28"
                    />
                    <Input
                      value={editData.thType || ''}
                      onChange={(e) => setEditData({ ...editData, thType: e.target.value })}
                      className="h-7 text-xs w-32"
                    />
                    <Input
                      value={editData.thDetails || ''}
                      onChange={(e) => setEditData({ ...editData, thDetails: e.target.value })}
                      className="h-7 text-xs flex-1"
                    />
                    <Input
                      value={editData.thPoi || ''}
                      onChange={(e) => setEditData({ ...editData, thPoi: e.target.value })}
                      className="h-7 text-xs w-24"
                    />
                    <Input
                      type="email"
                      value={editData.thEmail || ''}
                      onChange={(e) => setEditData({ ...editData, thEmail: e.target.value })}
                      className="h-7 text-xs w-32"
                    />
                    <Select value={editData.thStatus} onValueChange={(v) => setEditData({ ...editData, thStatus: v })}>
                      <SelectTrigger className="h-7 text-xs w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Successful">Successful</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleSaveEdit(tx.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-600 hover:bg-gray-50"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-24 text-gray-500">{new Date(tx.created_at).toLocaleDateString('en-GB')}</div>
                    <div className="w-32 font-medium text-gray-600 truncate">{tx.thType}</div>
                    <div className="flex-1 text-gray-600 truncate">{tx.thDetails}</div>
                    <div className="w-24 text-gray-500 truncate">{tx.thPoi}</div>
                    <div className="w-32 text-gray-500 truncate text-xs">{tx.thEmail}</div>
                    <div className={`w-20 font-medium ${
                      tx.thStatus === 'Successful' ? 'text-green-600' :
                      tx.thStatus === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {tx.thStatus}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleEdit(tx)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => setDeleteConfirm({ open: true, id: tx.id })}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
