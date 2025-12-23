"use client";

import {
  CaretLeft,
  Smiley,
  PaperPlaneRight,
  ChatCircleDots,
} from "@phosphor-icons/react";
import { Parent } from "./parentsList";

interface ChatWindowProps {
  parent: Parent;
  onClose: () => void;
}

export default function ChatWindow({ parent, onClose }: ChatWindowProps) {
  const messages = [
    {
      text: "Good morning Sir , I wanted to ask about her attendance.",
      isSender: false,
    },
    {
      text: "Good morning. I'll share her attendance details.",
      isSender: true,
    },
    { text: "Is she doing well in class?", isSender: false },
    { text: "He has missed 3 classes last week.", isSender: true },
    { text: "We received a notice about low attendance.", isSender: false },
    { text: "Don't worry, she is doing fine overall.", isSender: true },
    {
      text: "Could you please update me on her recent performance?",
      isSender: false,
    },
    { text: "Sure, I'll share her performance details.", isSender: true },
  ];

  return (
    <div className="w-full h-full bg-white rounded-[30px] p-6 shadow-sm flex flex-col">
      <div
        className="flex items-center gap-3 mb-6 cursor-pointer text-[#333] hover:opacity-80 transition-opacity"
        onClick={onClose}
      >
        <CaretLeft size={28} weight="bold" />
        <h2 className="text-2xl font-bold">Parent&apos;s Chat</h2>
      </div>

      <div className="bg-[#E8F6E2] rounded-[24px] p-4 flex items-center justify-between mb-8 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={parent.avatar}
            alt={parent.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div>
            <h3 className="text-lg font-bold text-[#1a1a1a]">{parent.name}</h3>
            <p className="text-sm font-medium text-[#555]">{parent.relation}</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-[#95D078] rounded-full flex items-center justify-center text-white shadow-sm">
          <ChatCircleDots size={24} weight="fill" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2 mb-6 scrollbar-thin scrollbar-thumb-gray-200">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.isSender ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl text-[15px] leading-relaxed relative shadow-sm font-medium
              ${
                msg.isSender
                  ? "bg-[#95D078] text-white rounded-br-none" // Darker green for sender
                  : "bg-[#EFF8E9] text-[#2d3a2f] rounded-bl-none" // Light green/white for receiver
              }`}
            >
              <p>{msg.text}</p>
              <span
                className={`block text-[11px] mt-2 text-right ${
                  msg.isSender ? "text-white/80" : "text-[#888]"
                }`}
              >
                12:48 PM
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#E4F6E6] rounded-full px-2 py-2 flex items-center gap-2">
        <button className="p-3 text-[#555] hover:text-[#333] transition-colors">
          <Smiley size={28} />
        </button>
        <input
          type="text"
          placeholder="Type a message......"
          className="flex-1 bg-transparent outline-none text-[#333] placeholder-[#888] font-medium ml-1"
        />
        <button className="w-10 h-10 bg-[#2ECC71] rounded-full flex items-center justify-center text-white hover:bg-[#27ae60] transition-transform active:scale-95 shadow-md">
          <PaperPlaneRight size={20} weight="fill" />
        </button>
      </div>
    </div>
  );
}
