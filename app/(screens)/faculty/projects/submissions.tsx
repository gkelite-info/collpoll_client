"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { fetchProjectSubmissionsWithStudents } from "@/lib/helpers/student/student_project_submissionsAPI";
import TableComponent from "@/app/utils/table/table";
import { Avatar } from "@/app/utils/Avatar";
import toast from "react-hot-toast";

interface StudentSubmissionsProps {
    projectId: string | null;
}

export default function StudentSubmissions({ projectId }: StudentSubmissionsProps) {
    const searchParams = useSearchParams();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const projectTitle = searchParams.get("title")
        ? decodeURIComponent(searchParams.get("title")!)
        : "Project Submissions";

    useEffect(() => {
        const getSubmissions = async () => {
            if (!projectId) return;
            setIsLoading(true);
            try {
                const data = await fetchProjectSubmissionsWithStudents(Number(projectId));

                const formattedData = data.map((item: any, index: number) => {
                    const student = item.students;
                    const user = student?.users;

                    const profileData = student?.users?.user_profile;
                    const profileUrl = Array.isArray(profileData)
                        ? profileData[0]?.profileUrl
                        : profileData?.profileUrl;

                    const rollData = student?.student_pins;
                    const pinNumber = Array.isArray(rollData)
                        ? rollData[0]?.pinNumber
                        : rollData?.pinNumber || "N/A";

                    return {
                        sno: index + 1,
                        photo: (
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mx-auto border border-gray-100">
                                <Avatar
                                    src={profileUrl}
                                    alt=""
                                    size={30}
                                />
                            </div>
                        ),
                        name: user?.fullName || "Unknown Student",
                        rollNo: pinNumber || "N/A",
                        date: item.updatedAt ? format(new Date(item.updatedAt), "dd MMM yyyy") : "N/A",
                        file: (
                            <a
                                href={item.fileUrl}
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
            } catch (err) {
                toast.error("Failed to load submissions");
            } finally {
                setIsLoading(false);
            }
        };

        getSubmissions();
    }, [projectId]);

    const columns = [
        { title: "S.No", key: "sno" },
        { title: "Photo", key: "photo" },
        { title: "Name", key: "name" },
        { title: "Roll No", key: "rollNo" },
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
            />
        </div>
    );
}