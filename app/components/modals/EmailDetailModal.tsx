"use client";

import { Smile, X } from "lucide-react";


export type EmailDetailItem = {
  initials: string;
  email: string;
  color: string;
  sender: string;
  subject: string;
  desc: string;
  time: string;
  date: string;
  body: string;
  Subject: string;
};

type Props = {
  mail: EmailDetailItem;
  onClose: () => void;
};



export default function EmailDetailModal({ mail, onClose }: Props) {
  return (
    <div
      className="
        fixed bottom-10 right-[430px] z-[1100]
        w-[418px] h-[430px]
        bg-white rounded-md
        border border-[#E5E7EB]
        shadow-xl overflow-hidden
      "
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-0 relative">

        {/* Close Button – more left */}
        <button
          onClick={onClose}
          className="absolute left-4 top-2"
        >
          <X size={22} className="text-[#6B7280]" />
        </button>

        {/* Avatar + Name + Email + Time */}
        <div className="flex items-center justify-between mt-6">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-3 ml-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] text-[#414141] font-semibold shadow-sm"
              style={{ backgroundColor: mail.color }}
            >
              {mail.initials}
            </div>

            <div className="flex flex-col">
              <p className="text-[17px] font-semibold text-[#111827]">
                {mail.sender}
              </p>
              <p className="text-[14px] text-[#6B7280]">
                {mail.email}
              </p>
            </div>
          </div>

          {/* RIGHT SIDE – TIME */}
          <p className="text-[12px] text-[#6B7280] whitespace-nowrap mr-2">
            {mail.time}, {mail.date}
          </p>

        </div>
      </div>


      {/* Body */}
      <div className="p-5 flex flex-col h-full">
        <p className="text-[13px] text-[#111827] mb-3 leading-[100%]">
          <span className="font-medium">Subject :</span>
          <span className="font-normal ml-1">{mail.Subject}</span>
        </p>
        <div className="h-[205px] overflow-y-auto whitespace-pre-line">
          <p className="text-[13px] text-[#414141] leading-4">{mail.body}</p>
        </div>
        <div className="mt-4 bg-[#E7F6ED] relative rounded-full px-4 py-2 flex items-center gap-2">
          <Smile size={20} className="text-[#414141]" />
          <input
            placeholder="Type a message......."
            className="flex-1 bg-transparent outline-none text-[13px] text-black"
          />
          <button className="w-8 h-8 bg-[#43C17A] rounded-full text-white">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
