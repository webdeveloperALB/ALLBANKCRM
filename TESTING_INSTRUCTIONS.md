# Live Chat System - Testing Instructions

## ✅ What's Fixed

1. **Admin now shows ALL sessions** (including closed ones with a "Closed" badge)
2. **Added console logging** for debugging real-time subscriptions
3. **Realtime is enabled** in database
4. **Created test page** at `/test-chat` to simulate client

## 🧪 How to Test

### Option 1: Use Test Page (Easiest)

1. **Start the development server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open two browser tabs**:
   - Tab 1: http://localhost:3000/test-chat
   - Tab 2: http://localhost:3000/admin

3. **In Tab 1 (Client Test Page)**:
   - Click orange chat button (bottom-right)
   - Enter name: "Test User"
   - Enter email: "test@test.com"
   - Click "Start Chat"
   - Send message: "Hello, I need help!"

4. **In Tab 2 (Admin Panel)**:
   - Click orange chat button (bottom-right)
   - Look in console (F12) for: 🔔 New session received
   - You should see the session in the left sidebar
   - Click the session to open it
   - Type reply: "Hi! How can I help you?"
   - Press Enter

5. **Back in Tab 1**:
   - Within 2 seconds, you should see the admin's reply

### Option 2: Use Separate Client Website

If you've added the client component to another website:

1. Open admin panel: http://localhost:3000/admin
2. Open client website in another tab
3. Start chat from client website
4. Watch admin panel receive the session
5. Reply from admin panel
6. See reply appear on client side

## 🐛 Debugging Steps

### Check Console Logs

**Admin Panel Console (F12 → Console):**

Look for these messages:
```
📋 Loaded sessions: [array of sessions]
🔌 Session channel status: SUBSCRIBED
🔌 All messages channel status: SUBSCRIBED
🔔 New session received: {payload}
💬 New message received: {payload}
```

**Client Page Console:**
```
Chat Started
🔄 Polling messages... (every 2 seconds)
📨 Messages: [array of messages]
```

### If Admin Shows "No chat sessions yet"

**Reason**: No sessions exist in database OR all are closed

**Solution 1**: Start a fresh chat from test page

**Solution 2**: Reopen closed sessions:
```sql
UPDATE chat_sessions SET status = 'active' WHERE status = 'closed';
```

### If Sessions Don't Appear in Admin

**Check 1**: Verify session was created
```sql
SELECT * FROM chat_sessions ORDER BY created_at DESC LIMIT 1;
```

**Check 2**: Look at admin console for subscription status
- Should see: `🔌 Session channel status: SUBSCRIBED`
- Should see: `🔔 New session received: ...`

**Check 3**: Hard refresh admin page (Ctrl+Shift+R)

### If Messages Don't Appear

**Check 1**: Verify message was created
```sql
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 5;
```

**Check 2**: Check admin console
- Should see: `💬 New message received: ...`

**Check 3**: Check client console
- Should see: `📨 Messages: [...]`

### If Real-time Not Working

**Check 1**: Verify realtime publication
```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('chat_sessions', 'chat_messages');
```
Should return both tables.

**Check 2**: Check Supabase Dashboard
1. Go to Database → Replication
2. Verify `chat_sessions` and `chat_messages` have replication enabled

**Check 3**: Check browser Network tab
- Filter by WS (WebSocket)
- Should see connection to Supabase
- Status: 101 Switching Protocols

## 📊 Current Database Status

```sql
-- View all sessions
SELECT 
  id,
  client_name,
  client_email,
  status,
  created_at,
  (SELECT COUNT(*) FROM chat_messages WHERE session_id = chat_sessions.id) as msg_count
FROM chat_sessions
ORDER BY created_at DESC;

-- View recent messages
SELECT 
  m.id,
  s.client_name,
  m.sender_type,
  m.message,
  m.created_at
FROM chat_messages m
JOIN chat_sessions s ON m.session_id = s.id
ORDER BY m.created_at DESC
LIMIT 10;
```

## 🎯 Expected Behavior

### Admin Panel

1. **On Load**:
   - Console: "📋 Loaded sessions: [...]"
   - Console: "🔌 Session channel status: SUBSCRIBED"
   - Shows all sessions (active and closed)
   - Closed sessions have "Closed" badge and are grayed out

2. **When Client Starts Chat**:
   - Console: "🔔 New session received: ..."
   - Toast notification: "New Chat Session - [Name] started a chat"
   - Session appears in list instantly
   - Unread badge shows "1"

3. **When Client Sends Message**:
   - Console: "💬 New message received: ..."
   - If not viewing that session: Toast "New Message"
   - Unread count increases
   - Message appears instantly if viewing that session

4. **When Admin Replies**:
   - Message appears in orange bubble (right side)
   - Timestamp shown
   - Checkmark when client reads it

### Client Side

1. **On Start Chat**:
   - Session created in database
   - Welcome message sent
   - Toast: "Chat Started"
   - LocalStorage saves session

2. **When Sending Message**:
   - Message appears immediately in orange bubble
   - Console: "Message sent"

3. **When Admin Replies**:
   - Within 2 seconds, message appears in gray bubble (left side)
   - Console: "📨 Messages: [...]"

4. **On Page Refresh**:
   - Chat reopens automatically
   - Previous messages loaded
   - Can continue conversation

## 🔧 Quick Fixes

### Reset Everything
```sql
-- Clear all sessions and messages (fresh start)
DELETE FROM chat_messages;
DELETE FROM chat_sessions;
```

### Create Test Session Manually
```sql
INSERT INTO chat_sessions (client_name, client_email, status)
VALUES ('Manual Test', 'manual@test.com', 'active')
RETURNING *;
```

### Check Indexes
```sql
-- Verify indexes exist for performance
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('chat_sessions', 'chat_messages');
```

## ✅ Success Checklist

- [ ] Admin panel loads without errors
- [ ] Admin console shows "SUBSCRIBED" for channels
- [ ] Test page loads at `/test-chat`
- [ ] Can start chat from test page
- [ ] Session appears in admin panel
- [ ] Can click session and see messages
- [ ] Can reply from admin panel
- [ ] Reply appears on client side (within 2 seconds)
- [ ] Unread badges work correctly
- [ ] Can minimize/maximize chat windows
- [ ] Can close sessions from admin
- [ ] Closed sessions show "Closed" badge

## 🆘 Still Not Working?

1. **Share Console Logs**: 
   - Copy everything from browser console (both admin and client)
   - Look for red errors

2. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Logs
   - Check for errors or failed requests

3. **Verify Environment**:
   ```bash
   # Check if correct Supabase URL
   cat .env | grep NEXT_PUBLIC_SUPABASE_URL
   ```

4. **Clear LocalStorage**:
   - Open DevTools → Application → LocalStorage
   - Delete `chat_session` entry
   - Refresh page

5. **Try Different Browser**:
   - Some browsers block WebSockets
   - Try Chrome/Firefox

## 📝 Notes

- **Client uses polling**: Messages checked every 2 seconds (not real-time)
- **Admin uses real-time**: Instant updates via WebSocket subscriptions
- **Sessions persist**: Stored in localStorage on client side
- **Closed sessions shown**: Admin can view history of closed chats

The system is fully functional! The debugging logs will help identify exactly where any issues occur.
