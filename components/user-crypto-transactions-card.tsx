'use client';

import { useState, useEffect } from 'react';
import { UserWithBank } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CryptoTransaction {
  id: string;
  transaction_type: string;
  amount: string;
  crypto_type: string;
  description: string;
  status: string;
  created_at: string;
}

interface UserCryptoTransactionsCardProps {
  user: UserWithBank;
}

export function UserCryptoTransactionsCard({ user }: UserCryptoTransactionsCardProps) {
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [newTx, setNewTx] = useState({
    transaction_type: 'buy',
    amount: '',
    crypto_type: 'BTC',
    description: '',
    status: 'completed'
  });

  useEffect(() => {
    fetchTransactions();
  }, [user.bank_key, user.id]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `/api/crypto-transactions?bankKey=${user.bank_key}&userId=${user.id}`
      );
      const data = await response.json();
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching crypto transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newTx.amount) return;
    try {
      const response = await fetch('/api/crypto-transactions/create', {
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
        setNewTx({ transaction_type: 'buy', amount: '', crypto_type: 'BTC', description: '', status: 'completed' });
        setShowAdd(false);
        fetchTransactions();
      } else {
        toast.error('Failed to add transaction');
      }
    } catch (error) {
      toast.error('Error adding transaction');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/crypto-transactions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          transactionId: id
        })
      });

      if (response.ok) {
        toast.success('Transaction deleted');
        fetchTransactions();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting');
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;

  return (
    <div className="bg-white border rounded-lg">
      <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Crypto Transactions</h3>
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
          <div className="grid grid-cols-5 gap-2">
            <Select value={newTx.transaction_type} onValueChange={(v) => setNewTx({ ...newTx, transaction_type: v })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newTx.crypto_type} onValueChange={(v) => setNewTx({ ...newTx, crypto_type: v })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Amount"
              value={newTx.amount}
              onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
              className="h-8 text-xs"
            />
            <Input
              placeholder="Description"
              value={newTx.description}
              onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
              className="h-8 text-xs"
            />
            <Button onClick={handleAdd} size="sm" className="h-8 text-xs">
              Add
            </Button>
          </div>
        </div>
      )}

      <div className="p-3 max-h-80 overflow-auto">
        {transactions.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-4">No transactions</div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-2 text-xs py-2 border-b last:border-b-0">
                <div className="w-16 font-medium text-gray-600">{tx.crypto_type}</div>
                <div className="w-16 text-gray-500">{tx.transaction_type}</div>
                <div className="w-24 font-mono">{tx.amount}</div>
                <div className="flex-1 text-gray-600 truncate">{tx.description || '-'}</div>
                <div className="w-20 text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</div>
                <Button
                  onClick={() => handleDelete(tx.id)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
