"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  X,
  User,
  Clock,
  CheckCheck,
  Minimize2,
  Maximize2,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { RealtimeChannel } from "@supabase/supabase-js";

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
}

export default function AdminLiveChat() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [totalUnread, setTotalUnread] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionChannelRef = useRef<RealtimeChannel | null>(null);
  const messageChannelRef = useRef<RealtimeChannel | null>(null);
  const allMessagesChannelRef = useRef<RealtimeChannel | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    if (isOpen) {
      console.log("🔄 Dialog opened, loading sessions...");
      loadSessions();
      subscribeToNewSessions();
      subscribeToAllMessages();
    }

    return () => {
      cleanup();
    };
  }, [isOpen]);

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id);
      subscribeToSessionMessages(selectedSession.id);
      markSessionAsRead(selectedSession.id);
    }
  }, [selectedSession]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const total = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
    setTotalUnread(total);
  }, [unreadCounts]);

  const cleanup = () => {
    if (sessionChannelRef.current) {
      supabase.removeChannel(sessionChannelRef.current);
    }
    if (messageChannelRef.current) {
      supabase.removeChannel(messageChannelRef.current);
    }
    if (allMessagesChannelRef.current) {
      supabase.removeChannel(allMessagesChannelRef.current);
    }
  };

  const loadSessions = async () => {
    console.log("🔍 Starting loadSessions...");
    try {
      console.log("📡 Fetching from Supabase...");
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("last_message_at", { ascending: false });

      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }

      console.log("📋 Loaded sessions:", data, "Count:", data?.length || 0);
      setSessions(data || []);
      await loadUnreadCounts();
      console.log("✅ loadSessions complete");
    } catch (error) {
      console.error("❌ Error loading sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
    }
  };

  const loadUnreadCounts = async () => {
    try {
      const { data: sessions } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("status", "active");

      if (!sessions) return;

      const counts: Record<string, number> = {};

      for (const session of sessions) {
        const { count } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("session_id", session.id)
          .eq("sender_type", "client")
          .eq("read_by_admin", false);

        counts[session.id] = count || 0;
      }

      setUnreadCounts(counts);
    } catch (error) {
      console.error("Error loading unread counts:", error);
    }
  };

  const subscribeToNewSessions = () => {
    if (sessionChannelRef.current) {
      supabase.removeChannel(sessionChannelRef.current);
    }

    const channel = supabase
      .channel("admin_chat_sessions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_sessions",
        },
        (payload) => {
          console.log("🔔 New session received:", payload);
          const newSession = payload.new as ChatSession;
          setSessions((prev) => {
            const exists = prev.find(s => s.id === newSession.id);
            if (exists) return prev;
            const updated = [newSession, ...prev].sort(
              (a, b) =>
                new Date(b.last_message_at).getTime() -
                new Date(a.last_message_at).getTime()
            );
            console.log("✅ Added new session to list, total:", updated.length);
            return updated;
          });

          toast({
            title: "New Chat Session",
            description: `${newSession.client_name || "Someone"} started a chat`,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_sessions",
        },
        (payload) => {
          const updatedSession = payload.new as ChatSession;
          setSessions((prev) => {
            const updated = prev
              .map((s) => (s.id === updatedSession.id ? updatedSession : s))
              .sort(
                (a, b) =>
                  new Date(b.last_message_at).getTime() -
                  new Date(a.last_message_at).getTime()
              );
            return updated;
          });

          if (selectedSession && selectedSession.id === updatedSession.id) {
            setSelectedSession(updatedSession);
          }
        }
      )
      .subscribe((status) => {
        console.log("🔌 Session channel status:", status);
      });

    sessionChannelRef.current = channel;
  };

  const subscribeToAllMessages = () => {
    if (allMessagesChannelRef.current) {
      supabase.removeChannel(allMessagesChannelRef.current);
    }

    const channel = supabase
      .channel("admin_all_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          console.log("💬 New message received:", payload);
          const newMsg = payload.new as ChatMessage;

          setSessions((prev) =>
            prev.map(s =>
              s.id === newMsg.session_id
                ? { ...s, last_message_at: newMsg.created_at }
                : s
            ).sort(
              (a, b) =>
                new Date(b.last_message_at).getTime() -
                new Date(a.last_message_at).getTime()
            )
          );

          if (newMsg.sender_type === "client" && !newMsg.read_by_admin) {
            console.log("📊 Incrementing unread for session:", newMsg.session_id);
            setUnreadCounts((prev) => ({
              ...prev,
              [newMsg.session_id]: (prev[newMsg.session_id] || 0) + 1,
            }));

            if (!selectedSession || selectedSession.id !== newMsg.session_id) {
              toast({
                title: "New Message",
                description: "You have a new message from a client",
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("🔌 All messages channel status:", status);
      });

    allMessagesChannelRef.current = channel;
  };

  const subscribeToSessionMessages = (sessionId: string) => {
    if (messageChannelRef.current) {
      supabase.removeChannel(messageChannelRef.current);
    }

    const channel = supabase
      .channel(`admin_messages_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log(`💬 Message for session ${sessionId}:`, payload);
          const newMsg = payload.new as ChatMessage;

          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) {
              console.log("⚠️ Message already exists, skipping");
              return prev;
            }
            console.log("✅ Adding message to view");
            return [...prev, newMsg];
          });

          if (newMsg.sender_type === "client" && !newMsg.read_by_admin) {
            markMessageAsRead(newMsg.id, sessionId);
          }

          scrollToBottom();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
        }
      )
      .subscribe((status) => {
        console.log(`🔌 Message channel for session ${sessionId} status:`, status);
      });

    messageChannelRef.current = channel;
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data || []);

      const unreadMessages = data?.filter(
        (m) => m.sender_type === "client" && !m.read_by_admin
      );

      if (unreadMessages && unreadMessages.length > 0) {
        await supabase
          .from("chat_messages")
          .update({ read_by_admin: true })
          .in(
            "id",
            unreadMessages.map((m) => m.id)
          );
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const markMessageAsRead = async (messageId: string, sessionId: string) => {
    try {
      await supabase
        .from("chat_messages")
        .update({ read_by_admin: true })
        .eq("id", messageId);

      setUnreadCounts((prev) => ({
        ...prev,
        [sessionId]: Math.max((prev[sessionId] || 1) - 1, 0),
      }));
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const markSessionAsRead = async (sessionId: string) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [sessionId]: 0,
    }));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;

    const text = newMessage.trim();
    setNewMessage("");

    try {
      const messageData = {
        session_id: selectedSession.id,
        sender_type: "admin" as const,
        sender_name: "Support Agent",
        message: text,
        read_by_admin: true,
        read_by_client: false,
      };

      await supabase.from("chat_messages").insert(messageData);

      await supabase
        .from("chat_sessions")
        .update({
          last_message_at: new Date().toISOString(),
        })
        .eq("id", selectedSession.id);
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(text);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const closeSession = async (sessionId: string) => {
    try {
      await supabase
        .from("chat_sessions")
        .update({ status: "closed" })
        .eq("id", sessionId);

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }

      toast({
        title: "Session Closed",
        description: "Chat session has been closed.",
      });
    } catch (error) {
      console.error("Error closing session:", error);
      toast({
        title: "Error",
        description: "Failed to close session.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 shadow-lg">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#F26623]" />
              <span className="font-medium">Live Chat</span>
              {totalUnread > 0 && (
                <Badge className="bg-red-500 text-white">{totalUnread}</Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#F26623] hover:bg-[#E55A1F] text-white shadow-lg flex items-center justify-center z-50 transition-all hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
        {totalUnread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
            {totalUnread > 9 ? "9+" : totalUnread}
          </Badge>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-[800px] h-[600px] shadow-2xl flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-[#F26623] text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Live Chat Support</h3>
              <p className="text-xs opacity-90">
                {sessions.filter((s) => s.status === "active").length} active sessions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
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

        <div className="flex flex-1 overflow-hidden">
          <div className="w-72 border-r flex flex-col">
            <div className="p-3 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm">Chat Sessions</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log("🔄 Manual reload triggered");
                    loadSessions();
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Reload
                </Button>
              </div>
              <p className="text-xs text-gray-500">Total: {sessions.length}</p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors relative ${
                        selectedSession?.id === session.id
                          ? "bg-[#F26623] text-white"
                          : session.status === "closed"
                          ? "bg-gray-100 opacity-60"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium text-sm truncate">
                            {session.client_name || "Anonymous"}
                          </span>
                        </div>
                        {unreadCounts[session.id] > 0 && (
                          <Badge
                            className={`ml-2 ${
                              selectedSession?.id === session.id
                                ? "bg-white text-[#F26623]"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {unreadCounts[session.id]}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs opacity-75">
                        <Clock className="w-3 h-3" />
                        {formatTime(session.last_message_at)}
                      </div>
                      {session.client_email && (
                        <div className="text-xs mt-1 truncate opacity-75">
                          {session.client_email}
                        </div>
                      )}
                      {session.status === "closed" && (
                        <Badge
                          variant="outline"
                          className="absolute top-2 right-2 text-xs"
                        >
                          Closed
                        </Badge>
                      )}
                    </div>
                  ))}
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No chat sessions yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 flex flex-col">
            {selectedSession ? (
              <>
                <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {selectedSession.client_name || "Anonymous"}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {selectedSession.client_email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => closeSession(selectedSession.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Close Session
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_type === "admin" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.sender_type === "admin"
                              ? "bg-[#F26623] text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <User className="w-3 h-3" />
                            <span className="text-xs font-medium">
                              {msg.sender_type === "admin"
                                ? "You"
                                : msg.sender_name || "Client"}
                            </span>
                          </div>
                          <div className="text-sm break-words">{msg.message}</div>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                              msg.sender_type === "admin"
                                ? "text-orange-100"
                                : "text-gray-500"
                            }`}
                          >
                            {formatTime(msg.created_at)}
                            {msg.sender_type === "admin" && msg.read_by_client && (
                              <CheckCheck className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t bg-gray-50">
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
                      className="flex-1"
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a chat session to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
