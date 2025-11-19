'use client';

import { useState, useEffect } from 'react';
import { UserWithBank } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Plus, Pencil, Trash2, X, Check, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

interface CardData {
  id: string;
  user_id: string;
  card_number: string;
  card_holder_name: string;
  expiry_month: number;
  expiry_year: number;
  card_type: string;
  spending_limit: string;
  status: string;
  cvv: string;
  pin: string;
  issuer: string;
  network: string;
  card_design: string;
  account_number: string | null;
  routing_number: string;
  is_activated: boolean;
  activated_at: string | null;
  daily_limit: string;
  atm_limit: string;
  international_enabled: boolean;
  contactless_enabled: boolean;
  online_enabled: boolean;
  last_used_at: string | null;
  is_replacement: boolean;
  replaced_card_id: string | null;
  delivery_address: string | null;
  expected_delivery: string | null;
  notes: string | null;
  emergency_phone: string | null;
  created_at: string;
}

interface UserCardsManagementProps {
  user: UserWithBank;
}

export function UserCardsManagement({ user }: UserCardsManagementProps) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; cardId: string | null }>({ open: false, cardId: null });

  const [newCard, setNewCard] = useState({
    card_number: '',
    card_holder_name: '',
    expiry_month: 1,
    expiry_year: new Date().getFullYear(),
    card_type: 'Virtual',
    spending_limit: '5000.00',
    status: 'Active',
    cvv: '000',
    pin: '0000',
    issuer: 'Digital Chain Bank',
    network: 'Visa',
    card_design: 'orange-gradient',
    account_number: '',
    routing_number: '123456789',
    is_activated: false,
    daily_limit: '1000.00',
    atm_limit: '500.00',
    international_enabled: false,
    contactless_enabled: true,
    online_enabled: true,
    delivery_address: '',
    notes: '',
    emergency_phone: ''
  });

  const [editData, setEditData] = useState<Partial<CardData>>({});

  useEffect(() => {
    fetchCards();
  }, [user.bank_key, user.id]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/cards?bankKey=${user.bank_key}&userId=${user.id}`
      );
      const data = await response.json();
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/cards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          ...newCard
        })
      });

      if (response.ok) {
        setShowAddDialog(false);
        setNewCard({
          card_number: '',
          card_holder_name: '',
          expiry_month: 1,
          expiry_year: new Date().getFullYear(),
          card_type: 'Virtual',
          spending_limit: '5000.00',
          status: 'Active',
          cvv: '000',
          pin: '0000',
          issuer: 'Digital Chain Bank',
          network: 'Visa',
          card_design: 'orange-gradient',
          account_number: '',
          routing_number: '123456789',
          is_activated: false,
          daily_limit: '1000.00',
          atm_limit: '500.00',
          international_enabled: false,
          contactless_enabled: true,
          online_enabled: true,
          delivery_address: '',
          notes: '',
          emergency_phone: ''
        });
        await fetchCards();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create card: ${errorData.error}`);
      }
    } catch (error: any) {
      console.error('Error creating card:', error);
      toast.error('Error creating card: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCard = (card: CardData) => {
    setEditingCardId(card.id);
    setEditData({ ...card });
  };

  const handleSaveCard = async (cardId: string) => {
    try {
      const response = await fetch('/api/cards/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          cardId,
          ...editData
        })
      });

      if (response.ok) {
        await fetchCards();
        setEditingCardId(null);
        setEditData({});
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update card: ${errorData?.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error updating card:', error);
      toast.error(`Error updating card: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditData({});
  };

  const handleDeleteCard = async () => {
    if (!deleteConfirm.cardId) return;

    try {
      const response = await fetch('/api/cards/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          cardId: deleteConfirm.cardId
        })
      });

      if (response.ok) {
        await fetchCards();
        toast.success('Card deleted successfully');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete card: ${errorData.error}`);
      }
    } catch (error: any) {
      console.error('Error deleting card:', error);
      toast.error('Error deleting card: ' + error.message);
    }
  };

  const toggleSensitiveData = (cardId: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const maskCardNumber = (cardNumber: string) => {
    if (cardNumber.length < 4) return cardNumber;
    return '•••• •••• •••• ' + cardNumber.slice(-4);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Blocked': 'bg-red-100 text-red-800',
      'Frozen': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Card Management</CardTitle>
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
    <>
      <Card className="shadow-sm border-0 ring-1 ring-gray-200">
        <CardHeader className="bg-gradient-to-br from-blue-50 to-violet-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Card Management
              </CardTitle>
              <CardDescription>Manage user payment cards and settings</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {cards.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No cards found</p>
            </div>
          ) : (
            cards.map((card) => (
              <div key={card.id} className="border-2 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all">
                {editingCardId === card.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Card Number</Label>
                        <Input
                          value={editData.card_number || ''}
                          onChange={(e) => setEditData({ ...editData, card_number: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Card Holder Name</Label>
                        <Input
                          value={editData.card_holder_name || ''}
                          onChange={(e) => setEditData({ ...editData, card_holder_name: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Expiry Month</Label>
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          value={editData.expiry_month || 1}
                          onChange={(e) => setEditData({ ...editData, expiry_month: parseInt(e.target.value) })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Expiry Year</Label>
                        <Input
                          type="number"
                          value={editData.expiry_year || new Date().getFullYear()}
                          onChange={(e) => setEditData({ ...editData, expiry_year: parseInt(e.target.value) })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">CVV</Label>
                        <Input
                          value={editData.cvv || ''}
                          onChange={(e) => setEditData({ ...editData, cvv: e.target.value })}
                          className="h-8 text-sm"
                          maxLength={4}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">PIN</Label>
                        <Input
                          value={editData.pin || ''}
                          onChange={(e) => setEditData({ ...editData, pin: e.target.value })}
                          className="h-8 text-sm"
                          maxLength={6}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Card Type</Label>
                        <Select
                          value={editData.card_type || 'Virtual'}
                          onValueChange={(value) => setEditData({ ...editData, card_type: value })}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Virtual">Virtual</SelectItem>
                            <SelectItem value="Physical">Physical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Network</Label>
                        <Select
                          value={editData.network || 'Visa'}
                          onValueChange={(value) => setEditData({ ...editData, network: value })}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Visa">Visa</SelectItem>
                            <SelectItem value="Mastercard">Mastercard</SelectItem>
                            <SelectItem value="Amex">American Express</SelectItem>
                            <SelectItem value="Discover">Discover</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Status</Label>
                        <Select
                          value={editData.status || 'Active'}
                          onValueChange={(value) => setEditData({ ...editData, status: value })}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Blocked">Blocked</SelectItem>
                            <SelectItem value="Frozen">Frozen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Spending Limit</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.spending_limit || ''}
                          onChange={(e) => setEditData({ ...editData, spending_limit: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Daily Limit</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.daily_limit || ''}
                          onChange={(e) => setEditData({ ...editData, daily_limit: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">ATM Limit</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.atm_limit || ''}
                          onChange={(e) => setEditData({ ...editData, atm_limit: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editData.is_activated || false}
                          onCheckedChange={(checked) => setEditData({ ...editData, is_activated: checked })}
                        />
                        <Label className="text-xs">Activated</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editData.international_enabled || false}
                          onCheckedChange={(checked) => setEditData({ ...editData, international_enabled: checked })}
                        />
                        <Label className="text-xs">International</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editData.contactless_enabled !== undefined ? editData.contactless_enabled : true}
                          onCheckedChange={(checked) => setEditData({ ...editData, contactless_enabled: checked })}
                        />
                        <Label className="text-xs">Contactless</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editData.online_enabled !== undefined ? editData.online_enabled : true}
                          onCheckedChange={(checked) => setEditData({ ...editData, online_enabled: checked })}
                        />
                        <Label className="text-xs">Online</Label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        value={editData.notes || ''}
                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                        className="text-sm"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveCard(card.id)} className="flex-1">
                        <Check className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} className="flex-1">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {showSensitive[card.id] ? card.card_number : maskCardNumber(card.card_number)}
                          </h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleSensitiveData(card.id)}
                            className="h-6 px-2"
                          >
                            {showSensitive[card.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Badge className={getStatusBadge(card.status)}>{card.status}</Badge>
                          <Badge variant="outline">{card.card_type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{card.card_holder_name}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditCard(card)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm({ open: true, cardId: card.id })}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Expiry</p>
                        <p className="font-medium">{card.expiry_month.toString().padStart(2, '0')}/{card.expiry_year}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CVV</p>
                        <p className="font-medium">{showSensitive[card.id] ? card.cvv : '•••'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">PIN</p>
                        <p className="font-medium">{showSensitive[card.id] ? card.pin : '••••'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Network</p>
                        <p className="font-medium">{card.network}</p>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Spending Limit</p>
                        <p className="font-medium">${card.spending_limit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Daily Limit</p>
                        <p className="font-medium">${card.daily_limit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ATM Limit</p>
                        <p className="font-medium">${card.atm_limit}</p>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex gap-2 flex-wrap">
                      {card.is_activated && <Badge variant="outline" className="text-xs">Activated</Badge>}
                      {card.international_enabled && <Badge variant="outline" className="text-xs">International</Badge>}
                      {card.contactless_enabled && <Badge variant="outline" className="text-xs">Contactless</Badge>}
                      {card.online_enabled && <Badge variant="outline" className="text-xs">Online</Badge>}
                    </div>

                    {card.notes && (
                      <>
                        <Separator className="my-3" />
                        <div className="text-sm">
                          <p className="text-xs text-gray-500 mb-1">Notes</p>
                          <p className="text-gray-700">{card.notes}</p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Card</DialogTitle>
            <DialogDescription>Create a new card for this user</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Card Number</Label>
                <Input
                  value={newCard.card_number}
                  onChange={(e) => setNewCard({ ...newCard, card_number: e.target.value })}
                  placeholder="1234567890123456"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Card Holder Name</Label>
                <Input
                  value={newCard.card_holder_name}
                  onChange={(e) => setNewCard({ ...newCard, card_holder_name: e.target.value })}
                  placeholder="John Doe"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Expiry Month</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={newCard.expiry_month}
                  onChange={(e) => setNewCard({ ...newCard, expiry_month: parseInt(e.target.value) })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Expiry Year</Label>
                <Input
                  type="number"
                  value={newCard.expiry_year}
                  onChange={(e) => setNewCard({ ...newCard, expiry_year: parseInt(e.target.value) })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">CVV</Label>
                <Input
                  value={newCard.cvv}
                  onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                  placeholder="000"
                  className="h-8 text-sm"
                  maxLength={4}
                />
              </div>
              <div>
                <Label className="text-xs">PIN</Label>
                <Input
                  value={newCard.pin}
                  onChange={(e) => setNewCard({ ...newCard, pin: e.target.value })}
                  placeholder="0000"
                  className="h-8 text-sm"
                  maxLength={6}
                />
              </div>
              <div>
                <Label className="text-xs">Card Type</Label>
                <Select
                  value={newCard.card_type}
                  onValueChange={(value) => setNewCard({ ...newCard, card_type: value })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                    <SelectItem value="Physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Network</Label>
                <Select
                  value={newCard.network}
                  onValueChange={(value) => setNewCard({ ...newCard, network: value })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="Mastercard">Mastercard</SelectItem>
                    <SelectItem value="Amex">American Express</SelectItem>
                    <SelectItem value="Discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Spending Limit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newCard.spending_limit}
                  onChange={(e) => setNewCard({ ...newCard, spending_limit: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Daily Limit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newCard.daily_limit}
                  onChange={(e) => setNewCard({ ...newCard, daily_limit: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">ATM Limit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newCard.atm_limit}
                  onChange={(e) => setNewCard({ ...newCard, atm_limit: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select
                  value={newCard.status}
                  onValueChange={(value) => setNewCard({ ...newCard, status: value })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                    <SelectItem value="Frozen">Frozen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newCard.is_activated}
                  onCheckedChange={(checked) => setNewCard({ ...newCard, is_activated: checked })}
                />
                <Label className="text-xs">Activated</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newCard.international_enabled}
                  onCheckedChange={(checked) => setNewCard({ ...newCard, international_enabled: checked })}
                />
                <Label className="text-xs">International</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newCard.contactless_enabled}
                  onCheckedChange={(checked) => setNewCard({ ...newCard, contactless_enabled: checked })}
                />
                <Label className="text-xs">Contactless</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newCard.online_enabled}
                  onCheckedChange={(checked) => setNewCard({ ...newCard, online_enabled: checked })}
                />
                <Label className="text-xs">Online</Label>
              </div>
            </div>

            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={newCard.notes}
                onChange={(e) => setNewCard({ ...newCard, notes: e.target.value })}
                placeholder="Additional notes"
                className="text-sm"
                rows={2}
              />
            </div>

            <Button onClick={handleAddCard} disabled={saving} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {saving ? 'Creating...' : 'Create Card'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, cardId: null })}
        title="Delete Card"
        description="Are you sure you want to delete this card? This action cannot be undone and will remove all card data."
        onConfirm={handleDeleteCard}
        confirmText="Delete Card"
        variant="destructive"
      />
    </>
  );
}
