'use client';

import { useState, useEffect } from 'react';
import { UserWithBank, AccountActivity, ActivityType, ActivityPriority, ActivityCurrency } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface UserActivitiesCardProps {
  user: UserWithBank;
}

const activityTypes: ActivityType[] = [
  'admin_notification', 'system_update', 'security_alert', 'account_notice',
  'service_announcement', 'maintenance_notice', 'policy_update', 'feature_announcement',
  'account_credit', 'account_debit', 'transfer_notification', 'deposit_notification',
  'withdrawal_notification', 'payment_notification', 'balance_inquiry', 'transaction_alert',
  'receipt_notification', 'wire_transfer', 'ach_transfer', 'check_deposit',
  'card_transaction', 'mobile_payment', 'online_banking', 'account_opening',
  'account_closure', 'account_freeze', 'account_unfreeze', 'limit_change',
  'fraud_alert', 'kyc_update', 'compliance_notice', 'statement_ready',
  'promotional_offer', 'service_update', 'support_response', 'appointment_reminder',
  'document_request'
];

const priorities: ActivityPriority[] = ['low', 'normal', 'high', 'urgent'];
const currencies: ActivityCurrency[] = ['usd', 'euro', 'cad', 'gbp', 'jpy', 'crypto'];

export function UserActivitiesCard({ user }: UserActivitiesCardProps) {
  const [activities, setActivities] = useState<AccountActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingActivity, setEditingActivity] = useState<AccountActivity | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: 'account_notice' as ActivityType,
    title: '',
    description: '',
    currency: 'usd' as ActivityCurrency,
    display_amount: '0',
    priority: 'normal' as ActivityPriority,
    status: 'active' as 'active' | 'archived' | 'deleted',
    is_read: false,
    created_at: '',
    expires_at: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; activityId: string | null }>({ open: false, activityId: null });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/activities?user_id=${user.id}&bank_key=${user.bank_key}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user.id, user.bank_key]);

  const handleOpenDialog = (activity?: AccountActivity) => {
    if (activity) {
      setEditingActivity(activity);
      const createdDate = new Date(activity.created_at);
      const expiresDate = activity.expires_at ? new Date(activity.expires_at) : null;
      setFormData({
        activity_type: activity.activity_type,
        title: activity.title,
        description: activity.description || '',
        currency: activity.currency,
        display_amount: activity.display_amount.toString(),
        priority: activity.priority,
        status: activity.status as 'active' | 'archived' | 'deleted',
        is_read: activity.is_read || false,
        created_at: createdDate.toISOString().slice(0, 16),
        expires_at: expiresDate ? expiresDate.toISOString().slice(0, 16) : '',
      });
    } else {
      setEditingActivity(null);
      const now = new Date().toISOString().slice(0, 16);
      setFormData({
        activity_type: 'account_notice',
        title: '',
        description: '',
        currency: 'usd',
        display_amount: '0',
        priority: 'normal',
        status: 'active',
        is_read: false,
        created_at: now,
        expires_at: '',
      });
    }
    setShowDialog(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const endpoint = editingActivity
        ? '/api/activities/update'
        : '/api/activities/create';

      const payload = {
        bank_key: user.bank_key,
        user_id: user.id,
        client_id: user.bank_key,
        activity_type: formData.activity_type,
        title: formData.title,
        description: formData.description,
        currency: formData.currency,
        display_amount: parseFloat(formData.display_amount) || 0,
        priority: formData.priority,
        status: formData.status,
        is_read: formData.is_read,
        created_at: formData.created_at ? new Date(formData.created_at).toISOString() : new Date().toISOString(),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        ...(editingActivity && { activity_id: editingActivity.id }),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(editingActivity ? 'Activity updated successfully!' : 'Activity created successfully!');
        await fetchActivities();
        setTimeout(() => {
          setShowDialog(false);
          setSuccess('');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save activity');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.activityId) return;

    try {
      const response = await fetch('/api/activities/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_key: user.bank_key,
          activity_id: deleteConfirm.activityId,
        }),
      });

      if (response.ok) {
        await fetchActivities();
        setSuccess('Activity deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete activity');
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getPriorityColor = (priority: ActivityPriority) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">Loading activities...</CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Account Activities</CardTitle>
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-1" />
              Add Activity
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No activities found</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                        <Badge variant={getPriorityColor(activity.priority)} className="text-xs">
                          {activity.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {activity.activity_type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {activity.description && (
                        <p className="text-xs text-gray-600 mb-2">{activity.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Amount: {activity.display_amount} {activity.currency.toUpperCase()}</span>
                        <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDialog(activity)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm({ open: true, activityId: activity.id })}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingActivity ? 'Edit Activity' : 'Create New Activity'}</DialogTitle>
            <DialogDescription>
              {editingActivity ? 'Update the activity details' : 'Add a new activity for this user'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Input
                value={formData.activity_type}
                onChange={(e) => setFormData({ ...formData, activity_type: e.target.value as ActivityType })}
                placeholder="Enter activity type"
              />
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Activity title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Activity description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: ActivityCurrency) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.display_amount}
                  onChange={(e) => setFormData({ ...formData, display_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: ActivityPriority) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'archived' | 'deleted') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Is Read</Label>
                <Select
                  value={formData.is_read.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_read: value === 'true' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Unread</SelectItem>
                    <SelectItem value="true">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Created At</Label>
                <Input
                  type="datetime-local"
                  value={formData.created_at}
                  onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Expires At (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingActivity ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingActivity ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, activityId: null })}
        title="Delete Activity"
        description="Are you sure you want to delete this activity? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
}
