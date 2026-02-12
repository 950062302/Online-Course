"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  createdAt: string;
  senderName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ content, isOwn, createdAt, senderName }) => {
  return (
    <div className={cn("flex flex-col mb-4", isOwn ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm text-sm relative",
          isOwn
            ? "bg-primary text-white rounded-tr-none"
            : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
        )}
      >
        {!isOwn && senderName && (
          <span className="text-xs font-bold text-primary mb-1 block">
            {senderName}
          </span>
        )}
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <span
          className={cn(
            "text-[10px] absolute bottom-1 right-2 opacity-70",
            isOwn ? "text-white" : "text-gray-500"
          )}
        >
          {format(new Date(createdAt), 'HH:mm')}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;