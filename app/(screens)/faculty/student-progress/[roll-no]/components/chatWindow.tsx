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
    <div className="w-full h-full bg-white rounded-[24px] md:rounded-[30px] p-4 md:p-6 shadow-sm flex flex-col">
      <div
        className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 cursor-pointer text-[#333] hover:opacity-80 transition-opacity w-fit"
        onClick={onClose}
      >
        <CaretLeft
          size={24}
          className="md:w-[28px] md:h-[28px]"
          weight="bold"
        />
        <h2 className="text-lg md:text-2xl font-bold">Parent&apos;s Chat</h2>
      </div>

      <div className="bg-[#E8F6E2] rounded-2xl md:rounded-[24px] p-3 md:p-4 flex items-center justify-between mb-4 md:mb-8 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <img
            src={parent.avatar}
            alt={parent.name}
            className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
          />
          <div className="min-w-0">
            <h3 className="text-[15px] md:text-lg font-bold text-[#1a1a1a] truncate">
              {parent.name}
            </h3>
            <p className="text-xs md:text-sm font-medium text-[#555] truncate">
              {parent.relation}
            </p>
          </div>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#95D078] rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ml-2">
          <ChatCircleDots
            size={20}
            className="md:w-[24px] md:h-[24px]"
            weight="fill"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 md:gap-6 pr-2 mb-4 md:mb-6 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.isSender ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-xl md:rounded-2xl text-[13px] md:text-[15px] leading-relaxed relative shadow-sm font-medium
              ${
                msg.isSender
                  ? "bg-[#95D078] text-white rounded-br-none"
                  : "bg-[#EFF8E9] text-[#2d3a2f] rounded-bl-none"
              }`}
            >
              <p>{msg.text}</p>
              <span
                className={`block text-[10px] md:text-[11px] mt-1.5 md:mt-2 text-right ${msg.isSender ? "text-white/80" : "text-[#888]"}`}
              >
                12:48 PM
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#E4F6E6] rounded-full px-1.5 md:px-2 py-1.5 md:py-2 flex items-center gap-2 mt-auto">
        <button className="p-2 md:p-3 text-[#555] hover:text-[#333] transition-colors shrink-0">
          <Smiley size={24} className="md:w-[28px] md:h-[28px]" />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 bg-transparent outline-none text-[13px] md:text-[15px] text-[#333] placeholder-[#888] font-medium min-w-0"
        />
        <button className="w-8 h-8 md:w-10 md:h-10 bg-[#2ECC71] rounded-full flex items-center justify-center text-white hover:bg-[#27ae60] transition-transform active:scale-95 shadow-md shrink-0">
          <PaperPlaneRight
            size={16}
            className="md:w-[20px] md:h-[20px]"
            weight="fill"
          />
        </button>
      </div>
    </div>
  );
}
