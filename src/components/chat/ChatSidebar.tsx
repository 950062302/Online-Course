"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/auth/SessionContextProvider";
import { cn } from "@/lib/utils";

// Simple debounce hook
const useDebounceValue = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

interface ChatUser {
  id: string;
  username: string;
  role?: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

interface ChatSidebarProps {
  onSelectUser: (user: ChatUser) => void;
  selectedUserId?: string;
  className?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onSelectUser,
  selectedUserId,
  className,
}) => {
  const { user } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounceValue(searchQuery, 300);

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [recentChats, setRecentChats] = useState<ChatUser[]>([]);
  const [adminUsers, setAdminUsers] = useState<ChatUser[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Fetch admin users once (role = developer OR username = 'admin')
  useEffect(() => {
    const fetchAdmins = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, role")
        .or("role.eq.developer,username.eq.admin");

      if (!error && data) {
        setAdminUsers(data);
      }
    };

    fetchAdmins();
  }, []);

  // Fetch recent chats + unread counts
  useEffect(() => {
    if (!user) return;

    const fetchRecentChatsAndUnread = async () => {
      // 1) Recent chat contacts
      const { data: receivedMessages } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

      const { data: sentMessages } = await supabase
        .from("messages")
        .select("receiver_id")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

      const contactIds = new Set<string>();

      if (receivedMessages) {
        receivedMessages.forEach((m) => contactIds.add(m.sender_id));
      }
      if (sentMessages) {
        sentMessages.forEach((m) => contactIds.add(m.receiver_id));
      }

      if (contactIds.size > 0) {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, username, role")
          .in("id", Array.from(contactIds));

        if (!error && profiles) {
          setRecentChats(profiles);
        } else {
          setRecentChats([]);
        }
      } else {
        setRecentChats([]);
      }

      // 2) Unread messages by sender
      const { data: unreadMsgs } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", user.id)
        .eq("is_read", false)
        .limit(1000);

      const counts: Record<string, number> = {};
      if (unreadMsgs) {
        unreadMsgs.forEach((m) => {
          const sid = (m as any).sender_id as string;
          counts[sid] = (counts[sid] || 0) + 1;
        });
      }
      setUnreadCounts(counts);
    };

    fetchRecentChatsAndUnread();

    const channel = supabase
      .channel("chat_sidebar")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          fetchRecentChatsAndUnread();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => {
          fetchRecentChatsAndUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Search users by username (support @username input)
  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch.trim()) {
        setUsers([]);
        return;
      }

      // remove leading @ so "@name" works
      const normalized = debouncedSearch.trim().replace(/^@+/, "");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, role")
        .ilike("username", `%${normalized}%`)
        .neq("id", user?.id)
        .limit(10);

      if (!error && data) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    };

    searchUsers();
  }, [debouncedSearch, user]);

  // Admin IDs (to exclude from "other chats" section)
  const adminIds = new Set(adminUsers.map((a) => a.id));

  // Main list (non-admin chats)
  let displayList: ChatUser[] = [];

  if (searchQuery.trim()) {
    // Only search results
    displayList = users;
  } else {
    // Other chats (admins are shown separately)
    displayList = recentChats.filter((c) => !adminIds.has(c.id));
  }

  const showEmptyMessage =
    !searchQuery.trim() &&
    displayList.length === 0 &&
    adminUsers.length === 0;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200",
        className
      )}
    >
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Chatlar</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Foydalanuvchini qidirish (@username)..."
            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Admin section always visible when not searching */}
        {!searchQuery.trim() && adminUsers.length > 0 && (
          <div className="mt-2 mb-3">
            <p className="px-4 text-xs font-semibold uppercase text-gray-400 mb-1">
              Admin bilan chat
            </p>
            {adminUsers.map((admin) => {
              const unread = unreadCounts[admin.id] || 0;
              return (
                <div
                  key={admin.id}
                  onClick={() => onSelectUser(admin)}
                  className={cn(
                    "flex items-center p-3 cursor-pointer transition-colors hover:bg-gray-50 mx-2 my-1 rounded-xl",
                    selectedUserId === admin.id
                      ? "bg-primary/5 border border-primary/20"
                      : ""
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12 border border-gray-100">
                      <AvatarImage src={admin.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {admin.username
                          ? admin.username.substring(0, 2).toUpperCase()
                          : "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  </div>

                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-800 truncate">
                        {admin.username || "Admin"}
                      </span>
                      {unread > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      <span className="text-primary font-medium">@admin</span> — savol va
                      takliflar uchun
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Search results only */}
        {searchQuery.trim() && users.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            Foydalanuvchi topilmadi
          </div>
        )}

        {/* Other chats section */}
        {!searchQuery.trim() && displayList.length > 0 && (
          <p className="px-4 text-xs font-semibold uppercase text-gray-400 mt-2 mb-1">
            Boshqa chatlar
          </p>
        )}

        {displayList.map((chatUser) => {
          const unread = unreadCounts[chatUser.id] || 0;
          return (
            <div
              key={chatUser.id}
              onClick={() => onSelectUser(chatUser)}
              className={cn(
                "flex items-center p-3 cursor-pointer transition-colors hover:bg-gray-50 mx-2 my-1 rounded-xl",
                selectedUserId === chatUser.id
                  ? "bg-primary/5 border border-primary/20"
                  : ""
              )}
            >
              <div className="relative">
                <Avatar className="w-12 h-12 border border-gray-100">
                  <AvatarImage src={chatUser.avatar_url} />
                  <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                    {chatUser.username
                      ? chatUser.username.substring(0, 2).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>

              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-800 truncate">
                    {chatUser.username}
                  </span>
                  {unread > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {chatUser.role === "developer" ? (
                    <span className="text-primary font-medium">Admin</span>
                  ) : (
                    "Click to chat"
                  )}
                </p>
              </div>
            </div>
          );
        })}

        {/* Empty state only if there is no admin and no other chats */}
        {showEmptyMessage && (
          <div className="p-8 text-center text-gray-400 text-sm">
            Hozircha chatlar yo&apos;q. Qidiruv orqali do&apos;stlaringizni toping.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;