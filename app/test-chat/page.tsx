"use client";

import { useState } from 'react';
import LiveChatClient from '@/components/live-chat-client';
import { MessageCircle } from 'lucide-react';

export default function TestChatPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Live Chat Test Page
          </h1>
          <p className="text-gray-600 mb-6">
            This page simulates a client website with the live chat feature.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">
              How to Test:
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Click the orange chat button in the bottom-right corner</li>
              <li>Enter your name and email</li>
              <li>Click "Start Chat"</li>
              <li>Send a message</li>
              <li>
                Open the admin panel in another tab at{' '}
                <a
                  href="/admin"
                  target="_blank"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  /admin
                </a>
              </li>
              <li>Look for the orange chat button in the admin panel</li>
              <li>Click it to see your message</li>
              <li>Reply from admin panel</li>
              <li>See the reply appear here within 2 seconds</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-900 mb-3">
              Debug Checklist:
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Open browser DevTools (F12) and check Console tab</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Look for "📋 Loaded sessions" in admin console</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Look for "🔔 New session received" when you start chat</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Look for "💬 New message received" when messages sent</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Look for "🔌 Channel status: SUBSCRIBED" messages</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> If you previously closed chat sessions, they will appear
              with a "Closed" badge in the admin panel. You can still click them to view
              the conversation history.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sample Content
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>
              This is a sample page to demonstrate the live chat functionality.
              In your actual client website, you would integrate the LiveChatClient
              component similarly.
            </p>
            <p>
              The chat button appears in the bottom-right corner and opens a dialog
              when clicked. Messages are synchronized between this page and the admin
              panel in real-time.
            </p>
            <p>
              The client side polls for new messages every 2 seconds, while the admin
              side receives real-time updates via Supabase subscriptions.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#F26623] hover:bg-[#E55A1F] text-white shadow-lg flex items-center justify-center z-50 transition-all hover:scale-110"
        aria-label="Open live chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <LiveChatClient
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
