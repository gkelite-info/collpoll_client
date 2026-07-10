"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Circle,
  ClipboardList,
  Download,
  X,
} from "lucide-react";
import {
  Paperclip as PhosphorPaperclip,
  Hourglass as PhosphorHourglass,
} from "@phosphor-icons/react";
import { approvalSteps, uploadedBills } from "./data";
import Info from "./Info";

type ReimbursementDetailsModalProps = {
  onClose: () => void;
};

export default function ReimbursementDetailsModal({
  onClose,
}: ReimbursementDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/55 px-4 lg:pl-[calc(17vw+1rem)] py-6">
      <div className="relative max-h-[92vh] w-full max-w-[900px] overflow-y-auto rounded-[16px] bg-[#F8FAFC] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reimbursement details"
          className="absolute right-5 top-5 cursor-pointer rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <div className="mb-7 flex flex-wrap items-start justify-between gap-4 pr-9">
          <div>
            <h2 className="text-[24px] font-bold text-[#14213A]">
              Business Dinner with Clients
            </h2>
            <p className="mt-1 text-[13px] text-[#61708A]">
              Request ID: RB-2026-0145 - Submitted on 14 Jun 2026, 10:20 AM
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FFD9B8] bg-[#FFF3E8] px-4 py-2 text-[13px] font-bold text-[#F47A16]">
            <span className="h-2 w-2 rounded-full bg-[#F47A16]" />
            Processing
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <section className="rounded-[10px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3 border-b border-[#E7EDF5] pb-5">
                <span className="rounded-[8px] bg-[#EEE9FF] p-2 text-[#7B45FF]">
                  <ClipboardList size={20} />
                </span>
                <h3 className="text-[17px] font-bold text-[#14213A]">
                  Expense Summary
                </h3>
              </div>
              <div className="grid gap-x-12 gap-y-4 sm:grid-cols-2">
                <Info label="Category" value="Client Meeting" />
                <Info label="Expense Date" value="13 Jun 2026" />
                <Info label="Amount" value="4,580.00" strong />
                <Info label="Payment Method" value="Bank Transfer" />
                <Info
                  label="Description"
                  value="Business dinner with clients to discuss new project."
                  className="sm:col-span-2"
                />
              </div>
            </section>

            <section className="rounded-[10px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-[8px] bg-[#F2E9FF] p-2 text-[#884DFF]">
                  <PhosphorPaperclip size={20} weight="bold" />
                </span>
                <h3 className="text-[17px] font-bold text-[#14213A]">
                  Uploaded Bills
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {uploadedBills.map((file) => (
                  <div
                    key={file.name}
                    className="rounded-[8px] border border-[#E7EDF5] bg-white p-3 shadow-sm"
                  >
                    <div className="mb-3 flex h-[108px] items-center justify-center rounded-[6px] bg-[#EFF3F8]">
                      <span className="rounded-[3px] bg-[#EF4444] px-2 py-1 text-[10px] font-bold text-white">
                        PDF
                      </span>
                    </div>
                    <p className="text-[12px] font-bold text-[#14213A]">
                      {file.name}
                    </p>
                    <p className="mb-2 text-[11px] text-[#7C8AA0]">
                      {file.size}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="h-8 flex-1 cursor-pointer rounded-[4px] border border-[#E2E8F0] text-[11px] font-bold text-[#43516A] hover:bg-[#F6F8FB]"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        aria-label={`Download ${file.name}`}
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-[4px] border border-[#E2E8F0] text-[#4F46E5] hover:bg-[#F6F8FB]"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-[#8AA0BA]">
                Uploaded on 14 Jun 2026, 10:20 AM
              </p>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[10px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3 border-b border-[#E7EDF5] pb-5">
                <span className="rounded-[8px] bg-[#EEE9FF] p-2 text-[#7B45FF]">
                  <ClipboardList size={20} />
                </span>
                <h3 className="text-[17px] font-bold text-[#14213A]">
                  Request Overview
                </h3>
              </div>
              <div className="space-y-4">
                <Info label="Status" value="Processing" badge />
                <Info label="Current Stage" value="Finance Processing" blue />
                <Info label="Total Amount" value="4,580.00" strong />
                <Info label="Submitted On" value="14 Jun 2026, 10:20 AM" />
              </div>
            </section>

            <section className="rounded-[10px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-[8px] bg-[#EEE9FF] p-2 text-[#7B45FF]">
                  <PhosphorHourglass size={20} weight="fill" />
                </span>
                <h3 className="text-[17px] font-bold text-[#14213A]">
                  Approval Progress
                </h3>
              </div>
              <div className="space-y-5">
                {approvalSteps.map((step) => (
                  <div key={step.title} className="flex gap-3">
                    <span
                      className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                        step.done
                          ? "bg-[#31C56F] text-white"
                          : step.active
                            ? "bg-[#4F46E5] text-white"
                            : "bg-[#A7ADB5] text-white"
                      }`}
                    >
                      {step.done ? (
                        <Check size={12} />
                      ) : (
                        <Circle size={8} fill="currentColor" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={`text-[12px] font-bold ${
                            step.active ? "text-[#3B36D9]" : "text-[#14213A]"
                          }`}
                        >
                          {step.title}
                        </p>
                        {step.owner && (
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-[#14213A]">
                              {step.owner}
                            </p>
                            <p className="text-[9px] text-[#7C8AA0]">
                              {step.role}
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-[#7C8AA0]">
                        {step.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
