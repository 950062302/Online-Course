"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase, pb } from '@/integrations/supabase/client';
import MessageBubble from './MessageBubble';
import { useSession } from '@/components/auth/SessionContextProvider';
import { showError } from '@/utils/toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatUser {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

interface ChatWindowProps {
  selectedUser: ChatUser | null;
  onBack: () => void; // For mobile view
}

type ConnectionStatus = 'loading' | 'online' | 'offline';

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser, onBack }) => {
  const { user } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>('loading');

  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const typingSendThrottleRef = useRef<number | null>(null);

  // Global online/offline listeners
  useEffect(() => {
    const handleOnline = () => setStatus('online');
    const handleOffline = () => setStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status
    if (typeof navigator !== 'undefined') {
      setStatus(navigator.onLine ? 'online' : 'offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!selectedUser || !user) return;

    setStatus('loading');

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setStatus('offline');
      } else {
        setMessages(data || []);
        if (typeof navigator !== 'undefined') {
          setStatus(navigator.onLine ? 'online' : 'offline');
        } else {
          setStatus('online');
        }
      }
    };

    fetchMessages();

    // Mark messages as read
    const markAsRead = async () => {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', selectedUser.id)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
    };
    markAsRead();

    // PocketBase realtime (SSE)
    let unsubMessages: (() => Promise<void>) | null = null;
    let unsubTyping: (() => Promise<void>) | null = null;
    const conversationKey = [user.id, selectedUser.id].sort().join("-");

    const attachRealtime = async () => {
      try {
        unsubMessages = await pb.collection('messages').subscribe('*', (e: any) => {
          if (e?.action !== 'create' && e?.action !== 'update') return;
          const rec = e.record as Message;
          if (!rec) return;

          const isThisConversation =
            (rec.sender_id === user.id && rec.receiver_id === selectedUser.id) ||
            (rec.sender_id === selectedUser.id && rec.receiver_id === user.id);
          if (!isThisConversation) return;

          setMessages((prev) => {
            const existing = prev.find((m) => m.id === rec.id);
            if (existing) {
              return prev.map((m) => (m.id === rec.id ? rec : m));
            }
            return [...prev, rec].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });

          if (rec.sender_id === selectedUser.id) {
            markAsRead();
          }
        });

        unsubTyping = await pb.collection('typing_events').subscribe('*', (e: any) => {
          if (e?.action !== 'create') return;
          const rec = e.record as any;
          if (!rec) return;
          if (rec.conversation_key !== conversationKey) return;
          if (rec.to_user !== user.id) return;
          if (rec.from_user !== selectedUser.id) return;

          setIsOtherTyping(true);
          if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = window.setTimeout(() => setIsOtherTyping(false), 2000);
        });
      } catch (err) {
        console.error('[ChatWindow] realtime subscribe error:', err);
      }
    };

    attachRealtime();

    return () => {
      if (unsubMessages) unsubMessages();
      if (unsubTyping) unsubTyping();
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = null;
    };
  }, [selectedUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user) return;

    setIsSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedUser.id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      showError("Xabar yuborishda xato.");
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Typing event via PocketBase (DB write, throttled)
    if (!value.trim() || !user || !selectedUser) return;
    if (typingSendThrottleRef.current) return;

    typingSendThrottleRef.current = window.setTimeout(() => {
      typingSendThrottleRef.current = null;
    }, 900) as unknown as number;

    const conversationKey = [user.id, selectedUser.id].sort().join("-");
    supabase
      .from('typing_events')
      .insert({
        conversation_key: conversationKey,
        from_user: user.id,
        to_user: selectedUser.id,
      })
      .then(() => {
        // ignore
      });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full text-center p-4">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <Send className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700">
          Chatni boshlash uchun foydalanuvchi tanlang
        </h3>
        <p className="text-gray-500 mt-2">
          Chap tomondan foydalanuvchini qidiring yoki tanlang.
        </p>
      </div>
    );
  }

  const renderStatusText = () => {
    if (status === 'loading') return "Yangilanmoqda...";
    if (status === 'offline') return "Offline";
    return "Siz online siz";
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm z-10">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10 border-2 border-primary/10">
            <AvatarImage src={selectedUser.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {selectedUser.username
                ? selectedUser.username.substring(0, 2).toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-800">
              {selectedUser.username}
            </h3>
            {selectedUser.role === "developer" && (
              <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                Admin
              </span>
            )}
            <span className="text-xs text-gray-500 block">
              {renderStatusText()}
            </span>
            {isOtherTyping && (
              <span className="text-xs text-primary mt-1 inline-flex items-center">
                Yozyapti...
                <span className="ml-1 inline-flex">
                  <span className="w-1 h-1 bg-primary rounded-full mr-0.5 animate-pulse" />
                  <span className="w-1 h-1 bg-primary rounded-full mr-0.5 animate-pulse delay-150" />
                  <span className="w-1 h-1 bg-primary rounded-full animate-pulse delay-300" />
                </span>
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            isOwn={msg.sender_id === user?.id}
            createdAt={msg.created_at}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Xabar yozing..."
            className="flex-1 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || !newMessage.trim()}
            className="bg-primary hover:bg-primary-dark text-white rounded-full w-10 h-10 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;