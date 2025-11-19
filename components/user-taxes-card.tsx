'use client';

import { useState, useEffect } from 'react';
import { UserWithBank } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface UserTaxes {
  id: string;
  user_id: string;
  taxes: string;
  on_hold: string;
  paid: string;
  created_at: string;
  updated_at: string;
}

interface UserTaxesCardProps {
  user: UserWithBank;
}

export function UserTaxesCard({ user }: UserTaxesCardProps) {
  const [taxes, setTaxes] = useState<UserTaxes | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editData, setEditData] = useState({
    taxes: '0.00',
    on_hold: '0.00',
    paid: '0.00',
    created_at: '',
    updated_at: ''
  });

  useEffect(() => {
    fetchTaxes();
  }, [user.bank_key, user.id]);

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
          paid: data.paid || '0.00',
          created_at: data.created_at ? new Date(data.created_at).toISOString().slice(0, 16) : '',
          updated_at: data.updated_at ? new Date(data.updated_at).toISOString().slice(0, 16) : ''
        });
      }
    } catch (error) {
      console.error('Error fetching taxes:', error);
    } finally {
      setLoading(false);
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
          paid: editData.paid,
          created_at: editData.created_at ? new Date(editData.created_at).toISOString() : null,
          updated_at: editData.updated_at ? new Date(editData.updated_at).toISOString() : null
        })
      });

      if (response.ok) {
        await fetchTaxes();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update taxes: ${errorData.error}`);
      }
    } catch (error: any) {
      console.error('Error updating taxes:', error);
      toast.error('Error updating taxes: ' + error.message);
    } finally {
      setSaving(false);
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

        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded mb-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">Created At</div>
            <div className="text-sm font-mono">{taxes?.created_at ? new Date(taxes.created_at).toLocaleString() : 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Updated At</div>
            <div className="text-sm font-mono">{taxes?.updated_at ? new Date(taxes.updated_at).toLocaleString() : 'N/A'}</div>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <div className="flex items-end gap-2">
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

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="created_at" className="text-sm mb-1">Created At</Label>
              <Input
                id="created_at"
                type="datetime-local"
                value={editData.created_at}
                onChange={(e) => setEditData({ ...editData, created_at: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="flex-1">
              <Label htmlFor="updated_at" className="text-sm mb-1">Updated At</Label>
              <Input
                id="updated_at"
                type="datetime-local"
                value={editData.updated_at}
                onChange={(e) => setEditData({ ...editData, updated_at: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
