import { ListDashes, PencilSimple, Trash } from "@phosphor-icons/react";
import Image from "next/image";
import type { StudentWellbeingIssueListItem } from "@/lib/helpers/wellbeingSupportIssues/types";

interface IssueCardProps {
  issue: StudentWellbeingIssueListItem;
  showActions?: boolean;
  onEdit?: (issue: StudentWellbeingIssueListItem) => void;
  onDelete?: (issue: StudentWellbeingIssueListItem) => void;
}

export default function IssueCard({
  issue,
  showActions = false,
  onEdit,
  onDelete,
}: IssueCardProps) {
  const canShowActions = showActions && issue.canModify;

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
        issue.status
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
          {canShowActions && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit?.(issue)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-[#16284F] shadow-sm transition-colors hover:bg-[#16284F] hover:text-white"
                title="Edit issue"
              >
                <PencilSimple size={16} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(issue)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-[#EF4444] shadow-sm transition-colors hover:bg-[#EF4444] hover:text-white"
                title="Delete issue"
              >
                <Trash size={16} weight="bold" />
              </button>
            </div>
          )}
          <span
            className={`px-3 py-1 rounded-sm text-xs font-bold ${getStatusColor(
              issue.status
            )}`}
          >
            {issue.status}
          </span>
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

      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-3">
        <span className="font-semibold text-gray-700 whitespace-nowrap">Description :</span>
        <p className="text-gray-500 leading-relaxed">
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
    </div>
  );
}
