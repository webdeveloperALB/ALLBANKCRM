"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MessageCircle,
  Send,
  X,
  User,
  Minimize2,
  Maximize2,
  XCircle,
  CheckCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BANKS } from "@/lib/bank-config";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { getAccessibleUserIds } from "@/lib/hierarchy-utils";

interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: "client" | "admin";
  sender_name: string | null;
  message: string;
  created_at: string;
  read_by_admin: boolean;
  read_by_client: boolean;
}

interface ChatSession {
  id: string;
  client_name: string | null;
  client_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  admin_id: string | null;
  client_user_id: string | null;
  unread_count?: number;
  bank_key?: string;
  bank_name?: string;
}

export default function AdminLiveChatSimple() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionsPollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(0);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const fetchSessions = async () => {
    try {
      if (!user) {
        console.log("⚠️ No user found, cannot fetch sessions");
        return;
      }

      console.log("📋 Fetching chat sessions from all 3 banks...");
      console.log(`👤 User: ${user.email}, ID: ${user.id}, Bank: ${user.bank_key}`);
      console.log(`   Roles - Admin: ${user.is_admin}, Manager: ${user.is_manager}, Superior: ${user.is_superiormanager}`);

      if (!user.bank_key) {
        console.error("❌ User has no bank_key");
        setSessions([]);
        return;
      }

      console.log(`🔍 Getting hierarchy via API for bank: ${user.bank_key}`);
      // Call API to get accessible user IDs from user's bank (bypasses RLS using service role)
      const hierarchyResponse = await fetch(
        `/api/chat/accessible-user-ids?user_id=${user.id}&bank_key=${user.bank_key}&is_admin=${user.is_admin}&is_manager=${user.is_manager}&is_superiormanager=${user.is_superiormanager}`
      );

      if (!hierarchyResponse.ok) {
        console.error('Failed to fetch accessible user IDs');
        setSessions([]);
        return;
      }

      const { accessibleUserIds } = await hierarchyResponse.json();
      console.log(`✅ User has access to ${accessibleUserIds.length > 0 ? accessibleUserIds.length : 'NO'} users:`, accessibleUserIds);

      let allSessions: ChatSession[] = [];

      // Query each bank's database for chat sessions
      for (const [bankKey, bankConfig] of Object.entries(BANKS)) {
        console.log(`\n  🏦 Checking ${bankConfig.name} for chat sessions...`);
        const bankClient = createClient(bankConfig.url, bankConfig.anonKey);

        let data: any[] = [];

        // If admin (pure admin without manager role), get all sessions from this bank
        if (accessibleUserIds.includes('*')) {
          console.log(`  ✅ Admin access - fetching ALL sessions from ${bankConfig.name}`);
          const { data: allData, error } = await bankClient
            .from("chat_sessions")
            .select("*")
            .order("last_message_at", { ascending: false });

          if (error) {
            console.error(`  ❌ Error from ${bankConfig.name}:`, error);
            continue;
          }
          data = allData || [];
        } else if (accessibleUserIds.length > 0) {
          // Manager or Superior Manager - filter by accessible user IDs
          console.log(`  🔐 Manager/Superior access - filtering ${bankConfig.name} by ${accessibleUserIds.length} accessible users`);

          const { data: filteredData, error } = await bankClient
            .from("chat_sessions")
            .select("*")
            .in("client_user_id", accessibleUserIds)
            .order("last_message_at", { ascending: false });

          if (error) {
            console.error(`  ❌ Error from ${bankConfig.name}:`, error);
            continue;
          }
          data = filteredData || [];
          console.log(`  📊 Found ${data.length} matching sessions in ${bankConfig.name}`);
        } else {
          console.log(`  ⚠️ No accessible users - skipping ${bankConfig.name}`);
          continue;
        }

        if (data && data.length > 0) {
          console.log(`  ✅ Found ${data.length} sessions in ${bankConfig.name}`);
          const sessionsWithBank = data.map(session => ({
            ...session,
            bank_key: bankKey,
            bank_name: bankConfig.name
          }));
          allSessions.push(...sessionsWithBank);
        } else {
          console.log(`  🔵 No sessions in ${bankConfig.name}`);
        }
      }

      allSessions.sort((a, b) =>
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );

      console.log(`✅ Total: ${allSessions.length} sessions across all banks`);

      const sessionsWithUnread = await Promise.all(
        allSessions.map(async (session) => {
          const bankConfig = BANKS[session.bank_key!];
          const bankClient = createClient(bankConfig.url, bankConfig.anonKey);

          const { count } = await bankClient
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("session_id", session.id)
            .eq("sender_type", "client")
            .eq("read_by_admin", false);

          console.log(`📊 [${session.bank_name}] "${session.client_name}": ${count} unread`);

          return {
            ...session,
            unread_count: count || 0,
          };
        })
      );

      console.log("💾 Setting sessions state:", sessionsWithUnread);
      setSessions(sessionsWithUnread);
    } catch (error) {
      console.error("❌ Error fetching sessions:", error);
    }
  };

  const fetchMessages = useCallback(async (sessionId: string) => {
    if (!selectedSession?.bank_key) return;

    try {
      console.log(`💬 Fetching messages for session: ${sessionId}`);
      const bankConfig = BANKS[selectedSession.bank_key];
      const bankClient = createClient(bankConfig.url, bankConfig.anonKey);

      const { data, error } = await bankClient
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Error fetching messages:", error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} messages`);

      if (data && data.length !== lastMessageCountRef.current) {
        setMessages(data || []);
        lastMessageCountRef.current = data.length;
        scrollToBottom();

        const unreadMessages = data.filter(
          (m) => m.sender_type === "client" && !m.read_by_admin
        );

        if (unreadMessages.length > 0) {
          console.log(`📖 Marking ${unreadMessages.length} messages as read`);
          for (const msg of unreadMessages) {
            await bankClient
              .from("chat_messages")
              .update({ read_by_admin: true })
              .eq("id", msg.id);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
    }
  }, [selectedSession?.bank_key]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession || !selectedSession.bank_key) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const bankConfig = BANKS[selectedSession.bank_key];
      const bankClient = createClient(bankConfig.url, bankConfig.anonKey);

      const messageData = {
        session_id: selectedSession.id,
        sender_type: "admin" as const,
        sender_name: "Support Agent",
        message: messageText,
        read_by_admin: true,
        read_by_client: false,
      };

      const { data, error } = await bankClient
        .from("chat_messages")
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data]);
      lastMessageCountRef.current++;
      scrollToBottom();

      await bankClient
        .from("chat_sessions")
        .update({
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
        })
        .eq("id", selectedSession.id);
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageText);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const closeSession = async (sessionId: string) => {
    if (!selectedSession?.bank_key) return;

    try {
      const bankConfig = BANKS[selectedSession.bank_key];
      const bankClient = createClient(bankConfig.url, bankConfig.anonKey);

      await bankClient
        .from("chat_sessions")
        .update({ status: "closed" })
        .eq("id", sessionId);

      toast({
        title: "Session Closed",
        description: "Chat session has been closed",
      });

      fetchSessions();

      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setMessages([]);
        lastMessageCountRef.current = 0;
      }
    } catch (error) {
      console.error("Error closing session:", error);
    }
  };

  const deleteSession = async (sessionId: string, bankKey: string) => {
    if (!confirm("Are you sure you want to permanently delete this chat session? This cannot be undone.")) {
      return;
    }

    try {
      const bankConfig = BANKS[bankKey];
      const bankClient = createClient(bankConfig.url, bankConfig.anonKey);

      console.log(`🗑️ Deleting session ${sessionId} from ${bankConfig.name}...`);

      // First delete all messages
      const { error: msgError } = await bankClient
        .from("chat_messages")
        .delete()
        .eq("session_id", sessionId);

      if (msgError) throw msgError;

      // Then delete the session
      const { error: sessionError } = await bankClient
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId);

      if (sessionError) throw sessionError;

      console.log("✅ Session deleted successfully");

      toast({
        title: "Session Deleted",
        description: "Chat session and all messages have been permanently deleted",
      });

      fetchSessions();

      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setMessages([]);
        lastMessageCountRef.current = 0;
      }
    } catch (error) {
      console.error("❌ Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const bulkDeleteSessions = async () => {
    if (selectedSessionIds.size === 0) {
      toast({
        title: "No Sessions Selected",
        description: "Please select at least one session to delete",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete ${selectedSessionIds.size} chat session(s)? This cannot be undone.`)) {
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const sessionId of Array.from(selectedSessionIds)) {
      const session = sessions.find(s => s.id === sessionId);
      if (!session?.bank_key) continue;

      try {
        const bankConfig = BANKS[session.bank_key];
        const bankClient = createClient(bankConfig.url, bankConfig.anonKey);

        await bankClient.from("chat_messages").delete().eq("session_id", sessionId);
        await bankClient.from("chat_sessions").delete().eq("id", sessionId);
        successCount++;
      } catch (error) {
        console.error(`Failed to delete session ${sessionId}:`, error);
        failCount++;
      }
    }

    toast({
      title: `Deleted ${successCount} session(s)`,
      description: failCount > 0 ? `${failCount} session(s) failed to delete` : "All selected sessions deleted successfully",
      variant: failCount > 0 ? "destructive" : "default",
    });

    setSelectedSessionIds(new Set());
    fetchSessions();

    if (selectedSession && selectedSessionIds.has(selectedSession.id)) {
      setSelectedSession(null);
      setMessages([]);
      lastMessageCountRef.current = 0;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSessions();
    if (selectedSession) {
      await fetchMessages(selectedSession.id);
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const toggleSelectAll = (closedSessions: ChatSession[]) => {
    if (selectedSessionIds.size === closedSessions.length) {
      setSelectedSessionIds(new Set());
    } else {
      setSelectedSessionIds(new Set(closedSessions.map(s => s.id)));
    }
  };

  const toggleSelectSession = (sessionId: string) => {
    const newSelected = new Set(selectedSessionIds);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedSessionIds(newSelected);
  };

  useEffect(() => {
    if (isOpen) {
      console.log("🚀 Admin chat opened, starting session polling");
      fetchSessions();

      sessionsPollingRef.current = setInterval(() => {
        fetchSessions();
      }, 3000);

      return () => {
        console.log("🛑 Stopping session polling");
        if (sessionsPollingRef.current) {
          clearInterval(sessionsPollingRef.current);
        }
      };
    } else {
      if (sessionsPollingRef.current) {
        clearInterval(sessionsPollingRef.current);
        sessionsPollingRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedSession) {
      console.log(`📨 Selected session: ${selectedSession.client_name}`);
      setMessages([]);
      lastMessageCountRef.current = 0;
      fetchMessages(selectedSession.id);

      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(selectedSession.id);
      }, 3000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setMessages([]);
      lastMessageCountRef.current = 0;
    }
  }, [selectedSession, fetchMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeSessions = sessions.filter((s) => s.status === "active");
  const closedSessions = sessions.filter((s) => s.status === "closed");
  const totalUnread = activeSessions.reduce((sum, s) => sum + (s.unread_count || 0), 0);

  console.log(`🔢 Active: ${activeSessions.length}, Closed: ${closedSessions.length}, Total Unread: ${totalUnread}`);

  // Don't show the chat if there's no authenticated user
  if (!user) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#F26623] hover:bg-[#E55A1F] text-white shadow-lg flex items-center justify-center z-50 transition-all hover:scale-110"
        aria-label="Open admin chat"
      >
        <MessageCircle className="w-6 h-6" />
        {totalUnread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center p-0">
            {totalUnread}
          </Badge>
        )}
      </button>
    );
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-6 right-6 w-80 z-50 shadow-xl">
        <div className="p-3 bg-[#F26623] text-white flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Admin Chat ({activeSessions.length})</span>
            {totalUnread > 0 && (
              <Badge className="bg-red-500 text-white">{totalUnread}</Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="h-8 w-8 p-0 text-white hover:bg-[#E55A1F]"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-white hover:bg-[#E55A1F]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[900px] h-[600px] max-h-[600px] z-50 flex flex-col shadow-xl overflow-hidden">
      <div className="p-4 bg-[#F26623] text-white flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Admin Live Chat</span>
          <Badge variant="secondary" className="bg-white text-[#F26623]">
            {activeSessions.length} active
          </Badge>
          {totalUnread > 0 && (
            <Badge className="bg-red-500 text-white">{totalUnread} unread</Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-3 text-white hover:bg-[#E55A1F]"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-8 w-8 p-0 text-white hover:bg-[#E55A1F]"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0 text-white hover:bg-[#E55A1F]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="w-72 border-r flex flex-col bg-gray-50 overflow-hidden">
          <Tabs defaultValue="active" className="flex flex-col h-full">
            <div className="p-3 border-b bg-gray-50 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="text-xs">
                  Active ({activeSessions.length})
                </TabsTrigger>
                <TabsTrigger value="closed" className="text-xs">
                  Closed ({closedSessions.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="active" className="flex-1 m-0 overflow-auto">
              {activeSessions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No active chats
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedSession?.id === session.id
                            ? "bg-[#F26623] text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-sm truncate">
                              {session.client_name || "Anonymous"}
                            </span>
                          </div>
                          {session.unread_count! > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {session.unread_count}
                            </Badge>
                          )}
                        </div>
                        <div className={`text-xs mb-1 ${
                          selectedSession?.id === session.id
                            ? "text-white/90 font-medium"
                            : "text-[#F26623] font-semibold"
                        }`}>
                          🏦 {session.bank_name}
                        </div>
                        {session.client_email && (
                          <div className={`text-xs truncate ${
                            selectedSession?.id === session.id
                              ? "text-white/80"
                              : "text-gray-500"
                          }`}>
                            {session.client_email}
                          </div>
                        )}
                        <div className={`text-xs mt-1 ${
                          selectedSession?.id === session.id
                            ? "text-white/70"
                            : "text-gray-400"
                        }`}>
                          {formatTime(session.last_message_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </TabsContent>

            <TabsContent value="closed" className="flex-1 m-0 flex flex-col overflow-auto">
              {closedSessions.length > 0 && (
                <div className="p-2 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedSessionIds.size === closedSessions.length && closedSessions.length > 0}
                      onCheckedChange={() => toggleSelectAll(closedSessions)}
                      id="select-all"
                    />
                    <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                      Select All ({selectedSessionIds.size}/{closedSessions.length})
                    </label>
                  </div>
                  {selectedSessionIds.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={bulkDeleteSessions}
                      className="h-8"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Selected ({selectedSessionIds.size})
                    </Button>
                  )}
                </div>
              )}
              {closedSessions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No closed chats
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {closedSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 rounded-lg transition-colors ${
                          selectedSession?.id === session.id
                            ? "bg-gray-300"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <Checkbox
                              checked={selectedSessionIds.has(session.id)}
                              onCheckedChange={() => toggleSelectSession(session.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <CheckCircle
                              className="w-4 h-4 flex-shrink-0 text-gray-500 cursor-pointer"
                              onClick={() => setSelectedSession(session)}
                            />
                            <span
                              className="font-medium text-sm truncate text-gray-700 cursor-pointer"
                              onClick={() => setSelectedSession(session)}
                            >
                              {session.client_name || "Anonymous"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.id, session.bank_key!);
                              }}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                            <Badge variant="secondary" className="text-xs">
                              Closed
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs mb-1 text-[#F26623] font-semibold">
                          🏦 {session.bank_name}
                        </div>
                        {session.client_email && (
                          <div className="text-xs truncate text-gray-500">
                            {session.client_email}
                          </div>
                        )}
                        <div className="text-xs mt-1 text-gray-400">
                          {formatTime(session.last_message_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a chat to view messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {selectedSession.client_name || "Anonymous"}
                    </h3>
                    {selectedSession.status === "closed" && (
                      <Badge variant="secondary" className="text-xs">
                        Closed
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#F26623] font-semibold mt-1">
                    🏦 {selectedSession.bank_name}
                  </p>
                  {selectedSession.client_email && (
                    <p className="text-xs text-gray-500">
                      {selectedSession.client_email}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedSession.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => closeSession(selectedSession.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Close Chat
                    </Button>
                  )}
                  {selectedSession.status === "closed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSession(selectedSession.id, selectedSession.bank_key!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Permanently
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 bg-gray-50 overflow-auto">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_type === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender_type === "admin"
                            ? "bg-[#F26623] text-white rounded-br-sm"
                            : "bg-white text-gray-900 border rounded-bl-sm"
                        }`}
                      >
                        <div className={`text-xs mb-1 ${
                          msg.sender_type === "admin"
                            ? "text-white/70"
                            : "text-gray-500"
                        }`}>
                          {msg.sender_type === "admin" ? "You" : msg.sender_name || "Client"}
                        </div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </div>
                        <div className={`text-xs mt-2 ${
                          msg.sender_type === "admin"
                            ? "text-white/60"
                            : "text-gray-400"
                        }`}>
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {selectedSession.status === "active" && (
                <div className="p-4 border-t bg-white flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-[#F26623] hover:bg-[#E55A1F]"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
