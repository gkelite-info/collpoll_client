'use client'
import { useState } from "react";
import NewFolderModal from "../../finance/drive/components/modal/newFolderModal";
import { FolderItemProps } from "../../finance/drive/page";
import { foldersMock } from "../../finance/drive/mockData";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import ActionBar from "../../finance/drive/components/actionBar";
import Table from "@/app/utils/table";
import { ArrowDownIcon } from "@phosphor-icons/react";

type SortOption = "latest" | "name" | "size";

type AdminDriveProps = {
    education: string
    totalFiles: number;
    totalSize: number;
}

export default function Drive({ education, totalFiles, totalSize }: AdminDriveProps) {

    const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
    const [folders, setFolders] = useState<FolderItemProps[]>(foldersMock);
    const [sortBy, setSortBy] = useState<SortOption>("latest");

    const handleCreateFolder = (data: { name: string; color: string }) => {
        setFolders((prev) => {
            const maxId = prev.reduce((m, f) => Math.max(m, f.id), 0);
            const newFolder: FolderItemProps = {
                id: maxId + 1,
                name: data.name,
                color: data.color,
                filesCount: 0,
                sizeLabel: "0 MB",
            };
            return [...prev, newFolder];
        });
        setIsNewFolderOpen(false);
    };

    const driveCard = [
        {
            education: "B.Tech",
            totalFiles: 23,
            totalSize: 137
        },
        {
            education: "M.Tech",
            totalFiles: 18,
            totalSize: 92,
        },
        {
            education: "MBA",
            totalFiles: 31,
            totalSize: 215,
        },
        {
            education: "B.Sc",
            totalFiles: 12,
            totalSize: 64,
        },
        {
            education: "M.Sc",
            totalFiles: 20,
            totalSize: 148,
        },
        {
            education: "B.Com",
            totalFiles: 27,
            totalSize: 176,
        },
        {
            education: "M.Com",
            totalFiles: 14,
            totalSize: 88,
        },
        {
            education: "BA",
            totalFiles: 9,
            totalSize: 42,
        },
        {
            education: "MA",
            totalFiles: 16,
            totalSize: 103,
        },
        {
            education: "PhD",
            totalFiles: 7,
            totalSize: 56,
        },
        {
            education: "Inter",
            totalFiles: 7,
            totalSize: 96,
        },
    ];

    const tableColumns = [
        "File Name",
        "Type",
        "Size",
        "Uploaded on",
        "Actions"
    ];

    const tableData = [
        {
            "File Name": "Semester 1 Syllabus.pdf",
            "Type": "PDF",
            "Size": "2.3 MB",
            "Uploaded on": "12 Jan 2024",
            "Actions": <>
                <div className="bg-pink-00 flex items-center justify-center">
                    <div className="p-1 rounded-full bg-[#DCEBE3] flex items-center justify-center cursor-pointer self-start">
                        <ArrowDownIcon size={17} color="#43C17A" />
                    </div>
                </div>
            </>,
        },
        {
            "File Name": "Time Table.xlsx",
            "Type": "Excel",
            "Size": "1.1 MB",
            "Uploaded on": "18 Jan 2024",
            "Actions": <>
                <div className="bg-pink-00 flex items-center justify-center">
                    <div className="p-1 rounded-full bg-[#DCEBE3] flex items-center justify-center cursor-pointer self-start">
                        <ArrowDownIcon size={17} color="#43C17A" />
                    </div>
                </div>
            </>,
        },
        {
            "File Name": "Internal Marks.docx",
            "Type": "Word",
            "Size": "860 KB",
            "Uploaded on": "02 Feb 2024",
            "Actions": <>
                <div className="bg-pink-00 flex items-center justify-center">
                    <div className="p-1 rounded-full bg-[#DCEBE3] flex items-center justify-center cursor-pointer self-start">
                        <ArrowDownIcon size={17} color="#43C17A" />
                    </div>
                </div>
            </>,
        },
        {
            "File Name": "Project Guidelines.pdf",
            "Type": "PDF",
            "Size": "3.8 MB",
            "Uploaded on": "10 Feb 2024",
            "Actions": <>
                <div className="bg-pink-00 flex items-center justify-center">
                    <div className="p-1 rounded-full bg-[#DCEBE3] flex items-center justify-center cursor-pointer self-start">
                        <ArrowDownIcon size={17} color="#43C17A" />
                    </div>
                </div>
            </>,
        },
        {
            "File Name": "Attendance Sheet.xlsx",
            "Type": "Excel",
            "Size": "980 KB",
            "Uploaded on": "20 Feb 2024",
            "Actions": <>
                <div className="bg-pink-00 flex items-center justify-center">
                    <div className="p-1 rounded-full bg-[#DCEBE3] flex items-center justify-center cursor-pointer self-start">
                        <ArrowDownIcon size={17} color="#43C17A" />
                    </div>
                </div>
            </>,
        },
    ];


    return (
        <>
            <div className="bg-red-00 flex flex-col pb-5 p-2">
                <NewFolderModal
                    open={isNewFolderOpen}
                    onCancel={() => setIsNewFolderOpen(false)}
                    onSave={handleCreateFolder}
                />
                <div className="w-full mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#282828]">Drive</h1>
                        <p className="text-[#282828]">Manage, organize & monitor all academic and administrative files</p>
                    </div>
                    <div className="flex w-[32%] justify-end">
                        <CourseScheduleCard
                            style="w-[320px]"
                            isVisibile={false}
                        />
                    </div>
                </div>
                <div className="bg-yellow-00">
                    <ActionBar
                        sortBy={sortBy}
                        onSort={(val) => setSortBy(val as SortOption)}
                        onNew={() => setIsNewFolderOpen(true)}
                        onFilters={() => console.log("Filters")}
                        isVisible={false}
                    />
                </div>
                <div className="bg-green-00 mt-5 flex flex-col">
                    <h3 className="text-[#282828] text-lg font-medium">Folders</h3>
                    <div className="bg-red-00 lg:h-[50vh] grid grid-rows-2 grid-flow-col auto-cols-max overflow-x-auto lg:gap-6 py-2">
                        {driveCard.map((item, index) => (
                            <div className="bg-white rounded-md p-3 gap-2 flex flex-col w-[220px] shrink-0" key={index}>
                                <img
                                    src="/drive.jpg"
                                    alt="drive"
                                    height={60}
                                    width={60}
                                    className="cursor-pointer"
                                />
                                <p className="text-[#282828] font-medium">{item.education}</p>
                                <p className="text-[#5D5D5D] text-sm">{item.totalFiles} Files <span className="text-[#5D5D5D] text-sm">.</span> <span className="text-[#5D5D5D] text-sm">{item.totalSize} MB</span></p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-red-00">
                        <Table
                            columns={tableColumns}
                            data={tableData}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}