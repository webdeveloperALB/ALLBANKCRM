'use client';

import { useState, useEffect } from 'react';
import { UserWithBank, UserBalances } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Euro, Coins, Bitcoin, Save, Plus, Minus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserBalancesCardProps {
  user: UserWithBank;
}

export function UserBalancesCard({ user }: UserBalancesCardProps) {
  const [balances, setBalances] = useState<UserBalances>({
    usd: null,
    euro: null,
    cad: null,
    crypto: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [operation, setOperation] = useState<'set' | 'add' | 'deduct'>('set');

  const [editData, setEditData] = useState({
    usd: '0.00',
    euro: '0.00',
    cad: '0.00',
    btc: '0.00000000',
    eth: '0.00000000',
    usdt: '0.000000'
  });

  useEffect(() => {
    fetchBalances();
  }, [user.bank_key, user.id]);

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/balances?bankKey=${user.bank_key}&userId=${user.id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch balances');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setBalances(data);

      setEditData({
        usd: data.usd?.balance || '0.00',
        euro: data.euro?.balance || '0.00',
        cad: data.cad?.balance || '0.00',
        btc: data.crypto?.btc_balance || '0.00000000',
        eth: data.crypto?.eth_balance || '0.00000000',
        usdt: data.crypto?.usdt_balance || '0.000000'
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
      toast.error('Failed to load balances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/balances/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          operation,
          balances: {
            usd: editData.usd,
            euro: editData.euro,
            cad: editData.cad,
            crypto: {
              btc: editData.btc,
              eth: editData.eth,
              usdt: editData.usdt
            }
          }
        })
      });

      if (response.ok) {
        toast.success('Balances updated successfully!');
        await fetchBalances();
        if (operation === 'add' || operation === 'deduct') {
          setEditData({
            usd: '0.00',
            euro: '0.00',
            cad: '0.00',
            btc: '0.00000000',
            eth: '0.00000000',
            usdt: '0.000000'
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Balance update error:', errorData);
        const errorMsg = errorData.error || 'Unknown error occurred';
        toast.error(`Failed to update balances: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error updating balances:', error);
      toast.error(`Error updating balances: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setSaving(false);
    }
  };

  const getOperationIcon = () => {
    switch (operation) {
      case 'add':
        return <Plus className="w-4 h-4" />;
      case 'deduct':
        return <Minus className="w-4 h-4" />;
      case 'set':
        return <Edit className="w-4 h-4" />;
    }
  };

  const getOperationLabel = () => {
    switch (operation) {
      case 'add':
        return 'Add to Balance';
      case 'deduct':
        return 'Deduct from Balance';
      case 'set':
        return 'Set Balance';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Balances</CardTitle>
        <CardDescription>Manage fiat and cryptocurrency balances</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Label htmlFor="operation" className="text-base font-semibold mb-2 block">
            Operation Mode
          </Label>
          <Select value={operation} onValueChange={(v) => setOperation(v as 'set' | 'add' | 'deduct')}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="set">
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  <span>Set Balance (Overwrite)</span>
                </div>
              </SelectItem>
              <SelectItem value="add">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Add to Balance</span>
                </div>
              </SelectItem>
              <SelectItem value="deduct">
                <div className="flex items-center gap-2">
                  <Minus className="w-4 h-4" />
                  <span>Deduct from Balance</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-600 mt-2">
            {operation === 'set' && 'Replace the current balance with the exact value you enter'}
            {operation === 'add' && 'Add the entered amount to the current balance'}
            {operation === 'deduct' && 'Subtract the entered amount from the current balance'}
          </p>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Fiat Currencies</h3>
            </div>
            <div className="text-xl font-semibold text-gray-700">
              USD ${balances.usd?.balance || '0.00'} | EUR €{balances.euro?.balance || '0.00'} | CAD ${balances.cad?.balance || '0.00'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="usd">
                USD Balance {operation === 'set' ? '(Set to)' : operation === 'add' ? '(Add)' : '(Deduct)'}
              </Label>
              <Input
                id="usd"
                type="text"
                value={editData.usd}
                onChange={(e) => setEditData({ ...editData, usd: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="euro">
                EUR Balance {operation === 'set' ? '(Set to)' : operation === 'add' ? '(Add)' : '(Deduct)'}
              </Label>
              <Input
                id="euro"
                type="text"
                value={editData.euro}
                onChange={(e) => setEditData({ ...editData, euro: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="cad">
                CAD Balance {operation === 'set' ? '(Set to)' : operation === 'add' ? '(Add)' : '(Deduct)'}
              </Label>
              <Input
                id="cad"
                type="text"
                value={editData.cad}
                onChange={(e) => setEditData({ ...editData, cad: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Cryptocurrency</h3>
            </div>
            <div className="text-xl font-semibold text-gray-700">
              BTC {balances.crypto?.btc_balance || '0.00000000'} | ETH {balances.crypto?.eth_balance || '0.00000000'} | USDT {balances.crypto?.usdt_balance || '0.000000'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="btc">
                BTC Balance {operation === 'set' ? '(Set to)' : operation === 'add' ? '(Add)' : '(Deduct)'}
              </Label>
              <Input
                id="btc"
                type="text"
                value={editData.btc}
                onChange={(e) => setEditData({ ...editData, btc: e.target.value })}
                placeholder="0.00000000"
              />
            </div>

            <div>
              <Label htmlFor="eth">
                ETH Balance {operation === 'set' ? '(Set to)' : operation === 'add' ? '(Add)' : '(Deduct)'}
              </Label>
              <Input
                id="eth"
                type="text"
                value={editData.eth}
                onChange={(e) => setEditData({ ...editData, eth: e.target.value })}
                placeholder="0.00000000"
              />
            </div>

            <div>
              <Label htmlFor="usdt">
                USDT Balance {operation === 'set' ? '(Set to)' : operation === 'add' ? '(Add)' : '(Deduct)'}
              </Label>
              <Input
                id="usdt"
                type="text"
                value={editData.usdt}
                onChange={(e) => setEditData({ ...editData, usdt: e.target.value })}
                placeholder="0.000000"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {getOperationIcon()}
            <span className="ml-2">{saving ? 'Processing...' : getOperationLabel()}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
