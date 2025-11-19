/*
  # Enable Realtime for Chat Tables
  
  This migration enables Supabase Realtime replication for the chat tables
  so that both admin and client components can receive real-time updates.
*/

-- Enable realtime for chat_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;