"use client";

import React, { useState } from "react";
import { Warning, User, CloudArrowUp, CaretDown, ClockCounterClockwise, Hourglass, CheckCircle } from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";

export default function SupportPage() {
  const [priority, setPriority] = useState("Medium");
  const [issueRelated, setIssueRelated] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className=" bg-[#F3F4F6] text-[#282828] h-full">
      <div className=" px-4 mx-auto space-y-6"> 
        
        <div>
          <h1 className="text-xl font-bold mb-2">Tekton Campus Support</h1>
          <p className="text-[#525252] text-sm">
            Fill in the details below. Every submission is tracked and resolved transparently.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto w-full">
          <CardComponent
            style="bg-[#E5E0FF] border-none !h-auto"
            icon={<ClockCounterClockwise weight="fill" size={18} />}
            iconBgColor="#FFFFFF"
            iconColor="#6C5CE7"
            value={<span className="text-[#6C5CE7] text-2xl md:text-3xl font-bold">15</span>}
            label="Previous"
            textSize="text-xs md:text-sm"
          />
          <CardComponent
            style="bg-[#F5E6CA] border-none !h-auto"
            icon={<Hourglass weight="fill" size={18} />}
            iconBgColor="#FFFFFF"
            iconColor="#F39C12"
            value={<span className="text-[#F39C12] text-2xl md:text-3xl font-bold">05</span>}
            label="Pending"
            textSize="text-xs md:text-sm"
          />
          <CardComponent
            style="bg-[#D2EBE0] border-none !h-auto"
            icon={<CheckCircle weight="fill" size={18} />}
            iconBgColor="#FFFFFF"
            iconColor="#27AE60"
            value={<span className="text-[#27AE60] text-2xl md:text-3xl font-bold">10</span>}
            label="Resolved"
            textSize="text-xs md:text-sm"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#515151]">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <User size={18} className="text-[#888888]" />
                </div>
                <input
                  type="text"
                  value="Student"
                  disabled
                  className="w-full pl-10 pr-3 py-2.5 bg-[#EEF2ED] border border-[#CCCCCC] rounded-md text-[#525252] text-sm focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#515151]">Issue Related</label>
              <div className="relative">
                <select
                  value={issueRelated}
                  onChange={(e) => setIssueRelated(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-white border border-[#CCCCCC] rounded-md text-[#525252] text-sm focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select</option>
                  <option value="academic">Academic</option>
                  <option value="financial">Financial</option>
                  <option value="technical">Technical</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <CaretDown size={16} className="text-[#525252]" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#515151]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about the issue you're facing..."
              rows={5}
              className="w-full p-3 bg-white border border-[#CCCCCC] rounded-md text-[#525252] text-sm focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[13px] font-bold text-[#515151]">Priority Level</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <button
                onClick={() => setPriority("Low")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md border transition-all ${
                  priority === "Low" 
                    ? "border-[#43C17A] bg-[#F4FAF6]" 
                    : "border-[#CCCCCC] bg-white hover:bg-gray-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#27AE60]"></span>
                <span className={`text-[13px] font-bold ${priority === "Low" ? "text-[#282828]" : "text-[#515151]"}`}>Low</span>
              </button>

              <button
                onClick={() => setPriority("Medium")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md border transition-all ${
                  priority === "Medium" 
                    ? "border-[#43C17A] bg-[#F4FAF6]" 
                    : "border-[#CCCCCC] bg-white hover:bg-gray-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#27AE60]"></span>
                <span className={`text-[13px] font-bold ${priority === "Medium" ? "text-[#282828]" : "text-[#515151]"}`}>Medium</span>
              </button>

              <button
                onClick={() => setPriority("High")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md border transition-all ${
                  priority === "High" 
                    ? "border-[#43C17A] bg-[#F4FAF6]" 
                    : "border-[#CCCCCC] bg-white hover:bg-gray-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#B87333]"></span>
                <span className={`text-[13px] font-bold ${priority === "High" ? "text-[#282828]" : "text-[#515151]"}`}>High</span>
              </button>

            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#515151]">Upload Proof (Images/Video)</label>
            <div className="border-2 border-dashed border-[#A8D5BA] bg-[#F8FCF9] rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-[#f0f9f3] transition-colors">
              <CloudArrowUp size={36} className="text-[#888888] mb-3" />
              <p className="text-[15px] text-[#282828] mb-1">
                Drag and drop files or <span className="text-[#27AE60] font-bold">browse</span>
              </p>
              <p className="text-[11px] text-[#888888]">
                Support: JPG, PNG, PDF
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}