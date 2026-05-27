import { ListDashes, CaretDown } from "@phosphor-icons/react";
import { WellbeingIssue } from "../data";
import Image from "next/image";
import { useState, useEffect } from "react";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

interface IssueCardProps {
  issue: WellbeingIssue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  const [currentStatus, setCurrentStatus] = useState(issue.status);
  const [pendingStatus, setPendingStatus] = useState<WellbeingIssue["status"] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.card-dropdown-${issue.id}`)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, issue.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-[#009B55] text-white";
      case "Rejected":
        return "bg-[#FF2A2A] text-white";
      case "Pending":
      default:
        return "bg-[#FFB067] text-white";
    }
  };

  const getContainerBgColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-[#F0FAF4]";
      case "Rejected":
        return "bg-[#FFF2F2]";
      case "Pending":
      default:
        return "bg-[#FFF9F2]";
    }
  };

  return (
    <div
      className={`w-full rounded-2xl p-4 sm:p-6 mb-4 flex flex-col gap-3 sm:gap-4 ${getContainerBgColor(
        currentStatus
      )}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E5F3EC] text-[#009B55] flex items-center justify-center">
            <ListDashes size={18} weight="bold" />
          </div>
          <span className="font-semibold text-gray-700">Issue Details</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-600">
            Date Reported : {issue.dateReported}
          </span>
          <div className={`relative card-dropdown-${issue.id}`}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`px-3 py-1 rounded-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer focus:outline-none ${getStatusColor(
                currentStatus
              )}`}
            >
              <span>{currentStatus}</span>
              <CaretDown size={12} weight="bold" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-[120px] bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 overflow-hidden">
                {(["Pending", "Resolved", "Rejected"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (status !== currentStatus) {
                        setPendingStatus(status);
                        setIsModalOpen(true);
                      }
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:!bg-blue-600 hover:!text-white transition-colors duration-150 cursor-pointer block ${
                      status === currentStatus ? "bg-gray-100 text-gray-800" : "bg-white text-gray-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800">{issue.title}</h3>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Sub Category :</span>
          <span className="px-3 py-1 border border-[#D7D7D7] rounded-xs text-gray-700 font-medium">
            {issue.subCategory}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Branch :</span>
          <span className="px-3 py-1 border border-[#D7D7D7] rounded-xs text-gray-700 font-medium">
            {issue.branch}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:gap-6">
        <span className="font-semibold text-gray-700 text-sm lg:w-[220px]">Description :</span>
        <p className="text-sm text-gray-500 leading-relaxed">
          {issue.description}
        </p>
      </div>

      {issue.attachments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start gap-2 mt-2">
          <span className="font-semibold text-gray-700 text-sm whitespace-nowrap mt-2">
            Attachments :
          </span>
          <div className="flex flex-wrap gap-3">
            {issue.attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white border border-[#D7D7D7] rounded-xs p-2 pr-4"
              >
                <div className="text-red-500">
                  {/* <FilePdf size={24} weight="fill" /> */}
                  <Image
                    src='/pdf.svg'
                    alt={file.name}
                    width={24}
                    height={24}
                    unoptimized={true}
                    className="w-8 h-8 object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-800">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {file.size}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <ConfirmDeleteModal
          open={isModalOpen}
          onConfirm={() => {
            if (pendingStatus) {
              setCurrentStatus(pendingStatus);
            }
            setIsModalOpen(false);
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setPendingStatus(null);
          }}
          title="Update Status"
          confirmText="Confirm"
          name={`Issue #${issue.id}`}
          actionType={pendingStatus === "Rejected" ? "reject" : "accept"}
          customDescription={
            <span className="flex flex-col gap-3 text-sm text-gray-500 mt-2 block">
              <span className="text-center block">
                Are you sure you want to change the status of this issue?
              </span>
              <span className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2 text-left font-medium block">
                <span className="block">
                  <span className="text-gray-400 font-semibold text-[10px] uppercase tracking-wider block">Ticket ID</span>
                  <span className="text-[#16284F] text-sm font-bold block">{issue.id}</span>
                </span>
                <span className="block">
                  <span className="text-gray-400 font-semibold text-[10px] uppercase tracking-wider block">Title</span>
                  <span className="text-gray-700 text-sm font-semibold block">{issue.title}</span>
                </span>
                <span className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between block">
                  <span className="flex flex-col gap-0.5 block">
                    <span className="text-gray-400 font-semibold text-[9px] uppercase tracking-wider block">From</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-center w-fit block ${getStatusColor(currentStatus)}`}>
                      {currentStatus}
                    </span>
                  </span>
                  <span className="text-gray-400 font-bold text-lg block">➔</span>
                  <span className="flex flex-col gap-0.5 items-end block">
                    <span className="text-gray-400 font-semibold text-[9px] uppercase tracking-wider block">To</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-center w-fit block ${pendingStatus ? getStatusColor(pendingStatus) : ""}`}>
                      {pendingStatus}
                    </span>
                  </span>
                </span>
              </span>
            </span>
          }
        />
      )}
    </div>
  );
}
