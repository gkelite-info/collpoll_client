"use client";

import TableComponent from "@/app/utils/table/table";
import {
  CalendarBlank,
  ChatCircleDots,
  FileText,
  MagnifyingGlass,
  PaperPlaneTilt,
  Paperclip,
  X,
} from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { leaveRequests } from "../data";

const leaveRequestColumns = [
  { title: "S.No", key: "serialNo" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
];

export default function LeaveRequestsTable() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRejectedView = searchParams.get("status") === "rejected";
  const showDetails = searchParams.get("details") === "leave-request";

  const openDetails = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("details", "leave-request");
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeDetails = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("details");
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const tableColumns = isRejectedView
    ? [
        { title: "S.No", key: "serialNo" },
        { title: "From - To", key: "dateRange" },
        { title: "Days", key: "days" },
        { title: "Leave Type", key: "leaveType" },
        { title: "Description", key: "description" },
        { title: "Attachments", key: "attachments" },
        { title: "Status", key: "status" },
        { title: "Details", key: "details" },
      ]
    : leaveRequestColumns;

  const filteredRequests = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return leaveRequests;

    return leaveRequests.filter((request) =>
      [
        request.serialNo,
        request.dateRange,
        request.days,
        request.leaveType,
        request.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [query]);

  const tableData = filteredRequests.map((request) => ({
    serialNo: request.serialNo,
    dateRange: request.dateRange,
    days: request.days,
    leaveType: request.leaveType,
    description: isRejectedView
      ? `${request.description} and ne..`
      : request.description,
    ...(isRejectedView
      ? {
          attachments: <span className="text-[#525252]">-</span>,
          status: (
            <span className="inline-flex min-w-28 items-center justify-center rounded-full bg-[#FFD7D7] px-4 py-1 text-sm font-medium text-[#FF2020]">
              Rejected
            </span>
          ),
          details: (
            <button
              type="button"
              onClick={openDetails}
              className="cursor-pointer text-sm font-semibold text-[#006BFF] hover:underline"
            >
              View Details
            </button>
          ),
        }
      : {}),
  }));

  return (
    <section className="mt-3 flex min-h-0 flex-1 flex-col">
      <div className="mb-3 grid grid-cols-[1fr_auto] gap-3">
        <label className="flex h-11 items-center gap-3 bg-[#EEEEEE] px-4">
          <MagnifyingGlass size={21} color="#43C17A" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="h-full w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#282828]"
          />
        </label>

        <button className="flex h-11 items-center justify-center gap-3 bg-[#DFF3E9] px-6 text-sm font-semibold text-[#43C17A]">
          <CalendarBlank size={18} weight="fill" />
          12/04/2026
        </button>
      </div>

      <div className="min-h-0 flex-1">
        <TableComponent
          columns={tableColumns}
          tableData={tableData}
          height="calc(100vh - 10rem)"
          fillHeight
        />
      </div>

      <LeaveRequestDetailsModal
        open={showDetails}
        onClose={closeDetails}
      />
    </section>
  );
}

function LeaveRequestDetailsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[78vh] w-full max-w-[780px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E6] px-6 py-3">
          <h2 className="text-base font-semibold text-[#282828]">
            Leave Request Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-[#9AA0AA] hover:text-[#282828]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="custom-scrollbar overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-3 gap-6">
            <DetailBlock label="Date Request Sent" value="18/10/2023" />
            <DetailBlock label="Duration" value="23/10/2023 - 25/10/2023" />
            <DetailBlock label="Total Days" value="03 Days" />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-medium uppercase text-[#A0A0A0]">
                Leave Type
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-[#282828]">
                <span className="h-2 w-2 rounded-full bg-[#43C17A]" />
                Casual Leave
              </div>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase text-[#A0A0A0]">
                Attachment
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-[#22A05D]">
                <FileText size={16} />
                Medical_document.pdf
              </div>
            </div>
          </div>

          <div className="my-4 h-px bg-[#E6E6E6]" />

          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#282828]">
            <ChatCircleDots size={18} />
            Communication History
          </div>

          <div className="rounded-xl bg-[#F7F7F7] p-4">
            <div className="flex justify-end gap-3">
              <div>
                <div className="max-w-[380px] rounded-lg bg-[#43C17A] px-4 py-3 text-xs leading-relaxed text-white">
                  Good morning, I have been diagnosed with viral fever and
                  won&apos;t be able to attend work today.
                </div>
                <p className="mt-2 text-right text-[10px] text-[#9AA0AA]">
                  11:02 AM
                </p>
              </div>
              <Avatar
                label="A"
                image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop"
              />
            </div>

            <div className="mt-4 flex items-end gap-3">
              <Avatar
                label="S"
                image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
              />
              <div>
                <div className="max-w-[360px] rounded-lg bg-white px-4 py-2.5 text-xs leading-relaxed text-[#282828] shadow-sm">
                  <p className="font-medium text-[#43C17A]">Sarah Jenkins</p>
                  Okay. Please upload the appointment slip if available.
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-[#9AA0AA]">
                  10:45 AM
                  <span className="rounded bg-[#FF2020] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    NEW
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#E2E2E2] px-3 py-2">
            <Paperclip size={18} className="text-[#9AA0AA]" />
            <input
              placeholder="Type your message here..."
              className="h-9 flex-1 text-sm outline-none placeholder:text-[#9AA0AA]"
            />
            <button className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#43C17A] px-5 text-sm font-medium text-white hover:bg-[#34A565]">
              Send
              <PaperPlaneTilt size={15} weight="fill" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase text-[#A0A0A0]">
        {label}
      </p>
      <p className="mt-2 text-sm text-[#282828]">{value}</p>
    </div>
  );
}

function Avatar({ label, image }: { label: string; image?: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DFF3E9] text-sm font-semibold text-[#43C17A]">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        label
      )}
    </div>
  );
}
