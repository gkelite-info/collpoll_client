// "use client";
// import ClubInfo from "@/app/(screens)/faculty/clubs/components/ClubInfo";
// import StudentAnnouncements from "./StudentAnnouncements";
// import { useUser } from "@/app/utils/context/UserContext";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { getStudentClubDetailsAPI } from "@/lib/helpers/clubActivity/studentClubAPI";
// import { StudentAnnouncementsShimmer } from "../shimmers/StudentAnnouncementsShimmer";
// import Image from "next/image";

// export default function MyClubView() {

//     const { studentId, collegeId } = useUser();
//     const [clubState, setClubState] = useState<{
//         status: "loading" | "none" | "pending" | "joined" | "error";
//         info: any | null;
//         role: string | null;
//     }>({ status: "loading", info: null, role: null });
//     const [currentViewDate, setCurrentViewDate] = useState("Today");

//     useEffect(() => {
//         if (!studentId) return;

//         const loadClubStatus = async () => {
//             try {
//                 const data = await getStudentClubDetailsAPI(parseInt(String(studentId), 10));
//                 setClubState({
//                     status: data.status as any,
//                     info: data.clubInfo,
//                     role: data.role
//                 });
//             } catch (error) {
//                 toast.error("Failed to load your club information.");
//                 setClubState({ status: "error", info: null, role: null });
//             }
//         };

//         loadClubStatus();
//     }, [studentId]);

//     if (clubState.status === "loading") {
//         return (
//             <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-500">
//                 <ClubInfo isLoading={true} />
//                 <div className="relative mb-8 flex items-center justify-center">
//                     <div className="absolute w-full border-t border-[#959595]/30"></div>
//                     <div className="relative h-5 w-16 rounded-full bg-gray-200 animate-pulse"></div>
//                 </div>
//                 <div className="flex flex-col mx-auto w-full">
//                     <StudentAnnouncementsShimmer />
//                 </div>
//             </div>
//         );
//     }

//     if (clubState.status === "error") {
//         return (
//             <div className="flex flex-col items-center justify-center pt-22 pb-10 animate-in fade-in duration-500">
//                 <h2 className="text-xl font-bold text-red-500 mb-2">Connection Error</h2>
//                 <p className="text-gray-500 font-medium text-center">Please refresh the page to try loading your club again.</p>
//             </div>
//         );
//     }

//     if (clubState.status === "none") {
//         return (
//             <div className="flex flex-col gap-3 items-center justify-center pt-22 pb-10 animate-in fade-in duration-500">
//                 <Image src="/s-no-club.png" alt="" height={150} width={150} className="object-cover" />
//                 <div className="text-center">
//                     <h2 className="text-xl font-bold text-[#16284F] mb-2">No Club Joined</h2>
//                     <p className="text-gray-500 font-medium text-center max-w-md">
//                         You are not currently a member of any club. Explore the available clubs and send a request to join one!
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     if (clubState.status === "pending") {
//         return (
//             <div className="flex flex-col gap-3 items-center justify-center min-h-[40vh] animate-in fade-in duration-500">
//                 <Image src="/club-pending.png" alt="" height={150} width={150} className="object-cover" />
//                 <div className="text-center">
//                     <h2 className="text-xl font-bold text-[#16284F] mb-2">Request Pending</h2>
//                     <p className="text-gray-500 font-medium text-center max-w-md">
//                         Your request to join <span className="font-bold text-[#43C17A]">{clubState.info?.name}</span> is currently pending approval by the responsible faculty or mentors.
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-500">
//             <ClubInfo info={clubState.info} />
//             <div className="relative mb-8 flex items-center justify-center">
//                 <div className="absolute w-full border-t border-[#959595]"></div>
//                 <span className="relative bg-white px-6 text-xs font-bold text-[#3B3B3B]">{currentViewDate}</span>
//             </div>

//             <div className="flex flex-col mx-auto w-full">
//                 {/* <StudentAnnouncements userRole={clubState.role} /> */}
//                 <StudentAnnouncements
//                     userRole={clubState.role}
//                     clubId={parseInt(clubState.info?.id)}
//                     collegeId={collegeId!}
//                     studentId={parseInt(String(studentId), 10)}
//                     onDateChange={setCurrentViewDate}
//                 />
//             </div>
//         </div>
//     );
// }

"use client";
import ClubInfo from "@/app/(screens)/faculty/clubs/components/ClubInfo";
import StudentAnnouncements from "./StudentAnnouncements";
import { useUser } from "@/app/utils/context/UserContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getStudentClubDetailsAPI } from "@/lib/helpers/clubActivity/studentClubAPI";
import { StudentAnnouncementsShimmer } from "../shimmers/StudentAnnouncementsShimmer";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function MyClubView() {
  const { studentId, collegeId } = useUser();
  const t = useTranslations("Clubs.student"); // Hook

  const [clubState, setClubState] = useState<{
    status: "loading" | "none" | "pending" | "joined" | "error";
    info: any | null;
    role: string | null;
  }>({ status: "loading", info: null, role: null });
  const [currentViewDate, setCurrentViewDate] = useState(t("Today"));

  useEffect(() => {
    if (!studentId) return;

    const loadClubStatus = async () => {
      try {
        const data = await getStudentClubDetailsAPI(
          parseInt(String(studentId), 10),
        );
        setClubState({
          status: data.status as any,
          info: data.clubInfo,
          role: data.role,
        });
      } catch (error) {
        toast.error(t("Failed to load your club information"));
        setClubState({ status: "error", info: null, role: null });
      }
    };

    loadClubStatus();
  }, [studentId]);

  if (clubState.status === "loading") {
    return (
      <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-500">
        <ClubInfo isLoading={true} />
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute w-full border-t border-[#959595]/30"></div>
          <div className="relative h-5 w-16 rounded-full bg-gray-200 animate-pulse"></div>
        </div>
        <div className="flex flex-col mx-auto w-full">
          <StudentAnnouncementsShimmer />
        </div>
      </div>
    );
  }

  if (clubState.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center pt-22 pb-10 animate-in fade-in duration-500">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          {t("Connection Error")}
        </h2>
        <p className="text-gray-500 font-medium text-center">
          {t("Please refresh the page to try loading your club again")}
        </p>
      </div>
    );
  }

  if (clubState.status === "none") {
    return (
      <div className="flex flex-col gap-3 items-center justify-center pt-22 pb-10 animate-in fade-in duration-500">
        <Image
          src="/s-no-club.png"
          alt=""
          height={150}
          width={150}
          className="object-cover"
        />
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#16284F] mb-2">
            {t("No Club Joined")}
          </h2>
          <p className="text-gray-500 font-medium text-center max-w-md">
            {t(
              "You are not currently a member of any club Explore the available clubs and send a request to join one!",
            )}
          </p>
        </div>
      </div>
    );
  }

  if (clubState.status === "pending") {
    return (
      <div className="flex flex-col gap-3 items-center justify-center min-h-[40vh] animate-in fade-in duration-500">
        <Image
          src="/club-pending.png"
          alt=""
          height={150}
          width={150}
          className="object-cover"
        />
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#16284F] mb-2">
            {t("Request Pending")}
          </h2>
          <p className="text-gray-500 font-medium text-center max-w-md">
            {t(
              "Your request to join {clubName} is currently pending approval by the responsible faculty or mentors",
              { clubName: clubState.info?.name },
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-500">
      <ClubInfo info={clubState.info} />
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute w-full border-t border-[#959595]"></div>
        <span className="relative bg-white px-6 text-xs font-bold text-[#3B3B3B]">
          {currentViewDate}
        </span>
      </div>

      <div className="flex flex-col mx-auto w-full">
        <StudentAnnouncements
          userRole={clubState.role}
          clubId={parseInt(clubState.info?.id)}
          collegeId={collegeId!}
          studentId={parseInt(String(studentId), 10)}
          onDateChange={setCurrentViewDate}
        />
      </div>
    </div>
  );
}
