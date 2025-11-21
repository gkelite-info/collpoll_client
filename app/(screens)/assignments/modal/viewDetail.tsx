"use client";

import { PaperPlaneRight } from "@phosphor-icons/react";
import { FiDownload } from "react-icons/fi";

type AssignmentDetailsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    card: any;
};

export default function ViewDetailModal({ isOpen, onClose, card }: AssignmentDetailsModalProps) {

    if (!isOpen || !card) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
            <div className="bg-white lg:w-fit lg:h-fit lg:p-5 lg:rounded-xl lg:relative lg:shadow-lg">
                <div className="bg-red-00 w-full flex items-center justify-between lg:gap-2">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={onClose}
                            className="text-[#282828] hover:text-black text-xl cursor-pointer"
                        >
                            ✕
                        </button>
                        <h4 className="text-[#282828] font-semibold text-lg">Assignment Details View</h4>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="lg:rounded-full p-2 bg-[#E2F3E9] cursor-pointer">
                            <FiDownload className="text-[#43C17A]" />
                        </div>
                        <div className="flex justify-between items-center gap-2 bg-[#16284F] rounded-lg px-3 py-1.5 cursor-pointer">
                            <div className="lg:p-1 lg:rounded-full bg-white flex items-center justify-center">
                                <PaperPlaneRight size={15} weight="fill" color="16284F" />
                            </div>
                            <p className="text-white lg:font-medium text-md">Submit</p>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-00 mt-3 flex">
                    <div className="flex flex-col w-[30%] justify-start bg-blue-00">
                        <h2 className="text-md font-regular text-[#111827] mb-3">
                            <strong className="font-medium">Assignment Title:</strong>
                        </h2>
                        <h2 className="text-md font-regular text-[#111827] mb-3">
                            <strong className="font-medium">Subject:</strong>
                        </h2>
                        <p className="text-md font-regular text-[#111827] mb-3">
                            <strong className="font-medium">Faculty:</strong>
                        </p>
                        <p className="text-md font-regular text-[#111827] mb-3">
                            <strong className="font-medium">Posted on:</strong>
                        </p>
                        <p className="text-md font-regular text-[#111827]">
                            <strong className="font-medium">Deadline:</strong>
                        </p>
                    </div>

                    <div className="bg-yellow-00 w-[70%] py-1">
                        <p className="text-[#474747] text-sm mb-4">{card.assignmentTitle}</p>
                        <p className="text-[#474747] text-sm mb-4">{card.title}</p>
                        <p className="text-[#474747] text-sm mb-4">{card.professor}</p>
                        <p className="text-[#474747] text-sm mb-4">{card.fromDate}</p>
                        <p className="text-[#474747] text-sm">{card.toDate}</p>

                    </div>
                </div>
                <div className="bg-indigo-00 mt-2">
                    <h3 className="text-[#282828] font-semibold text-lg">Instructions</h3>
                    <ul className="list-disc ml-4">
                        <li className="text-[#474747] text-sm">
                            Prepare a detailed case study on various process scheduling algorithms (FCFS, SJF, Priority, Round Robin).
                        </li>
                        <li className="text-[#474747] text-sm">
                            Include comparative analysis with CPU utilization and waiting time.
                        </li>
                        <li className="text-[#474747] text-sm">
                            Submit your report in PDF format with proper documentation and charts.
                        </li>
                    </ul>
                    <h3 className="text-[#282828] font-semibold text-lg mt-2">Attachment: <span className="text-[#474747] font-medium text-sm cursor-pointer">{card.videoLink}</span></h3>
                </div>
            </div>
        </div >
    );
}
