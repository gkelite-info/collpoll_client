import {
  Article,
  Briefcase,
  Buildings,
  CalendarBlank,
  Globe,
  Link as LinkIcon,
  MapPin,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import React from "react";
import { InternshipFormData } from "./internshipForm";

interface InternshipCardProps {
  data: InternshipFormData;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const InternshipCard: React.FC<InternshipCardProps> = ({
  data,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  return (
    <div className="w-full bg-white border  border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 relative group">
      <div className="absolute top-5 right-2 flex gap-2 justify-between items-center">
        <button
          onClick={onEdit}
          disabled={isDeleting}
          className="p-1.5 text-gray-400 hover:text-[#43C17A] hover:bg-emerald-50 rounded transition-colors"
          type="button"
          title="Edit"
        >
          <PencilSimple size={18} />
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          type="button"
          title="Delete"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash size={18} />
          )}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pr-16">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Buildings
              size={20}
              weight="duotone"
              className="text-emerald-600"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              {data.organization}
            </h3>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <Briefcase size={14} />
              <span className="text-xs font-medium uppercase tracking-wide">
                {data.role}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 self-start sm:self-center">
          <CalendarBlank size={14} />
          <span>
            {formatDate(data.startDate)} —{" "}
            {data.endDate ? formatDate(data.endDate) : "Present"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3 px-1 text-xs text-gray-600 border-b border-gray-50 pb-3">
        <div className="flex items-center gap-1.5">
          <Globe size={14} className="text-gray-400" />
          <span>{data.domain}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-gray-400" />
          <span>{data.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <LinkIcon size={14} className="text-gray-400" />
          <span className="font-medium text-gray-700">{data.projectName}</span>
          {data.projectUrl && (
            <a
              href={data.projectUrl}
              target="_blank"
              className="text-emerald-600 hover:underline"
              rel="noreferrer"
            >
              (Link)
            </a>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Article size={16} className="text-gray-300 mt-0.5 shrink-0" />
        <p className="text-sm text-gray-600 leading-snug line-clamp-2 hover:line-clamp-none transition-all cursor-default">
          {data.description}
        </p>
      </div>
    </div>
  );
};

export default InternshipCard;
