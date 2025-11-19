/*
  # Disable RLS for Chat Tables

  This migration disables Row Level Security on chat tables to allow
  the API routes to work with the anonymous key.

  1. Changes
    - Disable RLS on chat_sessions table
    - Disable RLS on chat_messages table
*/

ALTER TABLE public.chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view all chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Authenticated users can create chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Authenticated users can update chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Authenticated users can view all chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can create chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can update chat messages" ON public.chat_messages;
