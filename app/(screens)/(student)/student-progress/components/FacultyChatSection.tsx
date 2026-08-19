"use client";

import { useState } from "react";
import { ChatCircleDots } from "@phosphor-icons/react";
import SharedProgressChatModal from "@/app/components/SharedProgressChatModal";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { useUser } from "@/app/utils/context/UserContext";

type SubjectProgressRow = {
  subject: string;
  professorName?: string | null;
  facultyId?: number | null;
};

export default function FacultyChatSection({ rows }: { rows: SubjectProgressRow[] }) {
  const [activeChat, setActiveChat] = useState<SubjectProgressRow | null>(null);
  const { studentId, collegeId } = useStudent();
  const { userId } = useUser();

  // Deduplicate faculties, and only show rows with actual facultyId
  const uniqueFaculties = rows.reduce((acc, current) => {
    if (current.facultyId && !acc.find(x => x.facultyId === current.facultyId)) {
      acc.push(current);
    }
    return acc;
  }, [] as SubjectProgressRow[]);

  if (uniqueFaculties.length === 0) return null;

  return (
    <>
      <section className="bg-white rounded-2xl shadow-sm p-4 lg:col-span-10 mt-6 max-md:p-3">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Faculty Chat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueFaculties.map((item, index) => (
            <div
              key={index}
              onClick={() => setActiveChat(item)}
              className="bg-[#E8F6E2] rounded-xl flex items-center p-3 gap-3 cursor-pointer hover:bg-[#D5F2CA] transition shadow-sm border border-transparent hover:border-[#95D078]"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-gray-800 font-bold text-sm truncate">
                  Prof. {item.professorName || "Unknown"}
                </p>
                <p className="text-gray-500 text-xs truncate">{item.subject}</p>
              </div>

              <div className="bg-[#95D078] w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
                <ChatCircleDots size={20} weight="fill" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <SharedProgressChatModal
        isOpen={!!activeChat}
        onClose={() => setActiveChat(null)}
        chatParticipantName={`Prof. ${activeChat?.professorName || "Unknown"}`}
        chatParticipantSubtitle={activeChat?.subject || ""}
        studentId={studentId!}
        facultyId={activeChat?.facultyId!}
        collegeId={collegeId!}
        senderUserId={userId!}
        senderRole="STUDENT"
      />
    </>
  );
}
