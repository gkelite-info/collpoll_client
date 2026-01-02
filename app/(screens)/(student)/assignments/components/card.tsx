"use client";

import { useState } from "react";
import { CalendarDots, LinkSimpleHorizontal, UserCircle } from "@phosphor-icons/react";
import { FiDownload } from "react-icons/fi";
import { TfiPencil } from "react-icons/tfi";
import { FaPlus } from "react-icons/fa6";
import ViewDetailModal from "../modal/viewDetail";
import UploadModal from "../modal/uploadModal";

export type CardProp = {
     assignmentId: number | string;
    image: string;
    title: string;
    description: string;
    fromDate: string;
    toDate: string;
    professor: string;
    videoLink: string;
    marksScored?: number;
    marksTotal?: number;
    assignmentTitle?: string;
};

type AssignmentCardProps = {
    cardProp: CardProp[];
    activeView: "active" | "previous";
};

export default function AssignmentCard({ cardProp, activeView }: AssignmentCardProps) {
    const [uploadedFiles, setUploadedFiles] = useState<{ [key: number]: string }>({});
    const [showModal, setShowModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CardProp | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

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

    return (
        <>
            {cardProp.map((item, index) => (
                <div
                    className="bg-white w-full h-[170px] rounded-xl flex items-center p-3 gap-3 mb-3"
                    key={index}
                >
                    <div className="h-[139px] w-[145px] rounded-lg overflow-hidden">
                        <img src={item.image} className="h-full w-full object-cover" />
                    </div>

                    <div className="h-[139px] w-[520px] flex flex-col justify-between">
                        <div className="w-full h-[75%] flex">
                            <div className="w-[60%] flex flex-col pt-1 gap-1">
                                <h5 className="text-[#111827] font-semibold text-lg">{item.title}</h5>
                                <p className="text-[#111827] font-medium text-sm">{item.description}</p>

                                <div className="flex items-center gap-2 mt-auto pb-2">
                                    <div className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center">
                                        <CalendarDots className="text-md text-[#57C788]" />
                                    </div>
                                    <p className="text-[#474747] text-sm">
                                        {item.fromDate} - {item.toDate}
                                    </p>
                                </div>
                            </div>

                            <div className="w-[40%] flex flex-col justify-between">
                                <div className="flex items-center justify-center gap-5">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center cursor-pointer">
                                            <FiDownload className="text-md text-[#57C788]" />
                                        </div>
                                        {activeView === "active" && (
                                            <div className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center cursor-pointer">
                                                <TfiPencil className="text-md text-[#57C788]" />
                                            </div>
                                        )}
                                    </div>

                                    <h4
                                        className="text-[#43C17A] font-medium cursor-pointer"
                                        onClick={() => openModal(item)}
                                    >
                                        View Details
                                    </h4>
                                </div>

                                {activeView === "previous" && (
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="rounded-full w-[55px] h-[55px] bg-[#16284F] flex flex-col items-center justify-center relative">
                                            <p style={{ fontSize: 14, color: "white" }}>{item.marksScored}</p>
                                            <p style={{ fontSize: 14, color: "white" }}>{item.marksTotal}</p>

                                            <style jsx>{`
                                                div::before {
                                                    content: "";
                                                    position: absolute;
                                                    width: 70%;
                                                    height: 1px;
                                                    background: white;
                                                    top: 50%;
                                                    left: 50%;
                                                    transform: translate(-50%, -50%);
                                                    opacity: 0.7;
                                                }
                                            `}</style>
                                        </div>
                                        <p className="text-xs text-[#282828] font-regular mt-0.5">Marks</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center cursor-pointer">
                                    <UserCircle className="text-md text-[#57C788]" />
                                </div>
                                <p className="text-[#474747] text-xs">{item.professor}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-[#E2F3E9] p-1.5 flex items-center justify-center cursor-pointer">
                                    <LinkSimpleHorizontal className="text-md text-[#57C788]" />
                                </div>
                                <p className="text-[#474747] text-xs">{item.videoLink}</p>
                            </div>

                            {activeView === "active" && (
                                <div className="flex items-center gap-2">
                                    {uploadedFiles[index] ? (
                                        <div className="flex items-center bg-[#E2F3E9] rounded-full px-2 py-1 gap-2 max-w-[210px]">

                                            {/* ✅ CLICK TO DOWNLOAD */}
                                            <a
                                                href={uploadedFiles[index]}
                                                target="_blank"
                                                className="text-[#43C17A] text-xs underline truncate"
                                                title="Download file"
                                            >
                                                {uploadedFiles[index].split("/").pop()}   {/* show only filename */}
                                            </a>

                                            {/* 🔁 EDIT (RE-UPLOAD) */}
                                            <button
                                                className="text-blue-500 text-xs font-bold px-1 cursor-pointer"
                                                title="Re-upload file"
                                                onClick={() => openUploadModal(index)}
                                            >
                                                ↻
                                            </button>

                                            {/* ❌ DELETE */}
                                            <button
                                                className="text-red-500 font-bold text-xs px-1 cursor-pointer"
                                                onClick={() =>
                                                    setUploadedFiles(prev => {
                                                        const updated = { ...prev };
                                                        delete updated[index];
                                                        return updated;
                                                    })
                                                }
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex items-center rounded-full px-2 py-1 bg-[#E2F3E9] gap-1 cursor-pointer"
                                            onClick={() => openUploadModal(index)}
                                        >
                                            <p className="text-[#43C17A] text-xs">Upload</p>
                                            <FaPlus size={8} className="text-[#43C17A]" />
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            <ViewDetailModal isOpen={showModal} onClose={closeModal} card={selectedCard} />

            <UploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUpload={(fileName, idx) =>
                    setUploadedFiles(prev => ({ ...prev, [idx]: fileName }))
                }
                card={uploadingIndex !== null ? cardProp[uploadingIndex] : undefined}
                index={uploadingIndex ?? undefined}
            />
        </>
    );
}
