"use client";

import { useState } from "react";
import { ChatCircleDots } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import SharedProgressChatModal from "@/app/components/SharedProgressChatModal";
import { useParent } from "@/app/utils/context/parent/useParent";

type SubjectProgressCard = {
  image: string;
  professor: string;
  subject: string;
  facultyId: number | null;
  facultyAvatar?: string | null;
};

type SubjectProgressCardProps = {
  props: SubjectProgressCard[];
};

import { Avatar } from "@/app/utils/Avatar";

export default function FacultyChat({ props }: SubjectProgressCardProps) {
  const t = useTranslations("Dashboard.parent");
  const [activeChat, setActiveChat] = useState<SubjectProgressCard | null>(null);
  const { studentId, collegeId, userId } = useParent();

  // Filter out subjects with no assigned faculty
  const chatableFaculties = props.filter((item) => item.facultyId !== null);

  return (
    <>
      <div className="bg-white h-full lg:h-64 rounded-lg w-full p-4 shadow-md flex flex-col gap-2 min-h-[280px] lg:min-h-0">
        <div className="flex justify-between items-center mb-1 lg:mb-0">
          <h6 className="text-[#282828] font-semibold text-sm lg:text-base">
            {t("Faculty Chat")}
          </h6>
        </div>

        <div className="bg-red-00 flex flex-col gap-2 overflow-y-auto flex-1 custom-scrollbar pr-1">
          {chatableFaculties.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
              No faculty assigned
            </div>
          ) : (
            chatableFaculties.map((item, index) => (
              <div
                className="bg-[#E8F6E2] h-14 lg:h-16.75 rounded-full flex items-center px-2 py-1.5 lg:py-2 gap-2 shrink-0 cursor-pointer hover:bg-[#D5F2CA] transition"
                key={index}
                onClick={() => setActiveChat(item)}
              >
                <div className="rounded-full flex items-center justify-center shrink-0">
                  <Avatar src={item.facultyAvatar} alt={item.professor} size={40} />
                </div>

                <div className="h-full flex-1 flex flex-col items-start justify-center min-w-0 pr-1">
                  <p className="text-[#282828] font-medium text-[13px] lg:text-md w-full leading-tight line-clamp-2">
                    {t("Prof")} {item.professor}
                  </p>
                  <p className="text-[#282828] text-[10px] lg:text-sm truncate w-full mt-0.5">
                    {item.subject}
                  </p>
                </div>

                <div className="bg-[#A1D683] rounded-full h-10 w-10 lg:h-14 lg:w-14 flex items-center justify-center shrink-0">
                  <ChatCircleDots size={24} className="lg:hidden text-white" weight="fill" />
                  <ChatCircleDots size={32} className="hidden lg:block text-white" weight="fill" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <SharedProgressChatModal
        isOpen={!!activeChat}
        onClose={() => setActiveChat(null)}
        chatParticipantName={`Prof. ${activeChat?.professor || ""}`}
        chatParticipantSubtitle={activeChat?.subject || ""}
        chatParticipantAvatar={activeChat?.facultyAvatar}
        facultyId={activeChat?.facultyId!}
        studentId={studentId!}
        collegeId={collegeId!}
        senderUserId={userId!}
        senderRole="PARENT"
      />
    </>
  );
}
