# Audit Logging System

## Overview

A comprehensive audit logging system that tracks all changes across the application. Every transaction, balance update, user modification, and data change is recorded with complete details including who made the change, when, and from where.

## Features

### 1. Complete Change Tracking
- **All CRUD Operations**: CREATE, UPDATE, DELETE actions are logged
- **Before/After Data**: Stores both old and new data for comparison
- **Change Summaries**: Human-readable descriptions of what changed
- **Timestamp**: Exact date and time synchronized with the client's system time

### 2. User Attribution
- **Admin Email**: Records which administrator made the change
- **User ID**: Links to the admin's user account
- **IP Address**: Captures the client's IP address
- **User Agent**: Records browser and device information

### 3. Multi-Bank Support
- Tracks changes across all three banks:
  - Digital Chain Bank
  - Cayman Bank
  - Lithuanian Bank

### 4. Security & Access Control
- **Admin-Only Access**: Only true administrators (is_admin=true AND is_manager=false AND is_superiormanager=false) can view logs
- **Read-Only**: Audit logs cannot be modified or deleted (append-only)
- **RLS Protected**: Row-Level Security policies prevent unauthorized access

## Database Schema

### Table: `audit_logs`

```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY,
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
  timestamp timestamptz NOT NULL,
  bank_origin text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

## Usage

### Accessing Audit Logs

1. **Login as True Administrator**
   - Must have `is_admin = true`
   - Must have `is_manager = false`
   - Must have `is_superiormanager = false`

2. **Navigate to Admin Dashboard**
   - Go to `/admin`

3. **Click "Audit Logs" Tab**
   - Third tab in the navigation (only visible to true admins)

### Viewing Logs

The audit log viewer provides:

- **Search**: Filter by email, summary, or record ID
- **Action Filter**: Filter by CREATE, UPDATE, or DELETE
- **Table Filter**: Filter by specific database tables
- **Bank Filter**: Filter by bank origin
- **Pagination**: Browse through logs 50 at a time
- **Detail View**: Click eye icon to see complete log details

### Log Details

Each log entry shows:

- **Timestamp**: Exact date and time of change
- **Admin Email**: Who made the change
- **Action**: Type of operation (CREATE/UPDATE/DELETE)
- **Table**: Which database table was affected
- **Bank**: Which bank the change occurred in
- **Changes Summary**: Human-readable description
- **Old Data**: Previous values (for UPDATE/DELETE)
- **New Data**: New values (for CREATE/UPDATE)
- **IP Address**: Client IP address
- **User Agent**: Browser/device information

## Implementation

### For Developers: Adding Audit Logging to New Features

#### 1. Import the Audit Logger

```typescript
import { logAudit, generateChangesSummary, getCurrentTimestamp } from '@/lib/audit-logger';
import { useAuth } from '@/lib/auth-context';
```

#### 2. Get Current User Email

```typescript
const { user: currentUser } = useAuth();
```

#### 3. Store Old Data (for UPDATE operations)

```typescript
const oldData = {
  field1: originalValue1,
  field2: originalValue2,
  // ... all fields
};
```

#### 4. Call API with Audit Information

```typescript
const response = await fetch('/api/your-endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // Your normal data
    bankKey: bankKey,
    recordId: recordId,
    updates: updates,

    // Audit data
    adminEmail: currentUser?.email,
    oldData: oldData // for UPDATE operations
  })
});
```

#### 5. In API Route: Log the Audit Entry

```typescript
import { logAudit, generateChangesSummary, getCurrentTimestamp } from '@/lib/audit-logger';

// After successful operation
if (adminEmail) {
  await logAudit(bankKey, {
    user_email: adminEmail,
    action: 'UPDATE', // or 'CREATE' or 'DELETE'
    table_name: 'users', // name of the table
    record_id: recordId,
    old_data: oldData,
    new_data: newData,
    changes_summary: generateChangesSummary('UPDATE', 'users', oldData, newData),
    ip_address: request.headers.get('x-forwarded-for') || undefined,
    user_agent: request.headers.get('user-agent') || undefined,
    timestamp: getCurrentTimestamp(),
    bank_origin: bankOriginName
  });
}
```

## Examples

### Example 1: User Update

When an admin updates a user's email from "old@example.com" to "new@example.com":

```json
{
  "user_email": "admin@bank.com",
  "action": "UPDATE",
  "table_name": "users",
  "record_id": "user-uuid-123",
  "old_data": {
    "email": "old@example.com",
    "full_name": "John Doe"
  },
  "new_data": {
    "email": "new@example.com",
    "full_name": "John Doe"
  },
  "changes_summary": "Updated Users: Email: \"old@example.com\" → \"new@example.com\"",
  "timestamp": "2025-11-05T14:30:45.123Z",
  "bank_origin": "Digital Chain Bank"
}
```

### Example 2: Balance Update

When a balance is updated:

```json
{
  "user_email": "admin@bank.com",
  "action": "UPDATE",
  "table_name": "balances",
  "record_id": "balance-uuid-456",
  "old_data": {
    "balance": "1000.00"
  },
  "new_data": {
    "balance": "1500.00"
  },
  "changes_summary": "Updated Balances: Balance: \"1000.00\" → \"1500.00\"",
  "timestamp": "2025-11-05T14:31:22.456Z",
  "bank_origin": "Cayman Bank"
}
```

## Currently Logged Operations

The following operations are currently logged:

- ✅ User updates (email, password, roles, KYC status, etc.)
- 🔄 Additional operations can be easily added using the pattern above

## Best Practices

1. **Always Log After Success**: Only log audit entries after the operation succeeds
2. **Include All Changed Fields**: Log complete old and new data for comparison
3. **Use Descriptive Summaries**: The changes_summary should be human-readable
4. **Capture System Time**: Use getCurrentTimestamp() for consistent timestamps
5. **Never Skip Logging**: All data modifications should be logged without exception

## Security Notes

- Audit logs are **append-only** - they cannot be modified or deleted
- Only **true administrators** can view logs (not managers or superior managers)
- Logs are stored **per bank** in their respective Supabase instances
- All sensitive operations are logged for **compliance and accountability**
- System uses **client-side timestamps** synchronized with the user's device

## Compliance

This audit logging system helps meet compliance requirements for:

- **Data Protection**: Track all personal data access and modifications
- **Financial Regulations**: Complete audit trail of financial transactions
- **Internal Controls**: Monitor administrator actions
- **Incident Response**: Detailed logs for investigating security incidents

## Troubleshooting

### Logs Not Appearing

1. Check that you're logged in as a true admin (not manager/superior manager)
2. Verify the audit-log edge function is deployed
3. Check that adminEmail is being passed to the API route
4. Look for errors in the browser console

### Missing Old Data

- Ensure oldData is captured before making the update
- Verify oldData is included in the API request body

### Timestamp Issues

- Use getCurrentTimestamp() function for consistent formatting
- Timestamps are in ISO 8601 format (e.g., "2025-11-05T14:30:45.123Z")
