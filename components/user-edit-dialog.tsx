'use client';

import { useState } from 'react';
import { UserWithBank } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

interface UserEditDialogProps {
  user: UserWithBank;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserEditDialog({ user, onClose, onSuccess }: UserEditDialogProps) {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    email: user.email || '',
    password: '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    full_name: user.full_name || '',
    age: user.age || '',
    kyc_status: user.kyc_status,
    is_admin: user.is_admin || false,
    is_manager: user.is_manager || false,
    is_superiormanager: user.is_superiormanager || false,
    bank_origin: user.bank_origin
  });
  const [saving, setSaving] = useState(false);

  const isCurrentUserPureAdmin = currentUser?.is_admin === true &&
                                  currentUser?.is_manager !== true &&
                                  currentUser?.is_superiormanager !== true;
  const canEditManagerRoles = isCurrentUserPureAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = {
        email: formData.email,
        password: formData.password || undefined,
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: formData.full_name,
        age: formData.age ? parseInt(formData.age.toString()) : null,
        kyc_status: formData.kyc_status,
        is_admin: formData.is_admin,
        is_manager: formData.is_manager,
        is_superiormanager: formData.is_superiormanager,
        bank_origin: formData.bank_origin
      };

      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          updates
        })
      });

      if (response.ok) {
        onSuccess();
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Editing user from {user.bank_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <p className="text-xs text-gray-500">Only enter a new password if you want to change it</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="kyc_status">KYC Status</Label>
              <Select
                value={formData.kyc_status}
                onValueChange={(value) => setFormData({ ...formData, kyc_status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bank_origin">Bank Origin</Label>
              <Input
                id="bank_origin"
                value={formData.bank_origin}
                onChange={(e) => setFormData({ ...formData, bank_origin: e.target.value })}
              />
            </div>

            <div className="grid gap-3">
              <Label>User Roles</Label>
              {canEditManagerRoles && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_admin"
                    checked={formData.is_admin}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_admin: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_admin" className="font-normal cursor-pointer">
                    Admin
                  </Label>
                </div>
              )}

              {canEditManagerRoles && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_manager"
                    checked={formData.is_manager}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_manager: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_manager" className="font-normal cursor-pointer">
                    Manager
                  </Label>
                </div>
              )}

              {canEditManagerRoles && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_superiormanager"
                    checked={formData.is_superiormanager}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_superiormanager: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_superiormanager" className="font-normal cursor-pointer">
                    Superior Manager
                  </Label>
                </div>
              )}

              {!canEditManagerRoles && (
                <p className="text-sm text-muted-foreground">
                  You don't have permission to edit user roles.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
