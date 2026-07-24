"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { fetchProjectSubmissionsWithStudents } from "@/lib/helpers/student/student_project_submissionsAPI";
import TableComponent from "@/app/utils/table/table";
import { Avatar } from "@/app/utils/Avatar";
import toast from "react-hot-toast";
import { getSecureAttachmentUrl } from "@/lib/helpers/projects/projectFiles";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

export default function StudentProjectSubmissions() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    const projectTitle = searchParams.get("title")
        ? decodeURIComponent(searchParams.get("title")!)
        : "Project Submissions";

    useEffect(() => {
        const getSubmissions = async () => {
            if (!projectId) return;
            setIsLoading(true);
            try {
                const { data, total } = await fetchProjectSubmissionsWithStudents(Number(projectId), currentPage, itemsPerPage);

                const formattedData = data.map((item: any, index: number) => {
                    const student = item.students;
                    const user = student?.users;

                    const profileData = student?.users?.user_profile;
                    const profiles = Array.isArray(profileData) ? profileData : [profileData];
                    const activeProfile = profiles.find((profile: any) => profile && !profile.is_deleted);

                    const rollData = student?.student_pins;
                    
                    const pinNumber = Array.isArray(rollData)
                        ? rollData[0]?.pinNumber
                        : rollData?.pinNumber;
                        
                    const studentIdDisplay = pinNumber || "N/A";
                    
                    const startIndex = (currentPage - 1) * itemsPerPage;

                    return {
                        sno: startIndex + index + 1,
                        photo: (
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mx-auto border border-gray-100">
                                <Avatar
                                    src={activeProfile?.profileUrl}
                                    alt={user?.fullName || "Student"}
                                    size={30}
                                />
                            </div>
                        ),
                        name: user?.fullName || "Unknown Student",
                        rollNo: studentIdDisplay,
                        date: item.updatedAt ? format(new Date(item.updatedAt), "dd MMM yyyy") : "N/A",
                        file: (
                            <a
                                href={getSecureAttachmentUrl(item.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 font-semibold hover:underline"
                            >
                                View
                            </a>
                        ),
                    };
                });

                setSubmissions(formattedData);
                setTotalItems(total);
            } catch (error) {
                console.error("Error fetching submissions:", error);
                toast.error("Failed to load submissions", { id: "submissions-error" });
            } finally {
                setIsLoading(false);
            }
        };

        getSubmissions();
    }, [projectId, currentPage, itemsPerPage]);

    const columns = [
        { title: "S.No", key: "sno" },
        { title: "Photo", key: "photo" },
        { title: "Name", key: "name" },
        { title: "Roll/Admission No", key: "rollNo" },
        { title: "Submission Date", key: "date" },
        { title: "File", key: "file" },
    ];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:min-h-[480px]">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-[#16a34a] text-2xl font-bold">{projectTitle}</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {submissions.length} Total Submissions
                    </p>
                </div>
            </div>

            <TableComponent
                columns={columns}
                tableData={submissions}
                isLoading={isLoading}
                height="60vh"
                fillHeight={true}
            />
            
            <div className="flex justify-center items-center mt-4 w-full bg-white rounded-lg shadow-sm">
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(p) => setCurrentPage(p)}
                    alwaysShow={true}
                    itemsPerPageOptions={[10, 20, 50]}
                    onItemsPerPageChange={(items) => {
                        setItemsPerPage(items);
                        setCurrentPage(1);
                    }}
                    roundedBottom="rounded-lg"
                />
            </div>
        </div>
    );
}
