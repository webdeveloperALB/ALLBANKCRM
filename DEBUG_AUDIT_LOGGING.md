# Debug Audit Logging - Step by Step

The audit_logs table exists and works correctly. Let's debug why logs aren't being created when you make changes.

## Quick Test

### Step 1: Open Browser Console
1. Press F12 or right-click → Inspect → Console tab
2. Clear the console (trash icon)
3. Keep it open

### Step 2: Make a User Change
1. Go to `/admin`
2. Click on **User Management** tab
3. Find a user from Digital Chain Bank
4. Click **View** button
5. Click **Edit User** button (pencil icon in top right)
6. Change something simple (like the first name)
7. Click **Save Changes**

### Step 3: Check Console Output

**Look for these exact messages:**

✅ **If logging works, you'll see:**
```
[API] Logging audit entry for user update
[Audit Log] Attempting to log: {bankKey: "digitalchain", action: "UPDATE", ...}
[Audit Log] Successfully logged audit entry
[API] Audit entry logged
```

❌ **If you see this:**
```
[API] No adminEmail provided, skipping audit log
```
**Problem:** Your admin user email isn't being passed. Check that you're logged in.

❌ **If you see this:**
```
[Audit Log] Failed to log audit entry: 500 ...
```
**Problem:** Edge function error. Check Supabase function logs.

❌ **If you see this:**
```
[Audit Log] Failed to log audit entry: 400 ...
```
**Problem:** Bad request. Check that audit_logs table exists in the correct bank.

❌ **If you see nothing:**
**Problem:** The audit logging code isn't running. The component might not be passing adminEmail.

## Verify Table Exists in All Banks

Run this query in each bank's SQL editor:

```sql
-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_name = 'audit_logs'
);

-- If true, check structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;
```

## Manual Test of Edge Function

Test the edge function directly using this curl command (replace YOUR_SUPABASE_URL and YOUR_ANON_KEY):

```bash
curl -X POST 'YOUR_SUPABASE_URL/functions/v1/audit-log' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "bankKey": "digitalchain",
    "logEntry": {
      "user_email": "test@example.com",
      "action": "UPDATE",
      "table_name": "users",
      "record_id": "test-123",
      "changes_summary": "Manual test",
      "timestamp": "2025-11-05T10:00:00.000Z",
      "bank_origin": "Digital Chain Bank"
    }
  }'
```

**Expected response:**
```json
{"success": true}
```

## Check Edge Function Logs

1. Go to Supabase Dashboard
2. Click **Edge Functions** in sidebar
3. Click on **audit-log** function
4. Click **Logs** tab
5. Look for any error messages

## Common Issues & Fixes

### Issue 1: "adminEmail is undefined"

**Check:**
```javascript
// In browser console while on /admin page
console.log('Current user:', JSON.parse(localStorage.getItem('supabase.auth.token')));
```

**Fix:** Make sure you're logged in and your user account has an email address.

### Issue 2: Edge function returns 400/500

**Check edge function logs in Supabase dashboard**

**Common causes:**
- Table doesn't exist in the bank you're trying to log to
- Bank credentials in edge function are incorrect
- RLS policy blocking insert

**Fix:** Re-create audit_logs table in that specific bank:
```sql
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

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT TO authenticated
  USING (true);
```

### Issue 3: Logs created but not visible in UI

**Check:** Are you logged in as a TRUE admin?
- `is_admin` = true
- `is_manager` = false
- `is_superiormanager` = false

Only true admins can see the "Audit Logs" tab.

**Verify your user:**
```sql
-- Run in the bank where your user account is
SELECT email, is_admin, is_manager, is_superiormanager
FROM users
WHERE email = 'your-email@example.com';
```

**Fix:** Update your user to be a true admin:
```sql
UPDATE users
SET is_admin = true, is_manager = false, is_superiormanager = false
WHERE email = 'your-email@example.com';
```

### Issue 4: Console shows success but no records in database

**Check the correct bank:**

The logs are stored in the SAME bank where the user exists, not in Digital Chain Bank.

If you modified a user in Cayman Bank, check the audit_logs table in Cayman Bank, not Digital Chain.

**Verify:**
```sql
-- Run this in each bank's SQL editor
SELECT COUNT(*), bank_origin
FROM audit_logs
GROUP BY bank_origin;
```

## Quick Verification Script

Run this in the bank's SQL editor to see if logs are being created:

```sql
-- See most recent logs
SELECT
  timestamp,
  user_email,
  action,
  table_name,
  changes_summary
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 10;

-- If empty, manually insert a test record
INSERT INTO audit_logs (user_email, action, table_name, record_id, changes_summary, bank_origin)
VALUES ('test@example.com', 'UPDATE', 'test', 'test-123', 'Manual test record', 'Digital Chain Bank');

-- Now check again
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 5;
```

## Still Not Working?

Share the console output when you:
1. Click Edit User
2. Make a change
3. Click Save

Look specifically for:
- Any messages starting with `[API]`
- Any messages starting with `[Audit Log]`
- Any error messages (in red)

The console will tell us exactly where the problem is!
