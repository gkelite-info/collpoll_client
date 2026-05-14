"use client";

import { useEffect, useState } from "react";
import {
  CalendarDots,
  LinkSimpleHorizontal,
  UserCircle,
  CaretDown,
} from "@phosphor-icons/react";
import { FiDownload } from "react-icons/fi";
import { TfiPencil } from "react-icons/tfi";
import ViewDetailModal from "../modal/viewDetail";
import UploadModal from "../modal/uploadModal";
import { supabase } from "@/lib/supabaseClient";
import { downloadAssignmentFile } from "@/app/utils/storageActions";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

async function downloadFile(filePath: string) {
  try {
    const { data, error } = await supabase.storage
      .from("student_submissions")
      .download(filePath);

    if (error) {
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filePath.split("/").pop() || "file";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {}
}

export type CardProp = {
  assignmentId: number | string;
  image: string;
  title: string;
  studentId: number;
  subjectName?: string;
  topicName: string;
  description: string;
  fromDate: string;
  toDate: string;
  professor: string;
  videoLink: string;
  marksScored?: number | null;
  marksTotal?: number;
  assignmentTitle?: string;
  existingFilePath?: string | null;
};

type AssignmentCardProps = {
  cardProp: CardProp[];
  activeView: "active" | "previous";
};

export default function AssignmentCard({
  cardProp,
  activeView,
}: AssignmentCardProps) {
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: number]: string }>(
    {},
  );
  const t = useTranslations("Assignment.student");

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const map: { [key: number]: string } = {};
    cardProp.forEach((item, idx) => {
      if (item.existingFilePath) map[idx] = item.existingFilePath;
    });
    setUploadedFiles((prev) => ({ ...prev, ...map }));
  }, [cardProp]);

  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardProp | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const openModal = (item: CardProp) => {
    setSelectedCard(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  const openUploadModal = (index: number) => {
    setUploadingIndex(index);
    setShowUploadModal(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setUploadingIndex(index);
    setShowUploadModal(true);
  };

  const handleDownload = async (index: number, item: CardProp) => {
    try {
      const storedPath = item.existingFilePath ?? uploadedFiles[index];

      if (!storedPath) {
        toast.error(t("No uploaded file found!"));
        return;
      }

      const fileName = storedPath.split("/").pop();

      if (!fileName) {
        toast.error(t("Invalid file path!"));
        return;
      }

      toast.loading(t("Downloading file..."), { id: "download" });
      await downloadAssignmentFile(Number(item.assignmentId), fileName);
      toast.success(t("File downloaded successfully!"), { id: "download" });
    } catch (error) {
      toast.error(t("Download failed!"));
    }
  };

  const accordionVariants = {
    collapsed: { height: 0, opacity: 0, marginTop: 0 },
    expanded: { height: "auto", opacity: 1, marginTop: "0.5rem" },
  };

  const iconVariants = {
    collapsed: { rotate: 0 },
    expanded: { rotate: 180 },
  };

  return (
    <>
      {cardProp.map((item, index) => (
        <div key={index} className="w-full">
          <div className="hidden md:flex bg-white w-full h-[170px] rounded-xl items-center p-3 gap-3 mb-3">
            <div className="h-[139px] w-[145px] rounded-lg overflow-hidden shrink-0">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="h-[139px] w-full flex flex-col justify-between min-w-0">
              <div className="w-full h-[75%] flex">
                <div className="w-[60%] flex flex-col pt-1 gap-1 pr-2">
                  <h5 className="text-[#111827] font-semibold text-lg truncate">
                    {item.title}
                  </h5>
                  <p className="text-[#111827] font-medium text-sm truncate">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 mt-auto pb-2">
                    <div className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center">
                      <CalendarDots className="text-md text-[#57C788]" />
                    </div>
                    <p className="text-[#474747] text-sm">
                      {item.fromDate} - {item.toDate}
                    </p>
                  </div>
                </div>

                <div className="w-[40%] flex flex-col justify-between items-end">
                  <div className="flex items-center justify-end gap-3 w-full">
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center cursor-pointer"
                        onClick={() => handleDownload(index, item)}
                      >
                        <FiDownload className="text-md text-[#57C788]" />
                      </div>

                      {activeView === "active" && (
                        <div
                          className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center cursor-pointer"
                          onClick={() => handleEdit(index)}
                        >
                          <TfiPencil className="text-md text-[#57C788]" />
                        </div>
                      )}
                    </div>

                    <h4
                      className="text-[#43C17A] font-medium cursor-pointer ml-2"
                      onClick={() => openModal(item)}
                    >
                      {t("View Details")}
                    </h4>
                  </div>

                  {activeView === "previous" && (
                    <div className="flex flex-col items-center justify-center mt-auto pb-1 mr-4">
                      <div className="rounded-full w-[62px] h-[62px] bg-[#16284F] flex flex-col items-center justify-center px-1">
                        <p className="text-white text-[14px] font-medium leading-none">
                          {item.marksScored ?? "-"}
                        </p>
                        <span className="my-1 h-px w-9 bg-white/70" />
                        <p className="text-white text-[14px] font-medium leading-none">
                          {item.marksTotal ?? "-"}
                        </p>
                      </div>
                      <p className="text-xs text-[#282828] font-regular mt-0.5">
                        {t("Marks")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-5 mt-auto">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center cursor-pointer">
                    <UserCircle className="text-md text-[#57C788]" />
                  </div>
                  <p className="text-[#474747] text-xs truncate max-w-[120px]">
                    {item.professor}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center cursor-pointer">
                    <LinkSimpleHorizontal className="text-md text-[#57C788]" />
                  </div>
                  <p className="text-[#474747] text-xs truncate max-w-[150px]">
                    {item.videoLink}
                  </p>
                </div>

                {activeView === "active" && (
                  <div className="flex items-center gap-1 -ml-2">
                    {uploadedFiles[index] ? (
                      <div className="flex items-center bg-[#E2F3E9] rounded-full px-3 py-1 max-w-[210px]">
                        <span
                          onClick={() => downloadFile(uploadedFiles[index])}
                          className="text-[#43C17A] text-xs underline truncate cursor-pointer"
                          title={uploadedFiles[index]}
                        >
                          {uploadedFiles[index].split("/").pop()}
                        </span>
                      </div>
                    ) : (
                      <div
                        className="flex items-center rounded-full px-2 py-1 bg-[#E2F3E9] cursor-pointer"
                        onClick={() => openUploadModal(index)}
                      >
                        <p className="text-[#43C17A] text-xs font-semibold">
                          {t("Upload")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden flex flex-col bg-white rounded-xl p-3 mb-4 shadow-sm border border-gray-100 w-full">
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
                      {item.subjectName || "Subject"}
                    </h3>
                    <p className="text-gray-800 text-[13px] font-medium truncate mt-0.5 leading-snug">
                      {item.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(index, item);
                      }}
                      className="w-[20px] h-[20px] rounded-full border border-[#43C17A] flex items-center justify-center text-[#43C17A] cursor-pointer"
                    >
                      <FiDownload size={10} strokeWidth={3} />
                    </button>
                    {activeView === "active" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(index);
                        }}
                        className="w-[20px] h-[20px] rounded-full border border-[#43C17A] flex items-center justify-center text-[#43C17A] cursor-pointer"
                      >
                        <TfiPencil size={10} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedIndex(
                          expandedIndex === index ? null : index,
                        );
                      }}
                      className="w-[20px] h-[20px] rounded-full bg-[#43C17A] flex items-center justify-center text-white cursor-pointer shadow-sm"
                    >
                      <motion.div
                        variants={iconVariants}
                        animate={
                          expandedIndex === index ? "expanded" : "collapsed"
                        }
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center"
                      >
                        <CaretDown size={12} weight="bold" />
                      </motion.div>
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-[11px] font-medium truncate mt-1">
                  {item.description}
                </p>

                <div className="mt-auto pt-1.5 flex justify-between items-center w-full">
                  {activeView === "active" ? (
                    <>
                      {uploadedFiles[index] ? (
                        <div className="bg-[#E2F3E9] text-[#43C17A] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit border border-[#43C17A]/20">
                          {t("Uploaded")}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openUploadModal(index);
                          }}
                          className="bg-[#E2F3E9] text-[#43C17A] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit border border-[#43C17A]/20 cursor-pointer"
                        >
                          {t("Upload")} +
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-medium">
                        Marks :
                      </span>
                      <span className="bg-[#16284F] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {item.marksScored ?? "-"}/{item.marksTotal ?? "-"}
                      </span>
                    </div>
                  )}
                  <h4
                    className="text-[#43C17A] text-[11px] font-semibold cursor-pointer"
                    onClick={() => openModal(item)}
                  >
                    {t("View Details")}
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
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600 min-w-0">
                      <CalendarDots
                        size={14}
                        className="text-[#43C17A] shrink-0"
                      />
                      <span className="truncate">
                        {item.fromDate} - {item.toDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600 min-w-0">
                      <UserCircle
                        size={14}
                        className="text-[#43C17A] shrink-0"
                      />
                      <span className="truncate">{item.professor}</span>
                    </div>
                    {(item.videoLink || uploadedFiles[index]) && (
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-600 min-w-0 mt-0.5">
                        <LinkSimpleHorizontal
                          size={14}
                          className="text-[#43C17A] shrink-0"
                        />
                        <span className="truncate text-emerald-600 underline">
                          {uploadedFiles[index]
                            ? uploadedFiles[index].split("/").pop()
                            : item.videoLink || "Resource Link"}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}

      <ViewDetailModal
        isOpen={showModal}
        onClose={closeModal}
        card={selectedCard}
        submissionFileName={
          selectedCard
            ? (uploadedFiles[
                cardProp.findIndex(
                  (c) => c.assignmentId === selectedCard.assignmentId,
                )
              ] ??
              selectedCard.existingFilePath ??
              undefined)
            : undefined
        }
      />

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setEditingIndex(null);
        }}
        onUpload={(filePath, idx) => {
          setUploadedFiles((prev) => ({ ...prev, [idx]: filePath }));
          setShowUploadModal(false);
        }}
        card={uploadingIndex !== null ? cardProp[uploadingIndex] : undefined}
        index={uploadingIndex ?? undefined}
        existingFilePath={
          uploadingIndex !== null
            ? (uploadedFiles[uploadingIndex] ??
              cardProp[uploadingIndex]?.existingFilePath ??
              undefined)
            : undefined
        }
      />
    </>
  );
}
