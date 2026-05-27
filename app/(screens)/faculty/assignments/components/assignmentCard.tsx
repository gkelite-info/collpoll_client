"use client";

import { Book, CalendarDots, Trash, CaretDown } from "@phosphor-icons/react";
import { TfiPencil } from "react-icons/tfi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDeleteModal from "./confirmDeleteModal";
import { Assignment } from "./left";
import { motion, AnimatePresence } from "framer-motion";

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
  onDelete: (id: number) => Promise<void> | void;
};

export default function AssignmentCard({
  cardProp,
  activeView,
  onEdit,
  onDelete,
}: AssignmentCardProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const accordionVariants = {
    collapsed: { height: 0, opacity: 0, marginTop: 0 },
    expanded: { height: "auto", opacity: 1, marginTop: "0.5rem" },
  };

  const iconVariants = {
    collapsed: { rotate: 0 },
    expanded: { rotate: 180 },
  };

  return (
    <div className="flex flex-col gap-3">
      {cardProp.map((item, index) => (
        <div key={index} className="w-full">
          {/* Desktop View */}
          <div className="hidden md:flex bg-white w-full rounded-xl p-4 gap-4 shadow-sm mb-3">
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
                      className="text-[#43C17A] text-sm cursor-pointer hover:underline"
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
                    {item.totalSubmitted} / {item.totalSubmissions}
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

          {/* Mobile View */}
            <div className="md:hidden flex flex-col bg-white rounded-xl p-3 shadow-sm border border-gray-100 w-full">
              <div className="flex gap-3">
                <div className="w-[70px] h-[70px] rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col min-w-0 py-0.5">
                  <div className="flex justify-between items-start w-full">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#282828] font-bold text-[15px] truncate leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-gray-800 text-[13px] font-medium truncate mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        className="w-[20px] h-[20px] rounded-full border border-[#43C17A] flex items-center justify-center text-[#43C17A] cursor-pointer"
                      >
                        <TfiPencil size={10} />
                      </button>
                      {activeView === "active" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(item.assignmentId ?? null);
                          }}
                          className="w-[20px] h-[20px] rounded-full border border-red-500 flex items-center justify-center text-red-500 cursor-pointer"
                        >
                          <Trash size={10} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedIndex(expandedIndex === index ? null : index);
                        }}
                        className="w-[20px] h-[20px] rounded-full bg-[#43C17A] flex items-center justify-center text-white cursor-pointer shadow-sm"
                      >
                        <motion.div
                          variants={iconVariants}
                          animate={expandedIndex === index ? "expanded" : "collapsed"}
                          transition={{ duration: 0.3 }}
                          className="flex items-center justify-center"
                        >
                          <CaretDown size={12} weight="bold" />
                        </motion.div>
                      </button>
                    </div>
                  </div>

                  <div className="mt-auto pt-1.5 flex justify-between items-center w-full">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-medium">
                        Submissions:
                      </span>
                      <span className="bg-[#E2F3E9] text-[#43C17A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.totalSubmitted} / {item.totalSubmissions}
                      </span>
                    </div>
                    <h4
                      className="text-[#43C17A] text-[11px] font-semibold cursor-pointer underline"
                      onClick={() =>
                        router.push(`/faculty/assignments/${item.assignmentId}`)
                      }
                    >
                      View Submissions
                    </h4>
                  </div>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {expandedIndex === index && (
                  <motion.div
                    key="content"
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={accordionVariants}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-y-1.5 mt-1 border-t border-gray-100 pt-2 w-full">
                      <div className="flex justify-between items-center text-[10px] text-gray-600 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <CalendarDots size={14} className="text-[#43C17A] shrink-0" />
                          <span className="truncate">
                            {formatDate(item.fromDate)} - {formatDate(item.toDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#16284F]">Total Marks:</span>
                          <span className="bg-[#16284F] text-white px-2 py-0.5 rounded font-bold">
                            {item.marks ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
      ))}

          {deleteId !== null && (
            <ConfirmDeleteModal
              open={true}
              isDeleting={isDeleting}
              name="assignment"
              onCancel={() => {
                if (!isDeleting) setDeleteId(null);
              }}
              onConfirm={async () => {
                if (deleteId) {
                  setIsDeleting(true);
                  await onDelete(deleteId);
                  setIsDeleting(false);
                  setDeleteId(null);
                }
              }}
            />
          )}
        </div>
      );
}
