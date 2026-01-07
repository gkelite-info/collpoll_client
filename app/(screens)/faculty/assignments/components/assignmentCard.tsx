"use client";

import { Book, CalendarDots, CaretRight, Trash } from "@phosphor-icons/react";
import { TfiPencil } from "react-icons/tfi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDeleteModal from "./confirmDeleteModal";
import { Assignment } from "../data";
//import { Assignment } from "./assignmentForm"; 
import { deleteFacultyAssignment } from "@/lib/helpers/faculty/deleteFacultyAssignment";
import toast from "react-hot-toast";



function formatDate(dateValue: number | string) {
  if (!dateValue) return "";

  const str = dateValue.toString();

  // Case 1: INT or numeric string YYYYMMDD (20250102)
  if (/^\d{8}$/.test(str)) {
    const year = str.substring(0, 4);
    const month = str.substring(4, 6).replace(/^0/, "");
    const day = str.substring(6, 8).replace(/^0/, "");
    return `${day}/${month}/${year}`;
  }

  // Case 2: HTML date format YYYY-MM-DD (2025-01-02)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split("-");
    return `${Number(day)}/${Number(month)}/${year}`;
  }

  return "";
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
    <div className="flex flex-col">
      {cardProp.map((item, index) => (
        <div
          key={index}
          className="bg-white relative w-full h-[170px] rounded-xl flex items-center p-3 gap-3 mb-3"
        >
          <div className="h-[139px] w-[145px] rounded-lg overflow-hidden">
            <img src={item.image} className="h-full w-full object-cover" />
          </div>

          <div className="h-[139px] w-[520px] flex flex-col justify-between">
            <div className="w-full h-[75%] flex">
              <div className="w-[60%] flex flex-col pt-1 gap-1">
                <h5 className="text-[#111827] font-semibold text-lg">
                  {item.title}
                </h5>
                <p className="text-[#111827] text-sm">{item.description}</p>

                <div className="flex items-center gap-2 mt-auto pb-2">
                  <div className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center">
                    <CalendarDots className="text-md text-[#57C788]" />
                  </div>
                  <p className="text-[#474747] text-sm">
                    {formatDate(item.fromDate)} - {formatDate(item.toDate)}
                  </p>
                </div>
              </div>

              <div className="w-[40%] flex flex-col justify-between">
                <div className="flex items-center justify-center gap-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center cursor-pointer"
                      onClick={() => onEdit(item)}
                    >
                      <TfiPencil className="text-md text-[#57C788]" />
                    </div>

                    {activeView === "active" && (
                      <div
                        className="rounded-full bg-[#F6E3E3] p-1.5 flex items-center justify-center cursor-pointer"
                        onClick={() => {
                          setDeleteId(item.assignmentId ?? null);
                          console.log("vamshi", item.assignmentId);
                        }}
                      >
                        <Trash className="text-md text-[#C14343]" />
                      </div>
                    )}
                  </div>
                  <h4
                    className="text-[#43C17A] text-sm cursor-pointer underline"
                    onClick={() => router.push(`/faculty/assignments/${item.assignmentId}`)}
                  >
                    View Submissions
                  </h4>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center cursor-pointer">
                  <Book className="text-md text-[#57C788]" />
                </div>
                <p className="text-[#474747] text-sm">Total Submissions</p>
                <span className="text-[#44C07A] text-sm font-semibold">
                  {`${item.totalSubmissions} / ${item.totalSubmitted}`}
                </span>
                <CaretRight className="text-[#454545]" size={16} />
              </div>
            </div>
          </div>

          <div className="absolute left-133.5 top-26 flex items-center justify-center overflow-hidden rounded-sm">
            <div className="bg-[#16284F] h-10 flex items-center text-white px-2 py-1 text-sm font-bold">
              {item.marks}
            </div>
            <div className="bg-[#E3E5EA] h-10 w-26 flex items-center justify-center text-[#16284F] py-1 text-xs font-semibold">
              Total Marks
            </div>
          </div>
        </div>
      ))}

      {deleteId !== null && (
        <ConfirmDeleteModal
          onCancel={() => setDeleteId(null)}
          onConfirm={() => {
            onDelete(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}
