'use client';

import { useState, useEffect } from 'react';
import { UserWithBank } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Plus, Trash2, Mail, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface UserMessage {
  id: string;
  user_id: string;
  title: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface UserMessagesCardProps {
  user: UserWithBank;
}

export function UserMessagesCard({ user }: UserMessagesCardProps) {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    message_type: 'info'
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/messages?bankKey=${user.bank_key}&userId=${user.id}`
      );
      const data = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMessage = async () => {
    if (!newMessage.title || !newMessage.content) {
      alert('Please fill in both title and content');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/messages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          ...newMessage
        })
      });

      if (response.ok) {
        setNewMessage({ title: '', content: '', message_type: 'info' });
        await fetchMessages();
      } else {
        const errorData = await response.json();
        alert(`Failed to create message: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating message:', error);
      alert('Error creating message: ' + error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    setDeleting(messageId);
    try {
      const response = await fetch('/api/messages/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          messageId
        })
      });

      if (response.ok) {
        await fetchMessages();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete message: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message: ' + error);
    } finally {
      setDeleting(null);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getMessageBadge = (type: string) => {
    const colors = {
      alert: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800'
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Messages</CardTitle>
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
        <CardTitle>User Messages</CardTitle>
        <CardDescription>Send and manage messages for this user</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Message
          </h3>

          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Message Title</Label>
              <Input
                id="title"
                value={newMessage.title}
                onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                placeholder="Enter message title"
              />
            </div>

            <div>
              <Label htmlFor="content">Message Content</Label>
              <Textarea
                id="content"
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                placeholder="Enter message content"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="message_type">Message Type</Label>
              <Select
                value={newMessage.message_type}
                onValueChange={(value) => setNewMessage({ ...newMessage, message_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddMessage} disabled={saving} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {saving ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Latest Message
          </h3>

          {messages.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Mail className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No messages sent yet</p>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getMessageIcon(messages[0].message_type)}
                  <h4 className="font-semibold">{messages[0].title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getMessageBadge(messages[0].message_type)}>
                    {messages[0].message_type}
                  </Badge>
                  {messages[0].is_read && (
                    <Badge variant="outline" className="text-xs">Read</Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteMessage(messages[0].id)}
                    disabled={deleting === messages[0].id}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{messages[0].content}</p>
              <p className="text-xs text-gray-500">
                {new Date(messages[0].created_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
