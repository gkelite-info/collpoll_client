"use client";

import { Avatar } from "@/app/utils/Avatar";
import { PaperPlaneRightIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { announcementsData } from "../data";

export default function Announcements() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="mx-auto flex h-[650px] w-full max-w-2xl flex-col bg-transparent">
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="flex min-h-full flex-col justify-end gap-4 pb-2">
          {announcementsData.map((announcement) => (
            <div key={announcement.id} className="flex flex-col">
              <div className="group relative flex items-start gap-4 px-1">
                <div className="relative flex-1 rounded-2xl border-2 border-[#CCCCCC] bg-white p-4 shadow-md transition-all hover:border-[#16284F]/30">
                  <div className="mb-2 flex items-center justify-between pr-3">
                    <span className="text-[13px] font-medium text-[#3B3B3B]">
                      {announcement.time}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center gap-1 rounded border border-[#465FAC] bg-[#E0E5FA] px-2 py-1 text-[10px] font-bold tracking-wide text-[#16284F]">
                        {announcement.role}
                      </span>
                      <span className="text-[14px] font-bold text-[#16284F]">
                        {announcement.author}
                      </span>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-[14px] font-medium leading-relaxed text-[#16284F]">
                    {announcement.message}
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-100 text-center shadow-sm">
                  <Avatar src={announcement.avatar} alt="avatar" size={48} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form className="mt-2 px-1 pb-2">
        <div className="flex items-center gap-4">
          <motion.div
            initial={false}
            animate={{ scale: inputValue.trim() ? 1.01 : 1 }}
            className="relative flex-1"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              maxLength={1000}
              placeholder="Type here........"
              className="w-full rounded-full border-2 border-transparent bg-[#E5E5E5] py-3.5 pl-6 pr-14 text-sm font-medium text-[#282828] outline-none transition-all duration-300 placeholder:text-[#6F6F6F] focus:border-[#16284F]/20 focus:bg-white focus:shadow-lg"
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 overflow-hidden rounded-full">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9, rotate: -10 }}
                initial={{ x: 50, opacity: 0 }}
                animate={{
                  x: inputValue.trim() ? 0 : 50,
                  opacity: inputValue.trim() ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex h-10 w-10 cursor-pointer items-center justify-center bg-[#16284F] text-white shadow-lg disabled:bg-gray-400"
              >
                <PaperPlaneRightIcon size={22} weight="fill" className="ml-0.5" />
              </motion.button>
            </div>
          </motion.div>
          <div className="w-12 shrink-0" />
        </div>
        <div className="mt-1 flex justify-end px-4 pl-6 pr-17">
          <span
            className={`text-[10px] ${
              inputValue.length >= 1000 ? "font-bold text-red-500" : "text-gray-400"
            }`}
          >
            {inputValue.length}/1000
          </span>
        </div>
      </form>
    </div>
  );
}
