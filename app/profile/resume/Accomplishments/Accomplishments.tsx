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

  // ← CHANGED: saved records only (no null), separate showNew state
  const [certifications, setCertifications] = useState<CertificationRecord[]>([]);
  const [submittedCerts, setSubmittedCerts] = useState<boolean[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [showNewCert, setShowNewCert] = useState(false); // ← ADD

  const [awards, setAwards] = useState<AwardRecord[]>([]);
  const [submittedAwards, setSubmittedAwards] = useState<boolean[]>([]);
  const [awardsLoading, setAwardsLoading] = useState(true);
  const [showNewAward, setShowNewAward] = useState(false); // ← ADD

  const [clubs, setClubs] = useState<ClubRecord[]>([]);
  const [submittedClubs, setSubmittedClubs] = useState<boolean[]>([]);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [showNewClub, setShowNewClub] = useState(false); // ← ADD

  useEffect(() => {
    if (!studentId) return;
    setCertsLoading(true);
    getCertifications(studentId)
      .then((data) => {
        setCertifications(data.length > 0 ? data : []);
        setSubmittedCerts(data.length > 0 ? data.map(() => true) : []);
        setShowNewCert(data.length === 0); // ← show empty form only if no data
      })
      .catch(() => toast.error("Failed to load certifications"))
      .finally(() => setCertsLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    setAwardsLoading(true);
    getAwards(studentId)
      .then((data) => {
        setAwards(data.length > 0 ? data : []);
        setSubmittedAwards(data.length > 0 ? data.map(() => true) : []);
        setShowNewAward(data.length === 0); // ← ADD
      })
      .catch(() => toast.error("Failed to load awards"))
      .finally(() => setAwardsLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    setClubsLoading(true);
    getClubs(studentId)
      .then((data) => {
        setClubs(data.length > 0 ? data : []);
        setSubmittedClubs(data.length > 0 ? data.map(() => true) : []);
        setShowNewClub(data.length === 0); // ← ADD
      })
      .catch(() => toast.error("Failed to load clubs"))
      .finally(() => setClubsLoading(false));
  }, [studentId]);

  const handleAdd = () => {
    if (activeTab === "certifications") {
      if (showNewCert) { toast.error("Please submit the latest form before adding a new one."); return; }
      setShowNewCert(true); // ← ADD
      return;
    }
    if (activeTab === "awards") {
      if (showNewAward) { toast.error("Please submit the latest form before adding a new one."); return; }
      setShowNewAward(true); // ← ADD
      return;
    }
    if (activeTab === "clubs") {
      if (showNewClub) { toast.error("Please submit the latest form before adding a new one."); return; }
      setShowNewClub(true); // ← ADD
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

  // ← ADD: on new form submit, add to saved list and hide new form
  const handleNewCertSubmitted = () => {
    getCertifications(studentId!).then((data) => {
      setCertifications(data);
      setSubmittedCerts(data.map(() => true));
    });
    setShowNewCert(false);
  };

  const handleNewAwardSubmitted = (record: AwardRecord) => {
    setAwards((prev) => [...prev, record]);
    setSubmittedAwards((prev) => [...prev, true]);
    setShowNewAward(false);
  };

  const handleNewClubSubmitted = (record: ClubRecord) => {
    setClubs((prev) => [...prev, record]);
    setSubmittedClubs((prev) => [...prev, true]);
    setShowNewClub(false);
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

      {/* ── Certifications ── */}
      {activeTab === "certifications" && (
        certsLoading ? <><FormShimmer /><FormShimmer /></> :
        <>
          {/* Saved certifications → trash icon */}
          {certifications.map((cert, i) => (
            <CertificationsForm
              key={cert?.resumeCertificateId ?? `saved-${i}`}
              index={i}
              studentId={studentId!}
              existingData={cert}
              onSubmit={() => markCertSubmitted(i)}
              onRemove={() => handleRemoveCertification(i)}
            />
          ))}
          {/* New form → minus button, click hides it */}
          {showNewCert && (
            <CertificationsForm
              key="new-cert"
              index={certifications.length}
              studentId={studentId!}
              existingData={null}
              onSubmit={handleNewCertSubmitted}
              onRemove={() => setShowNewCert(false)}
            />
          )}
        </>
      )}

      {/* ── Awards ── */}
      {activeTab === "awards" && (
        awardsLoading ? <><FormShimmer /><FormShimmer /></> :
        <>
          {awards.map((award, i) => (
            <AwardsForm
              key={award?.awardId ?? `saved-${i}`}
              index={i}
              studentId={studentId!}
              existingData={award}
              onSubmit={(record) => markAwardSubmitted(i, record)}
              onRemove={() => handleRemoveAward(i)}
            />
          ))}
          {showNewAward && (
            <AwardsForm
              key="new-award"
              index={awards.length}
              studentId={studentId!}
              existingData={null}
              onSubmit={handleNewAwardSubmitted}
              onRemove={() => setShowNewAward(false)}
            />
          )}
        </>
      )}

      {/* ── Clubs ── */}
      {activeTab === "clubs" && (
        clubsLoading ? <><FormShimmer /><FormShimmer /></> :
        <>
          {clubs.map((club, i) => (
            <ClubsForm
              key={club?.resumeClubCommitteeId ?? `saved-${i}`}
              index={i}
              studentId={studentId!}
              existingData={club}
              onSubmit={(record) => markClubSubmitted(i, record)}
              onRemove={() => handleRemoveClub(i)}
            />
          ))}
          {showNewClub && (
            <ClubsForm
              key="new-club"
              index={clubs.length}
              studentId={studentId!}
              existingData={null}
              onSubmit={handleNewClubSubmitted}
              onRemove={() => setShowNewClub(false)}
            />
          )}
        </>
      )}
    </div>
  );
}