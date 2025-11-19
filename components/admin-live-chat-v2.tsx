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
  Minimize2,
  Maximize2,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

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

export default function AdminLiveChatV2() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const loadSessions = async () => {
    console.log("🔄 Loading sessions...");
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("last_message_at", { ascending: false });

      if (error) {
        console.error("❌ Error loading sessions:", error);
        throw error;
      }

      console.log("✅ Loaded sessions:", data);
      setSessions(data || []);

      await loadUnreadCounts();
    } catch (error) {
      console.error("Failed to load sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
    }
  };

  const loadUnreadCounts = async () => {
    try {
      const counts: Record<string, number> = {};

      for (const session of sessions) {
        const { count } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("session_id", session.id)
          .eq("sender_type", "client")
          .eq("read_by_admin", false);

        if (count) {
          counts[session.id] = count;
        }
      }

      setUnreadCounts(counts);
    } catch (error) {
      console.error("Failed to load unread counts:", error);
    }
  };

  const loadMessages = async (sessionId: string) => {
    console.log("📨 Loading messages for session:", sessionId);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      console.log("✅ Loaded messages:", data?.length || 0);
      setMessages(data || []);
      scrollToBottom();

      const unreadMessages = data?.filter(
        (m) => m.sender_type === "client" && !m.read_by_admin
      );

      if (unreadMessages && unreadMessages.length > 0) {
        for (const msg of unreadMessages) {
          await supabase
            .from("chat_messages")
            .update({ read_by_admin: true })
            .eq("id", msg.id);
        }

        setUnreadCounts((prev) => ({
          ...prev,
          [sessionId]: 0,
        }));
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const messageData = {
        session_id: selectedSession.id,
        sender_type: "admin" as const,
        sender_name: "Support Agent",
        message: messageText,
        read_by_admin: true,
        read_by_client: false,
      };

      const { data, error } = await supabase
        .from("chat_messages")
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data]);
      scrollToBottom();

      await supabase
        .from("chat_sessions")
        .update({
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
        })
        .eq("id", selectedSession.id);

      await loadSessions();
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(messageText);
      toast({
        title: "Error",
        description: "Failed to send message",
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

      toast({
        title: "Session Closed",
        description: "Chat session has been closed",
      });

      await loadSessions();

      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to close session:", error);
      toast({
        title: "Error",
        description: "Failed to close session",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log("🚀 Dialog opened, loading data...");
      loadSessions();

      const channel = supabase
        .channel("admin_all_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chat_sessions",
          },
          (payload) => {
            console.log("🔔 Session change:", payload);
            loadSessions();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chat_messages",
          },
          (payload) => {
            console.log("💬 Message change:", payload);
            loadSessions();

            if (selectedSession && payload.new && (payload.new as any).session_id === selectedSession.id) {
              loadMessages(selectedSession.id);
            }
          }
        )
        .subscribe((status) => {
          console.log("🔌 Channel status:", status);
        });

      return () => {
        console.log("🔌 Cleaning up channel");
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, selectedSession?.id]);

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id);
    }
  }, [selectedSession?.id]);

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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#F26623] hover:bg-[#E55A1F] text-white shadow-lg flex items-center justify-center z-50 transition-all hover:scale-110"
        aria-label="Open admin chat"
      >
        <MessageCircle className="w-6 h-6" />
        {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
          <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center p-0">
            {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
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
            <span className="font-medium">Admin Chat ({sessions.length})</span>
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
    <Card className="fixed bottom-6 right-6 w-[900px] h-[600px] z-50 flex flex-col shadow-xl">
      <div className="p-4 bg-[#F26623] text-white flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Admin Chat Panel</span>
          <Badge variant="secondary" className="bg-white text-[#F26623]">
            {sessions.length} sessions
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadSessions()}
            className="h-8 px-3 text-white hover:bg-[#E55A1F]"
          >
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

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 border-r flex flex-col">
          <div className="p-3 border-b bg-gray-50">
            <h4 className="font-medium text-sm">Chat Sessions</h4>
          </div>

          <ScrollArea className="flex-1">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No chat sessions
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSession?.id === session.id
                        ? "bg-[#F26623] text-white"
                        : session.status === "closed"
                        ? "bg-gray-100 opacity-60 hover:opacity-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          {session.client_name || "Anonymous"}
                        </span>
                      </div>
                      {unreadCounts[session.id] > 0 && (
                        <Badge className="bg-red-500 text-white">
                          {unreadCounts[session.id]}
                        </Badge>
                      )}
                      {session.status === "closed" && (
                        <Badge variant="outline" className="text-xs">
                          Closed
                        </Badge>
                      )}
                    </div>
                    {session.client_email && (
                      <div className="text-xs mt-1 truncate opacity-75">
                        {session.client_email}
                      </div>
                    )}
                    <div className="text-xs mt-1 opacity-75">
                      {formatTime(session.last_message_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a chat session to view messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {selectedSession.client_name || "Anonymous"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedSession.client_email}
                  </p>
                </div>
                {selectedSession.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => closeSession(selectedSession.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Close Session
                  </Button>
                )}
              </div>

              <ScrollArea className="flex-1 p-4">
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
                            ? "bg-[#F26623] text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="text-xs opacity-75 mb-1">
                          {msg.sender_name || msg.sender_type}
                        </div>
                        <div className="text-sm">{msg.message}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {formatTime(msg.created_at)}
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
                    disabled={selectedSession.status === "closed"}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || selectedSession.status === "closed"}
                    className="bg-[#F26623] hover:bg-[#E55A1F]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {selectedSession.status === "closed" && (
                  <p className="text-xs text-gray-500 mt-2">
                    This chat session is closed
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
