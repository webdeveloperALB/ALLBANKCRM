"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

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
    usd: "0.00",
    euro: "0.00",
    cad: "0.00",
    btc: "0.00000000",
    eth: "0.00000000",
    usdt: "0.000000",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBalances();
  }, [bankKey, userId]);

  async function loadBalances() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/balances?bankKey=${bankKey}&userId=${userId}`
      );
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
    } finally {
      setLoading(false);
    }
  }

  async function updateBalance(currency: string, isCrypto: boolean) {
    const amount = editValues[currency];
    if (!amount) return;

    setSaving(true);
    try {
      const payload: any = { bankKey, userId, operation: "set", balances: {} };

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
        toast.success("Updated");
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

  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  const currencies = [
    { key: "usd", label: "USD", symbol: "$", balance: balances.usd, isCrypto: false },
    { key: "euro", label: "EUR", symbol: "€", balance: balances.euro, isCrypto: false },
    { key: "cad", label: "CAD", symbol: "$", balance: balances.cad, isCrypto: false },
    { key: "btc", label: "BTC", symbol: "₿", balance: balances.btc, isCrypto: true },
    { key: "eth", label: "ETH", symbol: "Ξ", balance: balances.eth, isCrypto: true },
    { key: "usdt", label: "USDT", symbol: "₮", balance: balances.usdt, isCrypto: true },
  ];

  return (
    <div className="bg-white border rounded-lg">
      <div className="px-3 py-2 border-b bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Balances</h3>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-6 gap-2">
          {currencies.map((currency) => (
            <div key={currency.key} className="flex flex-col gap-1">
              <div className="text-xs font-medium text-gray-600">{currency.label}</div>
              <div className="text-sm font-mono font-semibold">{currency.symbol}{currency.balance}</div>
              <div className="flex gap-1">
                <Input
                  type="number"
                  step={currency.isCrypto ? "0.00000001" : "0.01"}
                  placeholder="New"
                  value={editValues[currency.key] || ""}
                  onChange={(e) => setEditValues(prev => ({ ...prev, [currency.key]: e.target.value }))}
                  className="h-7 text-xs"
                />
                <Button
                  onClick={() => updateBalance(currency.key, currency.isCrypto)}
                  disabled={saving || !editValues[currency.key]}
                  size="sm"
                  className="h-7 px-2 text-xs"
                >
                  Set
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
