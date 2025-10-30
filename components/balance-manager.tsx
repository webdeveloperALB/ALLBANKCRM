'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface BalanceManagerProps {
  bankKey: string;
  userId: string;
}

interface Balances {
  usd: string;
  euro: string;
  cad: string;
  btc: string;
  eth: string;
  usdt: string;
}

export function BalanceManager({ bankKey, userId }: BalanceManagerProps) {
  const [balances, setBalances] = useState<Balances>({
    usd: '0.00',
    euro: '0.00',
    cad: '0.00',
    btc: '0.00000000',
    eth: '0.00000000',
    usdt: '0.000000'
  });

  const [editValues, setEditValues] = useState({
    usd: '',
    euro: '',
    cad: '',
    btc: '',
    eth: '',
    usdt: ''
  });

  const [selectedCurrencies, setSelectedCurrencies] = useState({
    usd: false,
    euro: false,
    cad: false,
    btc: false,
    eth: false,
    usdt: false
  });

  const [operation, setOperation] = useState<'set' | 'add' | 'deduct'>('set');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBalances();
  }, [bankKey, userId]);

  async function loadBalances() {
    setLoading(true);
    try {
      const response = await fetch(`/api/balances?bankKey=${bankKey}&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setBalances({
          usd: data.usd || '0.00',
          euro: data.euro || '0.00',
          cad: data.cad || '0.00',
          btc: data.btc || '0.00000000',
          eth: data.eth || '0.00000000',
          usdt: data.usdt || '0.000000'
        });
      }
    } catch (error) {
      console.error('Failed to load balances:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateBalances() {
    setSaving(true);
    try {
      const payload: any = { bankKey, userId, operation, balances: {} };

      if (selectedCurrencies.usd && editValues.usd) {
        payload.balances.usd = editValues.usd;
      }
      if (selectedCurrencies.euro && editValues.euro) {
        payload.balances.euro = editValues.euro;
      }
      if (selectedCurrencies.cad && editValues.cad) {
        payload.balances.cad = editValues.cad;
      }

      if (selectedCurrencies.btc || selectedCurrencies.eth || selectedCurrencies.usdt) {
        const cryptoData: any = {};
        if (selectedCurrencies.btc && editValues.btc) cryptoData.btc = editValues.btc;
        if (selectedCurrencies.eth && editValues.eth) cryptoData.eth = editValues.eth;
        if (selectedCurrencies.usdt && editValues.usdt) cryptoData.usdt = editValues.usdt;

        if (Object.keys(cryptoData).length > 0) {
          payload.balances.crypto = cryptoData;
        }
      }

      if (Object.keys(payload.balances).length === 0) {
        alert('Select at least one currency and enter a value');
        setSaving(false);
        return;
      }

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('/api/balances/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await loadBalances();
        setEditValues({
          usd: '',
          euro: '',
          cad: '',
          btc: '',
          eth: '',
          usdt: ''
        });
        setSelectedCurrencies({
          usd: false,
          euro: false,
          cad: false,
          btc: false,
          eth: false,
          usdt: false
        });
        alert('Balances updated successfully');
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        alert(`Failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Card><CardContent className="p-6">Loading balances...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <CardTitle className="text-xl">Balance Management</CardTitle>
          <Select value={operation} onValueChange={(v: any) => setOperation(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="set">Set</SelectItem>
              <SelectItem value="add">Add</SelectItem>
              <SelectItem value="deduct">Deduct</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-6 gap-3 p-4 bg-slate-50 rounded">
          <div>
            <div className="text-xs text-slate-500 mb-1">USD</div>
            <div className="text-xl font-mono font-semibold">${balances.usd}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">EUR</div>
            <div className="text-xl font-mono font-semibold">€{balances.euro}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">CAD</div>
            <div className="text-xl font-mono font-semibold">${balances.cad}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">BTC</div>
            <div className="text-base font-mono font-semibold">{balances.btc}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">ETH</div>
            <div className="text-base font-mono font-semibold">{balances.eth}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">USDT</div>
            <div className="text-base font-mono font-semibold">{balances.usdt}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <div className="space-y-2 col-span-1">
            <div className="flex items-center gap-2 p-2 border rounded text-sm">
              <Checkbox
                id="usd"
                checked={selectedCurrencies.usd}
                onCheckedChange={(checked) =>
                  setSelectedCurrencies({ ...selectedCurrencies, usd: !!checked })
                }
              />
              <Label htmlFor="usd" className="flex-1 cursor-pointer text-xs">USD</Label>
            </div>
            {selectedCurrencies.usd && (
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                className="h-9 text-sm"
                value={editValues.usd}
                onChange={(e) => setEditValues({ ...editValues, usd: e.target.value })}
              />
            )}
          </div>

          <div className="space-y-2 col-span-1">
            <div className="flex items-center gap-2 p-2 border rounded text-sm">
              <Checkbox
                id="euro"
                checked={selectedCurrencies.euro}
                onCheckedChange={(checked) =>
                  setSelectedCurrencies({ ...selectedCurrencies, euro: !!checked })
                }
              />
              <Label htmlFor="euro" className="flex-1 cursor-pointer text-xs">EUR</Label>
            </div>
            {selectedCurrencies.euro && (
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                className="h-9 text-sm"
                value={editValues.euro}
                onChange={(e) => setEditValues({ ...editValues, euro: e.target.value })}
              />
            )}
          </div>

          <div className="space-y-2 col-span-1">
            <div className="flex items-center gap-2 p-2 border rounded text-sm">
              <Checkbox
                id="cad"
                checked={selectedCurrencies.cad}
                onCheckedChange={(checked) =>
                  setSelectedCurrencies({ ...selectedCurrencies, cad: !!checked })
                }
              />
              <Label htmlFor="cad" className="flex-1 cursor-pointer text-xs">CAD</Label>
            </div>
            {selectedCurrencies.cad && (
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                className="h-9 text-sm"
                value={editValues.cad}
                onChange={(e) => setEditValues({ ...editValues, cad: e.target.value })}
              />
            )}
          </div>

          <div className="space-y-2 col-span-1">
            <div className="flex items-center gap-2 p-2 border rounded text-sm">
              <Checkbox
                id="btc"
                checked={selectedCurrencies.btc}
                onCheckedChange={(checked) =>
                  setSelectedCurrencies({ ...selectedCurrencies, btc: !!checked })
                }
              />
              <Label htmlFor="btc" className="flex-1 cursor-pointer text-xs">BTC</Label>
            </div>
            {selectedCurrencies.btc && (
              <Input
                type="number"
                step="0.00000001"
                placeholder="Amount"
                className="h-9 text-sm"
                value={editValues.btc}
                onChange={(e) => setEditValues({ ...editValues, btc: e.target.value })}
              />
            )}
          </div>

          <div className="space-y-2 col-span-1">
            <div className="flex items-center gap-2 p-2 border rounded text-sm">
              <Checkbox
                id="eth"
                checked={selectedCurrencies.eth}
                onCheckedChange={(checked) =>
                  setSelectedCurrencies({ ...selectedCurrencies, eth: !!checked })
                }
              />
              <Label htmlFor="eth" className="flex-1 cursor-pointer text-xs">ETH</Label>
            </div>
            {selectedCurrencies.eth && (
              <Input
                type="number"
                step="0.00000001"
                placeholder="Amount"
                className="h-9 text-sm"
                value={editValues.eth}
                onChange={(e) => setEditValues({ ...editValues, eth: e.target.value })}
              />
            )}
          </div>

          <div className="space-y-2 col-span-1">
            <div className="flex items-center gap-2 p-2 border rounded text-sm">
              <Checkbox
                id="usdt"
                checked={selectedCurrencies.usdt}
                onCheckedChange={(checked) =>
                  setSelectedCurrencies({ ...selectedCurrencies, usdt: !!checked })
                }
              />
              <Label htmlFor="usdt" className="flex-1 cursor-pointer text-xs">USDT</Label>
            </div>
            {selectedCurrencies.usdt && (
              <Input
                type="number"
                step="0.000001"
                placeholder="Amount"
                className="h-9 text-sm"
                value={editValues.usdt}
                onChange={(e) => setEditValues({ ...editValues, usdt: e.target.value })}
              />
            )}
          </div>
        </div>

        <Button onClick={updateBalances} disabled={saving} className="w-full" size="sm">
          {saving ? 'Updating...' : 'Update Balances'}
        </Button>
      </CardContent>
    </Card>
  );
}
