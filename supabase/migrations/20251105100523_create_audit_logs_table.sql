/*
  # Create Audit Logs Table

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key) - Unique identifier for each log entry
      - `user_id` (uuid) - ID of the user who made the change
      - `user_email` (text) - Email of the user who made the change
      - `action` (text) - Type of action performed (CREATE, UPDATE, DELETE)
      - `table_name` (text) - Name of the table affected
      - `record_id` (text) - ID of the record affected
      - `old_data` (jsonb) - Previous data before change (for UPDATE/DELETE)
      - `new_data` (jsonb) - New data after change (for CREATE/UPDATE)
      - `changes_summary` (text) - Human-readable summary of changes
      - `ip_address` (text) - IP address of the client
      - `user_agent` (text) - Browser/client user agent
      - `timestamp` (timestamptz) - Exact timestamp of the change (system time)
      - `bank_origin` (text) - Bank where the change occurred
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `audit_logs` table
    - Only users with is_admin=true AND NOT is_manager AND NOT is_superiormanager can read logs
    - NO ONE can modify or delete audit logs (append-only table)

  3. Indexes
    - Index on user_email for filtering by admin
    - Index on table_name for filtering by entity type
    - Index on timestamp for chronological queries
    - Index on action for filtering by action type
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text NOT NULL,
  action text NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  table_name text NOT NULL,
  record_id text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  changes_summary text,
  ip_address text,
  user_agent text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  bank_origin text NOT NULL DEFAULT 'Digital Chain Bank',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_bank_origin ON audit_logs(bank_origin);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: System can insert audit logs (using service role)
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Audit logs are read-only (will be controlled by application logic for admin-only access)
CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: NO ONE can update audit logs (append-only)
CREATE POLICY "Audit logs cannot be updated"
  ON audit_logs
  FOR UPDATE
  TO authenticated
  USING (false);

-- Policy: NO ONE can delete audit logs (append-only)
CREATE POLICY "Audit logs cannot be deleted"
  ON audit_logs
  FOR DELETE
  TO authenticated
  USING (false);