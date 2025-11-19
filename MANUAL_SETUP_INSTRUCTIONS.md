# Live Chat - Manual Setup Instructions

## Problem: Components Not Communicating

If the admin and client components aren't working together, follow these steps:

## Step 1: Enable Realtime in Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/hlxvizfxgajkrxvxktxj
2. Click on **Database** → **Replication**
3. Find tables: `chat_sessions` and `chat_messages`
4. Toggle **Enable Replication** for BOTH tables
5. Click **Save**

## Step 2: Verify Tables Exist

Run this in Supabase SQL Editor:

```sql
SELECT * FROM chat_sessions LIMIT 1;
SELECT * FROM chat_messages LIMIT 1;
```

Should return results (even if empty).

## Step 3: Test Admin Component

1. Open admin panel: http://localhost:3000/admin
2. Look for orange chat button at bottom-right
3. Click it - dialog should open
4. Should show "0 active sessions" (if no chats yet)

## Step 4: Add Client Component to Other Website

### Copy File
Copy `live-chat-client.tsx` to your client website's `components/` folder

### Install Dependencies
```bash
npm install @supabase/supabase-js lucide-react
```

### Create Supabase Client
Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hlxvizfxgajkrxvxktxj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseHZpemZ4Z2Fqa3J4dnhrdHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MjMxMjEsImV4cCI6MjA3ODQ5OTEyMX0.1bdtZX5s7rfbgMX76F3d4_ituZkV_q5nYH_OX1-4xv8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Add to Page
```tsx
"use client";
import { useState } from 'react';
import LiveChatClient from '@/components/live-chat-client';
import { MessageCircle } from 'lucide-react';

export default function Page() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div>
      {/* Your content */}
      
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg flex items-center justify-center z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <LiveChatClient isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
```

## Step 5: Test End-to-End

### On Client Website:
1. Click orange chat button
2. Enter name: "Test User"
3. Enter email: "test@example.com"
4. Click "Start Chat"
5. Type message: "Hello, I need help"
6. Press Enter

### On Admin Panel:
1. Should see toast notification: "New Chat Session"
2. Session appears in left sidebar with red badge "1"
3. Click session to open
4. See client's message
5. Reply: "Hi! How can I help?"
6. Press Enter

### Back on Client Website:
1. Within 2 seconds, admin reply should appear
2. Continue conversation

## Troubleshooting

### Admin sees "0 active sessions" but client sent message

**Check 1:** Open browser console on admin panel
- Look for errors
- Should see: "Subscribed to channel"

**Check 2:** Verify in Supabase
```sql
SELECT COUNT(*) FROM chat_sessions WHERE status = 'active';
```

**Check 3:** Reload admin page
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Client says "Failed to start chat"

**Check 1:** Open browser console
- Look for network errors
- Check if Supabase URL is correct

**Check 2:** Verify Supabase client setup
- Ensure URL matches: `https://hlxvizfxgajkrxvxktxj.supabase.co`
- Ensure anon key is correct

**Check 3:** Check CORS
- Client domain must be allowed in Supabase settings
- Go to Authentication → URL Configuration
- Add client domain to allowed origins

### Messages not appearing in real-time

**Solution:** This is expected for client!
- Client component uses polling (every 2 seconds)
- Admin uses real-time subscriptions
- Both will work, slight delay on client side

### "Subscription error" in console

**Fix:** Run this SQL in Supabase:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

## Quick Verification Checklist

- [ ] Realtime enabled in Supabase Dashboard
- [ ] Admin panel shows chat button
- [ ] Admin panel opens dialog when clicked
- [ ] Client component copied to other website
- [ ] Client has correct Supabase credentials
- [ ] Client shows chat button
- [ ] Client can start new chat
- [ ] Admin receives notification
- [ ] Admin can see and reply to messages
- [ ] Client receives admin replies (within 2 seconds)
- [ ] Both sides show timestamps
- [ ] Session persists on page refresh

## Still Not Working?

1. Check Supabase Dashboard → Logs for errors
2. Open browser DevTools → Console on both sites
3. Check Network tab for failed requests
4. Verify both sites use SAME Supabase project
5. Try closing session and starting fresh chat

## Need More Help?

The components are production-ready. If still having issues:
1. Share console errors from browser DevTools
2. Share any Supabase logs
3. Verify table structure matches schema above
