"use client";

import React from "react";

interface ChatShimmerProps {
  count?: number;
}

export default function ChatShimmer({ count = 4 }: ChatShimmerProps) {
  // A predefined pattern to make the shimmer look like a natural conversation
  const patterns = [
    { isMe: false, width: "w-[60%]", height: "h-14" },
    { isMe: true, width: "w-[40%]", height: "h-10" },
    { isMe: false, width: "w-[75%]", height: "h-20" },
    { isMe: true, width: "w-[50%]", height: "h-12" },
    { isMe: true, width: "w-[30%]", height: "h-10" },
    { isMe: false, width: "w-[45%]", height: "h-14" },
  ];

  const bubbles = Array.from({ length: count }).map((_, i) => patterns[i % patterns.length]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {bubbles.map((bubble, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-2 w-full max-w-[85%] ${
            bubble.isMe ? "ml-auto flex-row-reverse" : "mr-auto"
          }`}
        >
          {/* Avatar Skeleton for Receiver */}
          {!bubble.isMe && (
            <div className="w-7 h-7 shrink-0 rounded-full bg-gray-200 animate-pulse mt-1" />
          )}

          {/* Bubble Skeleton */}
          <div
            className={`${bubble.height} rounded-xl animate-pulse ${bubble.width} ${
              bubble.isMe
                ? "bg-[#43C17A]/30 rounded-tr-none"
                : "bg-gray-200 rounded-tl-none"
            }`}
          />
        </div>
      ))}
    </div>
  );
}
