"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Euro,
  Coins,
  Bitcoin,
  Plus,
  Minus,
  ArrowRightLeft,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
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

  async function executeOperation(
    currency: string,
    amount: string,
    operation: "set" | "add" | "deduct",
    isCrypto: boolean
  ) {
    if (!amount || parseFloat(amount) === 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSaving(true);
    try {
      const payload: any = { bankKey, userId, operation, balances: {} };

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
        toast.success("Balance updated successfully");
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
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Wallet className="w-12 h-12 mx-auto text-gray-400 animate-pulse" />
            <div className="text-gray-500 font-medium">Loading balances...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CurrencyCard = ({
    currency,
    label,
    symbol,
    icon: Icon,
    balance,
    step,
    isCrypto = false,
  }: {
    currency: string;
    label: string;
    symbol: string;
    icon: any;
    balance: string;
    step?: string;
    isCrypto?: boolean;
  }) => {
    const [amount, setAmount] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <Card className="border border-gray-200 hover:border-gray-300 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Icon className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 mb-1">
                  {label}
                </div>
                <div className="text-3xl font-bold text-gray-900 font-mono">
                  {symbol}
                  {balance}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {isCrypto ? "Crypto" : "Fiat"}
            </Badge>
          </div>

          <Separator className="mb-4" />

          <div className="space-y-3">
            <Input
              type="number"
              step={step || "0.01"}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              className="h-11 text-base font-medium"
            />

            {isExpanded && amount && (
              <div className="grid grid-cols-3 gap-2 animate-in fade-in-50 duration-200">
                <Button
                  onClick={() => {
                    executeOperation(currency, amount, "set", isCrypto);
                    setAmount("");
                    setIsExpanded(false);
                  }}
                  disabled={saving}
                  variant="outline"
                  size="sm"
                  className="gap-2 h-10"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Set
                </Button>
                <Button
                  onClick={() => {
                    executeOperation(currency, amount, "add", isCrypto);
                    setAmount("");
                    setIsExpanded(false);
                  }}
                  disabled={saving}
                  variant="outline"
                  size="sm"
                  className="gap-2 h-10 text-green-700 border-green-200 hover:bg-green-50"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
                <Button
                  onClick={() => {
                    executeOperation(currency, amount, "deduct", isCrypto);
                    setAmount("");
                    setIsExpanded(false);
                  }}
                  disabled={saving}
                  variant="outline"
                  size="sm"
                  className="gap-2 h-10 text-red-700 border-red-200 hover:bg-red-50"
                >
                  <Minus className="w-4 h-4" />
                  Deduct
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const currencies = {
    fiat: [
      {
        key: "usd",
        label: "US Dollar",
        symbol: "$",
        icon: DollarSign,
        balance: balances.usd,
      },
      {
        key: "euro",
        label: "Euro",
        symbol: "€",
        icon: Euro,
        balance: balances.euro,
      },
      {
        key: "cad",
        label: "Canadian Dollar",
        symbol: "$",
        icon: Coins,
        balance: balances.cad,
      },
    ],
    crypto: [
      {
        key: "btc",
        label: "Bitcoin",
        symbol: "₿",
        icon: Bitcoin,
        balance: balances.btc,
        step: "0.00000001",
      },
      {
        key: "eth",
        label: "Ethereum",
        symbol: "Ξ",
        icon: TrendingUp,
        balance: balances.eth,
        step: "0.00000001",
      },
      {
        key: "usdt",
        label: "Tether",
        symbol: "₮",
        icon: Coins,
        balance: balances.usdt,
        step: "0.000001",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Fiat Currencies</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencies.fiat.map((currency) => (
              <CurrencyCard
                key={currency.key}
                currency={currency.key}
                label={currency.label}
                symbol={currency.symbol}
                icon={currency.icon}
                balance={currency.balance}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bitcoin className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">
              Cryptocurrencies
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencies.crypto.map((currency) => (
              <CurrencyCard
                key={currency.key}
                currency={currency.key}
                label={currency.label}
                symbol={currency.symbol}
                icon={currency.icon}
                balance={currency.balance}
                step={currency.step}
                isCrypto={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
