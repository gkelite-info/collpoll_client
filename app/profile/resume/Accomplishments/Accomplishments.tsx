"use client";

import { useState, useEffect } from "react";
import CertificationsForm from "./CertificationsForm";
import AwardsForm from "./AwardsForm";
import ClubsForm from "./ClubsForm";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import { getCertifications, deleteCertification } from "@/lib/helpers/student/Resume/resumeCertificationsAPI";
import { getAwards, deleteAward } from "@/lib/helpers/student/Resume/resumeAwardsAPI";
import { getClubs, deleteClub } from "@/lib/helpers/student/Resume/resumeClubsAPI";

// Shimmer Component
const Shimmer = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const FormShimmer = () => (
  <div className="space-y-6 p-4 border border-gray-100 rounded-lg mb-4">
    <Shimmer className="h-6 w-1/4 mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-2"><Shimmer className="h-4 w-1/3" /><Shimmer className="h-10 w-full" /></div>
      <div className="space-y-2"><Shimmer className="h-4 w-1/3" /><Shimmer className="h-10 w-full" /></div>
      <div className="space-y-2"><Shimmer className="h-4 w-1/3" /><Shimmer className="h-10 w-full" /></div>
      <div className="space-y-2"><Shimmer className="h-4 w-1/3" /><Shimmer className="h-10 w-full" /></div>
    </div>
    <div className="flex justify-end"><Shimmer className="h-10 w-24" /></div>
  </div>
);

type TabType = "certifications" | "awards" | "clubs";

interface CertificationRecord {
  resumeCertificateId: number;
  certificationName: string;
  certificationCompletionId: string;
  certificateLink: string;
  uploadCertificate: string;
  startDate: string;
  endDate: string | null;
}

interface AwardRecord {
  awardId: number;
  awardName: string;
  issuedBy: string;
  dateReceived: string;
  category: string;
  description: string;
}

interface ClubRecord {
  resumeClubCommitteeId: number;
  clubName: string;
  role: string;
  fromDate: string;
  toDate: string;
  description: string;
}

export default function Accomplishments() {
  const router = useRouter();
  const { studentId } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("certifications");

  const [certifications, setCertifications] = useState<(CertificationRecord | null)[]>([null]);
  const [submittedCerts, setSubmittedCerts] = useState<boolean[]>([false]);
  const [certsLoading, setCertsLoading] = useState(true);

  const [awards, setAwards] = useState<(AwardRecord | null)[]>([null]);
  const [submittedAwards, setSubmittedAwards] = useState<boolean[]>([false]);
  const [awardsLoading, setAwardsLoading] = useState(true);

  const [clubs, setClubs] = useState<(ClubRecord | null)[]>([null]);
  const [submittedClubs, setSubmittedClubs] = useState<boolean[]>([false]);
  const [clubsLoading, setClubsLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    setCertsLoading(true);
    getCertifications(studentId)
      .then((data) => {
        setCertifications(data.length > 0 ? data : [null]);
        setSubmittedCerts(data.length > 0 ? data.map(() => true) : [false]);
      })
      .catch(() => toast.error("Failed to load certifications"))
      .finally(() => setCertsLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    setAwardsLoading(true);
    getAwards(studentId)
      .then((data) => {
        setAwards(data.length > 0 ? data : [null]);
        setSubmittedAwards(data.length > 0 ? data.map(() => true) : [false]);
      })
      .catch(() => toast.error("Failed to load awards"))
      .finally(() => setAwardsLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    setClubsLoading(true);
    getClubs(studentId)
      .then((data) => {
        setClubs(data.length > 0 ? data : [null]);
        setSubmittedClubs(data.length > 0 ? data.map(() => true) : [false]);
      })
      .catch(() => toast.error("Failed to load clubs"))
      .finally(() => setClubsLoading(false));
  }, [studentId]);

  const handleAdd = () => {
    if (activeTab === "certifications") {
      if (!submittedCerts[certifications.length - 1]) { toast.error("Please submit the latest form before adding a new one."); return; }
      setCertifications((prev) => [...prev, null]);
      setSubmittedCerts((prev) => [...prev, false]);
      return;
    }
    if (activeTab === "awards") {
      if (!submittedAwards[awards.length - 1]) { toast.error("Please submit the latest form before adding a new one."); return; }
      setAwards((prev) => [...prev, null]);
      setSubmittedAwards((prev) => [...prev, false]);
      return;
    }
    if (activeTab === "clubs") {
      if (!submittedClubs[clubs.length - 1]) { toast.error("Please submit the latest form before adding a new one."); return; }
      setClubs((prev) => [...prev, null]);
      setSubmittedClubs((prev) => [...prev, false]);
    }
  };

  const markCertSubmitted = (index: number) => {
    setSubmittedCerts((prev) => { const u = [...prev]; u[index] = true; return u; });
  };

  const markAwardSubmitted = (index: number, record: AwardRecord) => {
    setAwards((prev) => { const u = [...prev]; u[index] = record; return u; });
    setSubmittedAwards((prev) => { const u = [...prev]; u[index] = true; return u; });
  };

  const markClubSubmitted = (index: number, record: ClubRecord) => {
    setClubs((prev) => { const u = [...prev]; u[index] = record; return u; });
    setSubmittedClubs((prev) => { const u = [...prev]; u[index] = true; return u; });
  };

  const handleRemoveCertification = async (index: number) => {
    const cert = certifications[index];
    if (cert?.resumeCertificateId) {
      try { await deleteCertification(cert.resumeCertificateId); toast.success("Certification removed"); }
      catch { toast.error("Failed to remove certification"); return; }
    }
    setCertifications((prev) => prev.filter((_, i) => i !== index));
    setSubmittedCerts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAward = async (index: number) => {
    const award = awards[index];
    if (award?.awardId) {
      try { await deleteAward(award.awardId); toast.success("Award removed"); }
      catch { toast.error("Failed to remove award"); return; }
    }
    setAwards((prev) => prev.filter((_, i) => i !== index));
    setSubmittedAwards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveClub = async (index: number) => {
    const club = clubs[index];
    if (club?.resumeClubCommitteeId) {
      try { await deleteClub(club.resumeClubCommitteeId); toast.success("Club removed"); }
      catch { toast.error("Failed to remove club"); return; }
    }
    setClubs((prev) => prev.filter((_, i) => i !== index));
    setSubmittedClubs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl p-6 w-full mt-3 mb-5 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-center text-[#282828]">Accomplishments</h2>
        <div className="flex gap-2">
          <button type="button" onClick={handleAdd} className="bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium">Add +</button>
          <button type="button" onClick={() => router.push('/profile?resume=competitive-exams&Step=9')} className="bg-[#43C17A] cursor-pointer text-white px-6 py-1.5 rounded-md text-sm font-medium">Next</button>
        </div>
      </div>

      <div className="flex justify-between gap-5 mb-6">
        {[
          { key: "certifications", label: "Certifications" },
          { key: "awards", label: "Awards" },
          { key: "clubs", label: "Club & Committees" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`pb-2 cursor-pointer text-sm font-medium w-full text-center ${activeTab === tab.key ? "text-[#74CB64] border-b-2 border-[#74CB64]" : "border-[#AEAEAE] border-b-2 text-[#282828]"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "certifications" && (
        certsLoading ? <><FormShimmer /><FormShimmer /></> :
        certifications.map((cert, i) => (
          <CertificationsForm
            key={cert?.resumeCertificateId ?? `new-${i}`}
            index={i}
            studentId={studentId!}
            existingData={cert}
            onSubmit={() => markCertSubmitted(i)}
            onRemove={() => handleRemoveCertification(i)}
          />
        ))
      )}

      {activeTab === "awards" && (
        awardsLoading ? <><FormShimmer /><FormShimmer /></> :
        awards.map((award, i) => (
          <AwardsForm
            key={award?.awardId ?? `new-${i}`}
            index={i}
            studentId={studentId!}
            existingData={award}
            onSubmit={(record) => markAwardSubmitted(i, record)}
            onRemove={() => handleRemoveAward(i)}
          />
        ))
      )}

      {activeTab === "clubs" && (
        clubsLoading ? <><FormShimmer /><FormShimmer /></> :
        clubs.map((club, i) => (
          <ClubsForm
            key={club?.resumeClubCommitteeId ?? `new-${i}`}
            index={i}
            studentId={studentId!}
            existingData={club}
            onSubmit={(record) => markClubSubmitted(i, record)}
            onRemove={() => handleRemoveClub(i)}
          />
        ))
      )}
    </div>
  );
}