# Live Chat System Documentation

## Overview

A complete WhatsApp-style real-time chat system with two components:
1. **Admin Floating Chat** (`live-chat-float.tsx`) - In the admin panel
2. **Client Chat Dialog** (`live-chat-client.tsx`) - For the client dashboard

## Architecture

### Database Tables

#### `chat_sessions`
- `id` (uuid) - Primary key
- `client_name` (text) - Client's name
- `client_email` (text) - Client's email
- `status` (text) - 'active', 'closed', or 'waiting'
- `created_at` (timestamptz) - When session started
- `updated_at` (timestamptz) - Last update
- `last_message_at` (timestamptz) - Last message timestamp
- `admin_id` (text) - Admin handling the chat
- `client_user_id` (uuid) - Optional user ID
- `bank_key` (text) - Optional bank identifier

#### `chat_messages`
- `id` (uuid) - Primary key
- `session_id` (uuid) - Foreign key to chat_sessions
- `sender_type` (text) - 'client' or 'admin'
- `sender_name` (text) - Name of sender
- `message` (text) - Message content
- `created_at` (timestamptz) - When message was sent
- `read_by_admin` (boolean) - Admin read status
- `read_by_client` (boolean) - Client read status

**Note**: RLS is disabled on both tables for simplified real-time functionality.

## Admin Component (`live-chat-float.tsx`)

### Features
- ✅ Floating chat button at bottom-right with unread count badge
- ✅ Minimizable/expandable chat window
- ✅ Session list view (WhatsApp-style)
- ✅ Real-time new session notifications
- ✅ Real-time message delivery
- ✅ Unread message counts per session
- ✅ Auto-sorting sessions by most recent activity
- ✅ Close session functionality
- ✅ Read receipts (double checkmarks)

### Usage
```tsx
import LiveChatFloat from '@/components/live-chat-float';

// In your admin page layout
<LiveChatFloat />
```

### Real-Time Subscriptions
1. **Session Changes** - Listens for new sessions and updates
2. **All Messages** - Tracks unread counts across all sessions
3. **Selected Session Messages** - Real-time messages for active chat

### UI States
1. **Closed** - Floating button with badge
2. **Minimized** - Compact bar at bottom-right
3. **Open** - Full chat window (800px x 600px)

## Client Component (`live-chat-client.tsx`)

### Features
- ✅ Dialog-based chat interface
- ✅ Name and email capture before starting chat
- ✅ Real-time message delivery
- ✅ Session persistence (localStorage)
- ✅ Detects when admin closes session
- ✅ Auto-reconnect to existing sessions
- ✅ Minimizable window
- ✅ Automatic scroll to new messages

### Usage
```tsx
import LiveChatClient from '@/components/live-chat-client';

const [isChatOpen, setIsChatOpen] = useState(false);

<LiveChatClient
  isOpen={isChatOpen}
  onClose={() => setIsChatOpen(false)}
/>

// Open chat button
<Button onClick={() => setIsChatOpen(true)}>
  Chat with Support
</Button>
```

### Real-Time Subscriptions
1. **Message Updates** - Listens for new messages in current session
2. **Session Status** - Detects when admin closes the chat

### Session Management
- Sessions are saved in `localStorage` with key `chat_session`
- Automatically reconnects on page reload
- Clears localStorage when session is closed
- Shows notification if session was closed by admin

## How It Works Together

### 1. Client Starts Chat
```
Client: Enters name + email → Click "Start Chat"
↓
Database: New row in chat_sessions + welcome message in chat_messages
↓
Admin: Real-time notification "New Chat Session"
```

### 2. Real-Time Messaging
```
Client sends message
↓
chat_messages table INSERT
↓
Admin receives via real-time subscription
↓
Admin reads = auto-update read_by_admin to true
↓
Admin replies
↓
Client receives via real-time subscription
↓
Client reads = auto-update read_by_client to true
```

### 3. Session Closure
```
Admin: Clicks "Close Session"
↓
chat_sessions.status = 'closed'
↓
Client: Real-time update detects closure
↓
Client: Shows "Session Closed" message
↓
Client: Must start new chat to continue
```

## Key Implementation Details

### Unique Channel Names
To avoid conflicts, each subscription uses unique channel names:
- Admin: `admin_sessions_float`, `admin_all_messages_float`, `admin_messages_float:{sessionId}`
- Client: `client_messages_{sessionId}`, `client_session_{sessionId}`

### Read Receipts
- **Admin messages**: Show double checkmark when `read_by_client = true`
- **Client messages**: Automatically marked as read when admin views them
- **Unread counts**: Calculated by counting messages where `sender_type='client' AND read_by_admin=false`

### Scroll Behavior
Both components auto-scroll to bottom when:
- New message arrives
- Component is maximized
- Messages are loaded

### Message Deduplication
Both components check if message already exists before adding to prevent duplicates:
```typescript
setMessages(prev => {
  if (prev.find(m => m.id === newMsg.id)) return prev;
  return [...prev, newMsg];
});
```

## Testing the System

### Test Scenario 1: New Chat
1. Open client dashboard → Click chat button
2. Enter name and email → Start chat
3. Admin panel should show notification
4. Admin selects session → Sees welcome message

### Test Scenario 2: Bi-directional Messaging
1. Client sends message
2. Admin receives instantly (no refresh needed)
3. Admin replies
4. Client receives instantly
5. Verify read receipts appear

### Test Scenario 3: Session Closure
1. Admin closes session
2. Client should see "Session Closed" notification
3. Client can start new chat
4. Old session should show status="closed" in admin

### Test Scenario 4: Session Persistence
1. Client starts chat
2. Client refreshes page
3. Chat should reconnect automatically
4. Previous messages should load

## Common Issues & Solutions

### Issue: Messages Not Appearing
**Solution**: Check Supabase real-time is enabled in project settings

### Issue: Duplicate Messages
**Solution**: Ensure channel names are unique and cleanup is called properly

### Issue: Session Not Persisting
**Solution**: Check browser localStorage is enabled and not full

### Issue: Unread Counts Wrong
**Solution**: Verify `read_by_admin` is being updated when admin views messages

## Customization

### Change Colors
Both components use `#F26623` (orange) as primary color. Search and replace to customize.

### Add Typing Indicators
Add a `is_typing` field to `chat_sessions` and subscribe to updates.

### Add File Attachments
1. Add `attachment_url` column to `chat_messages`
2. Use Supabase Storage for file uploads
3. Display attachments in message bubbles

### Add Sound Notifications
```typescript
// In admin component
const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play();
};

// Call when new message arrives
if (newMsg.sender_type === "client") {
  playNotificationSound();
}
```

## Performance Considerations

- **Subscription Cleanup**: Both components properly clean up subscriptions on unmount
- **Message Pagination**: Consider implementing pagination if sessions have >100 messages
- **Session Archiving**: Consider archiving old closed sessions to keep queries fast
- **Index Optimization**: Ensure indexes on `session_id` and `created_at` columns

## Security Notes

- RLS is currently **disabled** for simplicity
- Consider enabling RLS with proper policies for production
- Validate client input before inserting messages
- Implement rate limiting to prevent spam
- Consider adding profanity filter for client messages
