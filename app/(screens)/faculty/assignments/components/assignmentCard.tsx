"use client";

import { Book, CalendarDots, Trash } from "@phosphor-icons/react";
import { TfiPencil } from "react-icons/tfi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDeleteModal from "./confirmDeleteModal";
import { Assignment } from "./left";

function formatDate(dateValue: number | string) {
  if (!dateValue) return "";

  const str = dateValue.toString();

  if (/^\d{8}$/.test(str)) {
    const year = str.substring(0, 4);
    const month = str.substring(4, 6);
    const day = str.substring(6, 8);
    return `${day}/${month}/${year}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split("-");
    return `${day}/${month}/${year}`;
  }

  return str;
}

type AssignmentCardProps = {
  cardProp: Assignment[];
  activeView: "active" | "previous";
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: number) => void;
};

export default function AssignmentCard({
  cardProp,
  activeView,
  onEdit,
  onDelete,
}: AssignmentCardProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {cardProp.map((item, index) => (
        <div
          key={index}
          className="bg-white w-full rounded-xl flex p-4 gap-4 shadow-sm"
        >
          <div className="h-[140px] w-[150px] rounded-lg overflow-hidden shrink-0">
            <img
              src={item.image}
              className="h-full w-full object-cover"
              alt={item.title}
            />
          </div>

          <div className="flex flex-1 flex-col justify-between">
            <div className="flex justify-between">
              <div className="flex flex-col gap-1 max-w-[65%]">
                <h5 className="text-[#111827] font-semibold text-lg">
                  {item.title}
                </h5>

                <p className="text-[#111827] text-sm line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <div className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center">
                    <CalendarDots className="text-[#57C788]" />
                  </div>

                  <p className="text-[#474747] text-sm">
                    {formatDate(item.fromDate)} - {formatDate(item.toDate)}
                  </p>
                </div>
              </div>

              {/* Top-right actions */}
              <div className="flex flex-col items-end pt-1 pr-1">
                <div className="flex items-center gap-4">
                  <div
                    className="rounded-full bg-[#E2F3E9] p-2 cursor-pointer"
                    onClick={() => onEdit(item)}
                  >
                    <TfiPencil className="text-[#57C788]" />
                  </div>

                  {activeView === "active" && (
                    <div
                      className="rounded-full bg-[#F6E3E3] p-2 cursor-pointer"
                      onClick={() => setDeleteId(item.assignmentId ?? null)}
                    >
                      <Trash className="text-[#C14343]" />
                    </div>
                  )}

                  <h4
                    className="text-[#43C17A] text-sm cursor-pointer underline"
                    onClick={() =>
                      router.push(`/faculty/assignments/${item.assignmentId}`)
                    }
                  >
                    View Submissions
                  </h4>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-[#E2F3E9] p-1.5">
                  <Book className="text-[#57C788]" />
                </div>

                <p className="text-[#474747] text-sm">Total Submissions</p>

                <span className="text-[#44C07A] text-sm font-semibold">
                  {item.totalSubmissions} / {item.totalSubmitted}
                </span>
              </div>

              <div className="flex overflow-hidden rounded-md">
                <div className="bg-[#16284F] text-white px-3 py-2 flex items-center text-sm font-bold">
                  {item.marks ?? 0}
                </div>
                <div className="bg-[#E3E5EA] text-[#16284F] px-3 flex items-center text-xs font-semibold">
                  Total Marks
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {deleteId !== null && (
        <ConfirmDeleteModal
          onCancel={() => setDeleteId(null)}
          onConfirm={() => {
            if (deleteId) onDelete(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}
