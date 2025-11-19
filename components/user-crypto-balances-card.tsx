'use client';

import { useState, useEffect } from 'react';
import { UserWithBank } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bitcoin, DollarSign, Coins, Save, Plus, Minus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface CryptoBalances {
  id: string;
  user_id: string;
  btc_balance: string;
  eth_balance: string;
  usdt_balance: string;
  created_at: string;
  updated_at: string;
}

interface UserCryptoBalancesCardProps {
  user: UserWithBank;
}

export function UserCryptoBalancesCard({ user }: UserCryptoBalancesCardProps) {
  const [balances, setBalances] = useState<CryptoBalances | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editData, setEditData] = useState({
    btc_balance: '0.00000000',
    eth_balance: '0.00000000',
    usdt_balance: '0.000000'
  });

  const [adjustData, setAdjustData] = useState({
    btc_adjust: '',
    eth_adjust: '',
    usdt_adjust: ''
  });

  useEffect(() => {
    fetchBalances();
  }, [user.bank_key, user.id]);

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/crypto-balances?bankKey=${user.bank_key}&userId=${user.id}`
      );
      const data = await response.json();

      if (data) {
        setBalances(data);
        setEditData({
          btc_balance: data.btc_balance || '0.00000000',
          eth_balance: data.eth_balance || '0.00000000',
          usdt_balance: data.usdt_balance || '0.000000'
        });
      }
    } catch (error) {
      console.error('Error fetching crypto balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/crypto-balances/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          ...editData
        })
      });

      if (response.ok) {
        await fetchBalances();
        toast.success('Crypto balances updated successfully');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update crypto balances: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating crypto balances:', error);
      toast.error('Error updating crypto balances: ' + error);
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustBalance = async (operation: 'add' | 'subtract') => {
    setSaving(true);
    try {
      const currentBTC = parseFloat(balances?.btc_balance || '0');
      const currentETH = parseFloat(balances?.eth_balance || '0');
      const currentUSDT = parseFloat(balances?.usdt_balance || '0');

      const adjustBTC = parseFloat(adjustData.btc_adjust || '0');
      const adjustETH = parseFloat(adjustData.eth_adjust || '0');
      const adjustUSDT = parseFloat(adjustData.usdt_adjust || '0');

      const multiplier = operation === 'add' ? 1 : -1;

      const newBTC = Math.max(0, currentBTC + (adjustBTC * multiplier));
      const newETH = Math.max(0, currentETH + (adjustETH * multiplier));
      const newUSDT = Math.max(0, currentUSDT + (adjustUSDT * multiplier));

      const response = await fetch('/api/crypto-balances/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          btc_balance: newBTC.toFixed(8),
          eth_balance: newETH.toFixed(8),
          usdt_balance: newUSDT.toFixed(6)
        })
      });

      if (response.ok) {
        await fetchBalances();
        setAdjustData({
          btc_adjust: '',
          eth_adjust: '',
          usdt_adjust: ''
        });
        toast.success(`Balances ${operation === 'add' ? 'increased' : 'decreased'} successfully`);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to adjust balances: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adjusting balances:', error);
      toast.error('Error adjusting balances: ' + error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-lg">Crypto Balances</CardTitle>
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
    <Card className="flex flex-col h-full shadow-sm border-0 ring-1 ring-gray-200">
      <CardHeader className="pb-4 bg-gradient-to-br from-blue-50 to-violet-50 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Bitcoin className="w-5 h-5 text-orange-500" />
          Cryptocurrency Balances
        </CardTitle>
        <CardDescription>Manage user digital asset holdings</CardDescription>
      </CardHeader>
      <CardContent className="pb-6 pt-6 flex-1 flex flex-col">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Bitcoin className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-orange-900 uppercase tracking-wider">Bitcoin</span>
            </div>
            <div className="text-2xl font-mono font-bold text-orange-900">{balances?.btc_balance || '0.00000000'}</div>
            <div className="text-xs text-orange-700 mt-1">BTC</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider">Ethereum</span>
            </div>
            <div className="text-2xl font-mono font-bold text-purple-900">{balances?.eth_balance || '0.00000000'}</div>
            <div className="text-xs text-purple-700 mt-1">ETH</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-green-900 uppercase tracking-wider">USDT</span>
            </div>
            <div className="text-2xl font-mono font-bold text-green-900">{balances?.usdt_balance || '0.000000'}</div>
            <div className="text-xs text-green-700 mt-1">USDT</div>
          </div>
        </div>

        <Tabs defaultValue="set" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="set">Set Exact Amount</TabsTrigger>
            <TabsTrigger value="adjust">Add/Subtract</TabsTrigger>
          </TabsList>

          <TabsContent value="set" className="space-y-3 mt-4">
            <div>
              <Label htmlFor="btc_balance" className="text-sm mb-1">BTC Balance</Label>
              <Input
                id="btc_balance"
                type="text"
                value={editData.btc_balance}
                onChange={(e) => setEditData({ ...editData, btc_balance: e.target.value })}
                placeholder="0.00000000"
                className="h-9 text-sm font-mono"
              />
            </div>

            <div>
              <Label htmlFor="eth_balance" className="text-sm mb-1">ETH Balance</Label>
              <Input
                id="eth_balance"
                type="text"
                value={editData.eth_balance}
                onChange={(e) => setEditData({ ...editData, eth_balance: e.target.value })}
                placeholder="0.00000000"
                className="h-9 text-sm font-mono"
              />
            </div>

            <div>
              <Label htmlFor="usdt_balance" className="text-sm mb-1">USDT Balance</Label>
              <Input
                id="usdt_balance"
                type="text"
                value={editData.usdt_balance}
                onChange={(e) => setEditData({ ...editData, usdt_balance: e.target.value })}
                placeholder="0.000000"
                className="h-9 text-sm font-mono"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </TabsContent>

          <TabsContent value="adjust" className="space-y-3 mt-4">
            <div>
              <Label htmlFor="btc_adjust" className="text-sm mb-1">BTC Amount</Label>
              <Input
                id="btc_adjust"
                type="text"
                value={adjustData.btc_adjust}
                onChange={(e) => setAdjustData({ ...adjustData, btc_adjust: e.target.value })}
                placeholder="0.00000000"
                className="h-9 text-sm font-mono"
              />
            </div>

            <div>
              <Label htmlFor="eth_adjust" className="text-sm mb-1">ETH Amount</Label>
              <Input
                id="eth_adjust"
                type="text"
                value={adjustData.eth_adjust}
                onChange={(e) => setAdjustData({ ...adjustData, eth_adjust: e.target.value })}
                placeholder="0.00000000"
                className="h-9 text-sm font-mono"
              />
            </div>

            <div>
              <Label htmlFor="usdt_adjust" className="text-sm mb-1">USDT Amount</Label>
              <Input
                id="usdt_adjust"
                type="text"
                value={adjustData.usdt_adjust}
                onChange={(e) => setAdjustData({ ...adjustData, usdt_adjust: e.target.value })}
                placeholder="0.000000"
                className="h-9 text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleAdjustBalance('add')}
                disabled={saving}
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
              <Button
                onClick={() => handleAdjustBalance('subtract')}
                disabled={saving}
                variant="destructive"
                className="w-full"
              >
                <Minus className="w-4 h-4 mr-2" />
                Subtract
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
