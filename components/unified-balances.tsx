'use client';

import { useState, useEffect } from 'react';
import { UserWithBank, CryptoTransaction, CryptoType, CryptoNetwork, CryptoTransactionStatus } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface UnifiedBalancesProps {
  user: UserWithBank;
}

interface Balances {
  usd: string;
  euro: string;
  cad: string;
  btc: string;
  eth: string;
  usdt: string;
}

interface TransactionHistory {
  id: number;
  created_at: string;
  thType: string;
  thDetails: string;
  thPoi: string;
  thStatus: string;
  thEmail: string;
}

export function UnifiedBalances({ user }: UnifiedBalancesProps) {
  const [balances, setBalances] = useState<Balances>({
    usd: "0.00",
    euro: "0.00",
    cad: "0.00",
    btc: "0.00000000",
    eth: "0.00000000",
    usdt: "0.000000",
  });

  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [cryptoTransactions, setCryptoTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddCrypto, setShowAddCrypto] = useState(false);
  const [editingTxId, setEditingTxId] = useState<number | null>(null);
  const [editTxData, setEditTxData] = useState<Partial<TransactionHistory>>({});
  const [showEditCryptoDialog, setShowEditCryptoDialog] = useState(false);
  const [editCryptoData, setEditCryptoData] = useState<Partial<CryptoTransaction>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | string | null; type: 'tx' | 'crypto' | null }>({
    open: false,
    id: null,
    type: null
  });

  const [newTx, setNewTx] = useState({
    thType: '',
    thDetails: '',
    thPoi: '',
    thStatus: 'Successful',
    thEmail: user.email,
    created_at: new Date().toISOString().split('T')[0]
  });

  const [newCrypto, setNewCrypto] = useState({
    transaction_type: 'buy',
    amount: '',
    crypto_type: 'BTC',
    description: '',
    status: 'completed'
  });

  useEffect(() => {
    loadAllData();
  }, [user.bank_key, user.id]);

  async function loadAllData() {
    setLoading(true);
    await Promise.all([
      loadBalances(),
      fetchTransactions(),
      fetchCryptoTransactions()
    ]);
    setLoading(false);
  }

  async function loadBalances() {
    try {
      const response = await fetch(`/api/balances?bankKey=${user.bank_key}&userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBalances({
          usd: data.usd || "0.00",
          euro: data.euro || "0.00",
          cad: data.cad || "0.00",
          btc: data.btc || "0.00000000",
          eth: data.eth || "0.00000000",
          usdt: data.usdt || "0.000000",
        });
      }
    } catch (error) {
      console.error("Failed to load balances:", error);
    }
  }

  async function fetchTransactions() {
    try {
      const response = await fetch(`/api/transaction-history?bankKey=${user.bank_key}&userId=${user.id}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  }

  async function fetchCryptoTransactions() {
    try {
      const response = await fetch(`/api/crypto-transactions?bankKey=${user.bank_key}&userId=${user.id}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCryptoTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching crypto transactions:', error);
    }
  }

  async function updateBalance(currency: string, isCrypto: boolean) {
    const amount = editValues[currency];
    if (!amount) return;

    setSaving(true);
    try {
      const payload: any = { bankKey: user.bank_key, userId: user.id, operation: "set", balances: {} };

      if (isCrypto) {
        payload.balances.crypto = { [currency]: amount };
      } else {
        payload.balances[currency] = amount;
      }

      const response = await fetch("/api/balances/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await loadBalances();
        setEditValues(prev => ({ ...prev, [currency]: "" }));
        toast.success("Balance updated");
      } else {
        const errorData = await response.json();
        toast.error(`Failed: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Error: ${error}`);
    } finally {
      setSaving(false);
    }
  }

  const handleAddTx = async () => {
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
        setShowAddTx(false);
        fetchTransactions();
      } else {
        toast.error('Failed to add transaction');
      }
    } catch (error) {
      toast.error('Error adding transaction');
    }
  };

  const handleEditTx = (tx: TransactionHistory) => {
    setEditingTxId(tx.id);
    setEditTxData({
      thType: tx.thType,
      thDetails: tx.thDetails,
      thPoi: tx.thPoi,
      thStatus: tx.thStatus,
      thEmail: tx.thEmail,
      created_at: tx.created_at.split('T')[0]
    });
  };

  const handleSaveTxEdit = async (id: number) => {
    try {
      const response = await fetch('/api/transaction-history/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          transactionId: id,
          ...editTxData
        })
      });

      if (response.ok) {
        toast.success('Transaction updated');
        setEditingTxId(null);
        setEditTxData({});
        fetchTransactions();
      } else {
        toast.error('Failed to update');
      }
    } catch (error) {
      toast.error('Error updating');
    }
  };

  const handleAddCrypto = async () => {
    if (!newCrypto.amount) return;
    try {
      const response = await fetch('/api/crypto-transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          ...newCrypto
        })
      });

      if (response.ok) {
        toast.success('Transaction added');
        setNewCrypto({ transaction_type: 'buy', amount: '', crypto_type: 'BTC', description: '', status: 'completed' });
        setShowAddCrypto(false);
        fetchCryptoTransactions();
      } else {
        toast.error('Failed to add transaction');
      }
    } catch (error) {
      toast.error('Error adding transaction');
    }
  };

  const handleDeleteTx = async () => {
    if (!deleteConfirm.id || deleteConfirm.type !== 'tx') return;

    try {
      const response = await fetch('/api/transaction-history/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          transactionId: deleteConfirm.id
        })
      });

      if (response.ok) {
        toast.success('Transaction deleted');
        setDeleteConfirm({ open: false, id: null, type: null });
        fetchTransactions();
      } else {
        const result = await response.json();
        toast.error('Failed to delete: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      toast.error('Error deleting');
    }
  };

  const handleDeleteCrypto = async () => {
    if (!deleteConfirm.id || deleteConfirm.type !== 'crypto') return;

    try {
      const bankKey = user.bank_key;
      const transactionId = deleteConfirm.id;

      console.log('Deleting crypto transaction with params:', { bankKey, transactionId });
      console.log('User bank_key:', bankKey);
      console.log('Transaction ID:', transactionId);

      // Use query parameters instead of body for DELETE requests
      const url = `/api/crypto-transactions/delete?bankKey=${encodeURIComponent(bankKey)}&transactionId=${encodeURIComponent(transactionId)}`;
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (response.ok) {
        toast.success('Transaction deleted');
        setDeleteConfirm({ open: false, id: null, type: null });
        fetchCryptoTransactions();
      } else {
        let errorMessage = 'Unknown error';
        try {
          const text = await response.text();
          console.log('Response text:', text);
          if (text) {
            const result = JSON.parse(text);
            errorMessage = result.error || 'Unknown error';
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `Server error (${response.status})`;
        }
        console.error('Delete failed with error:', errorMessage);
        toast.error('Failed to delete: ' + errorMessage);
      }
    } catch (error) {
      console.error('Delete exception:', error);
      toast.error('Error deleting');
    }
  };

  const handleEditCrypto = (tx: CryptoTransaction) => {
    setEditCryptoData({ ...tx });
    setShowEditCryptoDialog(true);
  };

  const handleSaveCryptoEdit = async () => {
    console.log('handleSaveCryptoEdit called', editCryptoData);

    if (!editCryptoData.id) {
      console.error('No transaction ID found');
      toast.error('No transaction ID found');
      return;
    }

    try {
      console.log('Sending update request...');
      const payload = {
        bankKey: user.bank_key,
        transactionId: editCryptoData.id,
        transaction_type: editCryptoData.transaction_type,
        amount: editCryptoData.amount,
        currency: editCryptoData.currency,
        description: editCryptoData.description,
        status: editCryptoData.status,
        crypto_type: editCryptoData.crypto_type,
        price_per_unit: editCryptoData.price_per_unit,
        total_value: editCryptoData.total_value,
        wallet_address: editCryptoData.wallet_address,
        network: editCryptoData.network,
        transaction_hash: editCryptoData.transaction_hash,
        gas_fee: editCryptoData.gas_fee,
        admin_notes: editCryptoData.admin_notes
      };
      console.log('Payload:', payload);

      const response = await fetch('/api/crypto-transactions/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Update successful:', result);
        toast.success('Crypto transaction updated');
        setShowEditCryptoDialog(false);
        setEditCryptoData({});
        fetchCryptoTransactions();
      } else {
        const result = await response.json();
        console.error('Update failed:', result);
        toast.error('Failed to update: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Exception during update:', error);
      toast.error('Error updating: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleCancelCryptoEdit = () => {
    setShowEditCryptoDialog(false);
    setEditCryptoData({});
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.type === 'tx') {
      handleDeleteTx();
    } else if (deleteConfirm.type === 'crypto') {
      handleDeleteCrypto();
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  const fiatCurrencies = [
    { key: "usd", label: "USD", symbol: "$", balance: balances.usd },
    { key: "euro", label: "EUR", symbol: "€", balance: balances.euro },
    { key: "cad", label: "CAD", symbol: "$", balance: balances.cad },
  ];

  const cryptoCurrencies = [
    { key: "btc", label: "BTC", symbol: "₿", balance: balances.btc },
    { key: "eth", label: "ETH", symbol: "Ξ", balance: balances.eth },
    { key: "usdt", label: "USDT", symbol: "₮", balance: balances.usdt },
  ];

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-base font-bold text-gray-900">Account Balances & Transactions</h3>
        <p className="text-xs text-gray-600 mt-1">Manage all balances and view transaction history</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Fiat Currencies</h4>
            </div>
            <div className="space-y-2">
              {fiatCurrencies.map((currency) => (
                <div key={currency.key} className="border rounded-lg p-3 bg-gradient-to-r from-white to-blue-50 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">{currency.label}</div>
                      <div className="text-xl font-bold font-mono text-gray-900">{currency.symbol}{currency.balance}</div>
                    </div>
                    <div className="flex gap-2 flex-1">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={editValues[currency.key] || ""}
                        onChange={(e) => setEditValues(prev => ({ ...prev, [currency.key]: e.target.value }))}
                        className="h-8 text-xs"
                      />
                      <Button
                        onClick={() => updateBalance(currency.key, false)}
                        disabled={saving || !editValues[currency.key]}
                        size="sm"
                        className="h-8 px-3 text-xs whitespace-nowrap"
                      >
                        Set
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Cryptocurrencies</h4>
            </div>
            <div className="space-y-2">
              {cryptoCurrencies.map((currency) => (
                <div key={currency.key} className="border rounded-lg p-3 bg-gradient-to-r from-purple-50 to-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">{currency.label}</div>
                      <div className="text-xl font-bold font-mono text-gray-900">{currency.symbol}{currency.balance}</div>
                    </div>
                    <div className="flex gap-2 flex-1">
                      <Input
                        type="number"
                        step="0.00000001"
                        placeholder="Amount"
                        value={editValues[currency.key] || ""}
                        onChange={(e) => setEditValues(prev => ({ ...prev, [currency.key]: e.target.value }))}
                        className="h-8 text-xs"
                      />
                      <Button
                        onClick={() => updateBalance(currency.key, true)}
                        disabled={saving || !editValues[currency.key]}
                        size="sm"
                        className="h-8 px-3 text-xs whitespace-nowrap"
                      >
                        Set
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Transaction History ({transactions.length})</h4>
            <Button
              onClick={() => setShowAddTx(!showAddTx)}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>

          {showAddTx && (
            <div className="p-3 mb-3 border rounded-lg bg-blue-50 space-y-2">
              <div className="grid grid-cols-3 gap-2">
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
              </div>
              <div className="grid grid-cols-3 gap-2">
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
              <Button onClick={handleAddTx} size="sm" className="h-8 text-xs">Add</Button>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            {transactions.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-6 bg-gray-50">No transactions</div>
            ) : (
              <div className="max-h-60 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Date</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Type</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Details</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">POI</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Email</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Status</th>
                      <th className="px-2 py-2 text-right font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-gray-50">
                        {editingTxId === tx.id ? (
                          <>
                            <td className="px-2 py-2">
                              <Input
                                type="date"
                                value={editTxData.created_at || ''}
                                onChange={(e) => setEditTxData({ ...editTxData, created_at: e.target.value })}
                                className="h-7 text-xs w-full"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <Input
                                value={editTxData.thType || ''}
                                onChange={(e) => setEditTxData({ ...editTxData, thType: e.target.value })}
                                className="h-7 text-xs w-full"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <Input
                                value={editTxData.thDetails || ''}
                                onChange={(e) => setEditTxData({ ...editTxData, thDetails: e.target.value })}
                                className="h-7 text-xs w-full"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <Input
                                value={editTxData.thPoi || ''}
                                onChange={(e) => setEditTxData({ ...editTxData, thPoi: e.target.value })}
                                className="h-7 text-xs w-full"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <Input
                                type="email"
                                value={editTxData.thEmail || ''}
                                onChange={(e) => setEditTxData({ ...editTxData, thEmail: e.target.value })}
                                className="h-7 text-xs w-full"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <Select value={editTxData.thStatus} onValueChange={(v) => setEditTxData({ ...editTxData, thStatus: v })}>
                                <SelectTrigger className="h-7 text-xs w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Successful">Successful</SelectItem>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Failed">Failed</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  onClick={() => handleSaveTxEdit(tx.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => { setEditingTxId(null); setEditTxData({}); }}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-gray-600 hover:bg-gray-50"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-2 py-2 text-gray-600">{new Date(tx.created_at).toLocaleDateString('en-GB')}</td>
                            <td className="px-2 py-2 font-medium text-gray-800">{tx.thType}</td>
                            <td className="px-2 py-2 text-gray-600">{tx.thDetails}</td>
                            <td className="px-2 py-2 text-gray-600">{tx.thPoi}</td>
                            <td className="px-2 py-2 text-gray-600 truncate max-w-[100px]">{tx.thEmail}</td>
                            <td className="px-2 py-2">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${
                                tx.thStatus === 'Successful' ? 'bg-green-100 text-green-700' :
                                tx.thStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {tx.thStatus}
                              </span>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  onClick={() => handleEditTx(tx)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => setDeleteConfirm({ open: true, id: tx.id, type: 'tx' })}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Crypto Transactions ({cryptoTransactions.length})</h4>
            <Button
              onClick={() => setShowAddCrypto(!showAddCrypto)}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>

          {showAddCrypto && (
            <div className="p-3 mb-3 border rounded-lg bg-blue-50 space-y-2">
              <div className="grid grid-cols-5 gap-2">
                <Select value={newCrypto.transaction_type} onValueChange={(v) => setNewCrypto({ ...newCrypto, transaction_type: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newCrypto.crypto_type} onValueChange={(v) => setNewCrypto({ ...newCrypto, crypto_type: v })}>
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
                  value={newCrypto.amount}
                  onChange={(e) => setNewCrypto({ ...newCrypto, amount: e.target.value })}
                  className="h-8 text-xs"
                />
                <Input
                  placeholder="Description"
                  value={newCrypto.description}
                  onChange={(e) => setNewCrypto({ ...newCrypto, description: e.target.value })}
                  className="h-8 text-xs col-span-2"
                />
              </div>
              <Button onClick={handleAddCrypto} size="sm" className="h-8 text-xs">Add</Button>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            {cryptoTransactions.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-6 bg-gray-50">No crypto transactions</div>
            ) : (
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Crypto</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Type</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Amount</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Currency</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Status</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Network</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Wallet</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Price/Unit</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Total Value</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Gas Fee</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">TX Hash</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Description</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Date</th>
                      <th className="px-2 py-2 text-right font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cryptoTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-gray-50">
                        <td className="px-2 py-2">
                          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">
                            {tx.crypto_type || '-'}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium capitalize">
                            {tx.transaction_type}
                          </span>
                        </td>
                        <td className="px-2 py-2 font-mono font-bold text-gray-900">{tx.amount}</td>
                        <td className="px-2 py-2 text-gray-600">{tx.currency}</td>
                        <td className="px-2 py-2">
                          <span className={`inline-block px-2 py-0.5 rounded font-medium ${
                            tx.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            tx.status === 'Failed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-gray-600">{tx.network || '-'}</td>
                        <td className="px-2 py-2 text-gray-600 font-mono text-xs truncate max-w-[120px]" title={tx.wallet_address || ''}>
                          {tx.wallet_address ? `${tx.wallet_address.substring(0, 10)}...` : '-'}
                        </td>
                        <td className="px-2 py-2 font-mono text-gray-700">{tx.price_per_unit || '-'}</td>
                        <td className="px-2 py-2 font-mono text-gray-700">{tx.total_value || '-'}</td>
                        <td className="px-2 py-2 font-mono text-gray-700">{tx.gas_fee || '-'}</td>
                        <td className="px-2 py-2 text-gray-600 font-mono text-xs truncate max-w-[100px]" title={tx.transaction_hash || ''}>
                          {tx.transaction_hash ? `${tx.transaction_hash.substring(0, 8)}...` : '-'}
                        </td>
                        <td className="px-2 py-2 text-gray-600 max-w-[150px] truncate" title={tx.description || ''}>
                          {tx.description || '-'}
                        </td>
                        <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString('en-GB')}</td>
                        <td className="px-2 py-2">
                          <div className="flex gap-1 justify-end">
                            <Button
                              onClick={() => handleEditCrypto(tx)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => setDeleteConfirm({ open: true, id: tx.id, type: 'crypto' })}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, id: null, type: null })}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        variant="destructive"
      />

      <Dialog open={showEditCryptoDialog} onOpenChange={setShowEditCryptoDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Crypto Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crypto_type">Crypto Type *</Label>
                <Select
                  value={editCryptoData.crypto_type || ''}
                  onValueChange={(v) => setEditCryptoData({ ...editCryptoData, crypto_type: v as CryptoType })}
                >
                  <SelectTrigger id="crypto_type">
                    <SelectValue placeholder="Select crypto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_type">Transaction Type *</Label>
                <Select
                  value={editCryptoData.transaction_type || ''}
                  onValueChange={(v) => setEditCryptoData({ ...editCryptoData, transaction_type: v })}
                >
                  <SelectTrigger id="transaction_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  value={editCryptoData.amount || ''}
                  onChange={(e) => setEditCryptoData({ ...editCryptoData, amount: e.target.value })}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Input
                  id="currency"
                  value={editCryptoData.currency || ''}
                  onChange={(e) => setEditCryptoData({ ...editCryptoData, currency: e.target.value })}
                  placeholder="USD, EUR, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editCryptoData.status || 'Pending'}
                  onValueChange={(v) => setEditCryptoData({ ...editCryptoData, status: v as CryptoTransactionStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="network">Network</Label>
                <Select
                  value={editCryptoData.network || ''}
                  onValueChange={(v) => setEditCryptoData({ ...editCryptoData, network: v as CryptoNetwork })}
                >
                  <SelectTrigger id="network">
                    <SelectValue placeholder="Select network" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet_address">Wallet Address</Label>
              <Input
                id="wallet_address"
                value={editCryptoData.wallet_address || ''}
                onChange={(e) => setEditCryptoData({ ...editCryptoData, wallet_address: e.target.value })}
                className="font-mono text-xs"
                placeholder="0x..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_per_unit">Price per Unit</Label>
                <Input
                  id="price_per_unit"
                  type="number"
                  step="0.01"
                  value={editCryptoData.price_per_unit || ''}
                  onChange={(e) => setEditCryptoData({ ...editCryptoData, price_per_unit: e.target.value })}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_value">Total Value</Label>
                <Input
                  id="total_value"
                  type="number"
                  step="0.01"
                  value={editCryptoData.total_value || ''}
                  onChange={(e) => setEditCryptoData({ ...editCryptoData, total_value: e.target.value })}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gas_fee">Gas Fee</Label>
                <Input
                  id="gas_fee"
                  type="number"
                  step="0.00000001"
                  value={editCryptoData.gas_fee || ''}
                  onChange={(e) => setEditCryptoData({ ...editCryptoData, gas_fee: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_hash">Transaction Hash</Label>
              <Input
                id="transaction_hash"
                value={editCryptoData.transaction_hash || ''}
                onChange={(e) => setEditCryptoData({ ...editCryptoData, transaction_hash: e.target.value })}
                className="font-mono text-xs"
                placeholder="0x..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editCryptoData.description || ''}
                onChange={(e) => setEditCryptoData({ ...editCryptoData, description: e.target.value })}
                rows={2}
                placeholder="Transaction description..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_notes">Admin Notes</Label>
              <Textarea
                id="admin_notes"
                value={editCryptoData.admin_notes || ''}
                onChange={(e) => setEditCryptoData({ ...editCryptoData, admin_notes: e.target.value })}
                rows={2}
                placeholder="Internal notes (not visible to user)..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancelCryptoEdit}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveCryptoEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
