/*
  # Create Live Chat System

  1. New Tables
    - `chat_sessions`
      - `id` (uuid, primary key)
      - `client_name` (text)
      - `client_email` (text)
      - `status` (text) - active/closed/waiting
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `admin_id` (text)
      - `last_message_at` (timestamptz)
      - `client_user_id` (uuid) - stores user id from bank schemas
      - `bank_key` (text) - identifies which bank the user belongs to
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to chat_sessions)
      - `sender_type` (text) - client/admin
      - `sender_name` (text)
      - `message` (text)
      - `created_at` (timestamptz)
      - `read_by_admin` (boolean)
      - `read_by_client` (boolean)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Add indexes for performance

  3. Triggers
    - Auto-update timestamp trigger for chat_sessions
*/

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_name text NULL,
  client_email text NULL,
  status text NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  admin_id text NULL,
  last_message_at timestamp with time zone NULL DEFAULT now(),
  client_user_id uuid NULL,
  bank_key text NULL,
  CONSTRAINT chat_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT chat_sessions_status_check CHECK (
    status = ANY (ARRAY['active'::text, 'closed'::text, 'waiting'::text])
  )
);

-- Create indexes for chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_client_user_id ON public.chat_sessions USING btree (client_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_bank_key ON public.chat_sessions USING btree (bank_key);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message_at ON public.chat_sessions USING btree (last_message_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON public.chat_sessions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON public.chat_sessions USING btree (created_at DESC);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NULL,
  sender_type text NOT NULL,
  sender_name text NULL,
  message text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  read_by_admin boolean NULL DEFAULT false,
  read_by_client boolean NULL DEFAULT false,
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE,
  CONSTRAINT chat_messages_sender_type_check CHECK (
    sender_type = ANY (ARRAY['client'::text, 'admin'::text])
  )
);

-- Create indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_type ON public.chat_messages USING btree (sender_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read_by_admin ON public.chat_messages USING btree (read_by_admin);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages USING btree (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages USING btree (created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
CREATE POLICY "Authenticated users can view all chat sessions"
  ON public.chat_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create chat sessions"
  ON public.chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chat sessions"
  ON public.chat_sessions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for chat_messages
CREATE POLICY "Authenticated users can view all chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chat messages"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updating chat_sessions timestamp
DROP TRIGGER IF EXISTS update_chat_session_timestamp_trigger ON public.chat_sessions;
CREATE TRIGGER update_chat_session_timestamp_trigger
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_session_timestamp();
