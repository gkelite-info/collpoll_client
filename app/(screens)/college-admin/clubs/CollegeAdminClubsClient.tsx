"use client";

import { useRouter, useSearchParams } from "next/navigation";
import AllClubsGrid from "./components/AllClubsGrid";
import { decryptId } from "@/app/utils/encryption";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ClubInfo from "../../faculty/clubs/components/ClubInfo";
import { getAdminClubDetailsByIdAPI } from "@/lib/helpers/clubActivity/collegeAdminClubAPI";
import { CaretLeftIcon } from "@phosphor-icons/react";

export default function CollegeAdminClubsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const encryptedId = searchParams.get("clubId");
  const encryptedAct = searchParams.get("act");
  const encryptedInact = searchParams.get("inact");
  const clubId = encryptedId ? decryptId(encryptedId) : null;
  const activeCount = encryptedAct ? (decryptId(encryptedAct) ?? "0") : "0";
  const inactiveCount = encryptedInact ? (decryptId(encryptedInact) ?? "0") : "0";

  const [selectedClubData, setSelectedClubData] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    if (clubId) {
      const fetchClubDetails = async () => {
        try {
          setIsDetailLoading(true);
          const data = await getAdminClubDetailsByIdAPI(parseInt(clubId));

          if (data) {
            setSelectedClubData(data);
          } else {
            toast.error("Club not found");
            router.push('?');
          }
        } catch (error) {
          toast.error("Error fetching club details", { id: "college-admin-get-club" });
        } finally {
          setIsDetailLoading(false);
        }
      };
      fetchClubDetails();
    } else {
      setSelectedClubData(null);
    }
  }, [clubId]);

  return (
    <main className="mt-4 rounded-3xl bg-white p-6 shadow-sm min-h-[80vh]">
      {/* <div className="animate-in fade-in duration-300">
          <AllClubsGrid />
      </div> */}

      <div className="animate-in fade-in duration-300">
        {clubId ? (
          <div className="flex flex-col">
            <button
              onClick={() => router.push('?')}
              className="mb-4 cursor-pointer self-start text-sm font-semibold text-gray-500 hover:text-black flex items-center gap-1"
            >
              <CaretLeftIcon /> Back to All Clubs
            </button>
            <ClubInfo
              info={selectedClubData}
              isLoading={isDetailLoading}
              isCollegeAdmin={true}
              stats={{
                active: activeCount,
                inactive: inactiveCount
              }}
            />
          </div>
        ) : (
          <AllClubsGrid />
        )}
      </div>
    </main>
  );
}