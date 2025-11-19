# Live Chat Hierarchy Implementation

## Overview
The live chat system now filters chat sessions based on the user hierarchy. This ensures that managers and superior managers only see chat sessions from users they have access to.

## Hierarchy Rules

### 1. Pure Admin (is_admin = true, is_manager = false, is_superiormanager = false)
- **Access Level**: ALL users
- **Behavior**: Can see all chat sessions from all users across all banks
- **Implementation**: Returns special marker `['*']` to bypass filtering

### 2. Manager (is_manager = true)
- **Access Level**: Assigned users only
- **Behavior**: Can only see chat sessions from users directly assigned to them
- **Implementation**:
  - Queries `user_hierarchy` table where `superior_id = manager_id`
  - Filters to `relationship_type = 'manager_to_user'`
  - Returns array of `subordinate_id` values

### 3. Superior Manager (is_superiormanager = true)
- **Access Level**: Assigned managers AND their users
- **Behavior**:
  - Can see chat sessions from managers directly assigned to them
  - Can see chat sessions from all users assigned to those managers
- **Implementation**:
  - Step 1: Queries `user_hierarchy` for direct subordinates (both managers and users)
  - Step 2: Identifies managers with `relationship_type = 'superior_manager_to_manager'`
  - Step 3: Queries `user_hierarchy` again for users under those managers
  - Returns combined array of all accessible user IDs

## Database Schema

### user_hierarchy Table
```sql
CREATE TABLE public.user_hierarchy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  superior_id uuid NOT NULL,           -- Manager/Superior Manager ID
  subordinate_id uuid NOT NULL,        -- User/Manager ID being managed
  relationship_type text NOT NULL,     -- 'manager_to_user' or 'superior_manager_to_manager'
  created_at timestamptz DEFAULT now(),
  created_by uuid,
  UNIQUE(superior_id, subordinate_id)
);
```

### chat_sessions Table
```sql
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY,
  client_name text,
  client_email text,
  client_user_id uuid,    -- References users.id (user who created the chat)
  bank_key text,          -- Which bank: 'digitalchain', 'cayman', 'lithuanian'
  status text,            -- 'active', 'closed', 'waiting'
  admin_id text,
  last_message_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);
```

## Implementation Files

### 1. `/lib/hierarchy-utils.ts`
Contains the `getAccessibleUserIds()` function that:
- Takes user ID and role flags
- Queries the hierarchy table
- Returns list of accessible user IDs or `['*']` for admins

### 2. `/components/admin-live-chat-simple.tsx`
Updated to:
- Import `useAuth` hook to get current user info
- Call `getAccessibleUserIds()` for each bank
- Filter chat sessions based on `client_user_id` field
- Only show sessions where user has access

## How It Works

1. **User opens live chat**: Component gets current user from AuthContext
2. **Fetch sessions**: For each bank:
   - Calls `getAccessibleUserIds(userId, isAdmin, isManager, isSuperiorManager, bankClient)`
   - If result is `['*']` → fetch ALL sessions (admin access)
   - If result is array of IDs → fetch sessions WHERE `client_user_id IN (accessible_ids)`
   - If result is empty array → skip this bank (no access)
3. **Display filtered results**: Only sessions user has access to are shown

## Example Scenarios

### Scenario 1: Pure Admin
- User: `admin@example.com` (is_admin=true, is_manager=false)
- Result: Sees ALL chat sessions from all users in all banks

### Scenario 2: Manager
- User: `manager@example.com` (is_manager=true)
- Hierarchy:
  ```
  manager@example.com (superior_id)
    ├── user1@example.com (subordinate_id, manager_to_user)
    ├── user2@example.com (subordinate_id, manager_to_user)
    └── user3@example.com (subordinate_id, manager_to_user)
  ```
- Result: Only sees chat sessions from user1, user2, and user3

### Scenario 3: Superior Manager
- User: `superior@example.com` (is_superiormanager=true)
- Hierarchy:
  ```
  superior@example.com (superior_id)
    ├── manager1@example.com (subordinate_id, superior_manager_to_manager)
    │   ├── user1@example.com (manager_to_user)
    │   └── user2@example.com (manager_to_user)
    └── manager2@example.com (subordinate_id, superior_manager_to_manager)
        ├── user3@example.com (manager_to_user)
        └── user4@example.com (manager_to_user)
  ```
- Result: Sees chat sessions from:
  - manager1@example.com (direct subordinate)
  - manager2@example.com (direct subordinate)
  - user1, user2, user3, user4 (users under the managers)

## Testing

To test the hierarchy filtering:

1. Create test users with different roles
2. Set up hierarchy relationships in `user_hierarchy` table
3. Create chat sessions with different `client_user_id` values
4. Log in as different users (admin, manager, superior manager)
5. Verify that each user only sees appropriate chat sessions

## Debugging

The implementation includes extensive console logging:
- `🏦` Bank being queried
- `👤` Current user info
- `🔍` Hierarchy queries
- `➕` Users being added to accessible list
- `🔑` Final list of accessible user IDs
- `✅` Sessions found and filtered

Check browser console for detailed execution flow.
