"use client";

import React, { useState } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

interface ChatUser {
  id: string;
  username: string;
  avatar_url?: string;
  role?: string;
}

const ChatPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const handleSelectUser = (user: ChatUser) => {
    setSelectedUser(user);
    setShowMobileChat(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-full md:h-[calc(100vh-64px)] overflow-hidden bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-200 md:m-4">
      {/* Sidebar - full width on mobile, left column on desktop */}
      <ChatSidebar
        onSelectUser={handleSelectUser}
        selectedUserId={selectedUser?.id}
        className={`${
          showMobileChat ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-96 flex-shrink-0`}
      />

      {/* Chat Window - hidden on mobile until a user is selected */}
      <div
        className={`${
          !showMobileChat ? "hidden md:flex" : "flex"
        } flex-1 flex-col h-full`}
      >
        <ChatWindow
          selectedUser={selectedUser}
          onBack={() => setShowMobileChat(false)}
        />
      </div>
    </div>
  );
};

export default ChatPage;