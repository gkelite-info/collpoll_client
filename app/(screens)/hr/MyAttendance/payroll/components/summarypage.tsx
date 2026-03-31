"use client";

import { useUser } from "@/app/utils/context/UserContext";
import { fetchStaffOnboardingSummary } from "@/lib/helpers/staffOnBoarding/onboardingSummaryAPI";
import { User } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface UniversalSummaryPageProps {
  profile?: any;
  userId?: string | number;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) => (
  <div className="flex items-start py-1.5 text-[14px] text-left w-full">
    <span className="w-[140px] sm:w-[180px] font-semibold text-[#333333]">
      {label}
    </span>
    <span
      className={`break-words flex-1 ${value && value !== "Not Provided" ? "text-[#666666]" : "text-gray-400 italic"}`}
    >
      {value || "Not Provided"}
    </span>
  </div>
);

const SummaryShimmer = () => (
  <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4 text-left">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50"
      >
        {i === 0 ? (
          <div className="flex flex-col items-center mb-6 mt-2">
            <div className="w-[84px] h-[84px] rounded-full bg-gray-200 animate-pulse mb-3" />
            <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
          </div>
        ) : (
          <div className="h-5 w-40 bg-gray-200 animate-pulse rounded mb-6" />
        )}
        <div className="flex flex-col space-y-3 mt-4">
          {[...Array(5)].map((_, j) => (
            <div key={j} className="flex">
              <div className="w-[140px] sm:w-[180px] h-4 bg-gray-100 animate-pulse rounded" />
              <div className="flex-1 h-4 bg-gray-200 animate-pulse rounded ml-2" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default function SummaryPage({ profile }: { profile?: any }) {
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { role } = useUser();

  useEffect(() => {
    const loadData = async () => {
      if (!profile?.userId) return;
      setIsLoading(true);
      const data = await fetchStaffOnboardingSummary(profile.userId);
      setOnboardingData(data);
      setIsLoading(false);
    };
    loadData();
  }, [profile?.userId]);

  if (!profile) return <SummaryShimmer />;
  if (isLoading) return <SummaryShimmer />;

  const { bank, aadhaar, pan } = onboardingData || {};

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not Provided";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const systemId = `ID-${profile.id}`;

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4 text-left">
      <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
        <div className="flex flex-col items-center mb-6 mt-2">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-[84px] h-[84px] rounded-full object-cover mb-3 shadow-sm"
            />
          ) : (
            <div className="w-[84px] h-[84px] rounded-full flex items-center justify-center bg-gray-100 mb-3 shadow-sm border border-gray-200">
              <User size={40} className="text-gray-400" weight="fill" />
            </div>
          )}
          <h2 className="text-[17px] font-bold text-gray-800 text-center">
            {profile.name}
          </h2>
          <span className="text-xs font-semibold text-[#43C17A] bg-[#43C17A]/10 px-2 py-0.5 rounded mt-1">
            {profile.role}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center space-y-0.5">
          <InfoRow label={`${role} ID`} value={systemId} />
          <InfoRow label="Department/Branch" value={profile.department} />
          <InfoRow label="Mobile" value={profile.mobile} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Date of Joining" value={profile.joiningDate} />
          <InfoRow
            label="Experience"
            value={profile.experience ? `${profile.experience} Years` : null}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
        <h2 className="text-[16px] font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100 text-left">
          Payment Information
        </h2>

        <div className="mb-5">
          <InfoRow
            label="Salary Payment Mode:"
            value={bank ? "Bank Transfer" : "Not Provided"}
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-gray-800 text-left">
            Bank Information
          </h3>
          {!bank && (
            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-[4px] font-semibold tracking-wide">
              Action Required
            </span>
          )}
        </div>

        <div className="flex flex-col space-y-0.5">
          <InfoRow label="Bank Name:" value={bank?.bankName} />
          <InfoRow label="Account Number:" value={bank?.accountNumber} />
          <InfoRow label="IFSC Code:" value={bank?.ifscCode} />
          <InfoRow label="Name on Account:" value={bank?.accountHolderName} />
          <InfoRow label="Branch:" value={bank?.branch} />
        </div>
      </div>

      {/* 3. AADHAAR INFORMATION */}
      <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
        <h2 className="text-[16px] font-bold text-gray-800 mb-4 text-left">
          Identity Information
        </h2>

        <div className="flex items-center justify-start space-x-2.5 mb-5">
          <img
            src="/india.png"
            alt="Flag of India"
            className="h-[14px] w-auto object-contain rounded-[1px]"
          />
          <span className="text-[16px] font-bold text-gray-800">
            Aadhaar Card
          </span>
        </div>

        <div className="flex flex-col space-y-0.5">
          <InfoRow label="Aadhaar Number:" value={aadhaar?.aadhaarNumber} />
          <InfoRow
            label="Date of Birth:"
            value={formatDate(aadhaar?.dateOfBirth)}
          />
          <InfoRow label="Address:" value={aadhaar?.address} />
          <InfoRow
            label="Enrollment Number:"
            value={aadhaar?.enrollmentNumber}
          />
          <InfoRow label="Name on Aadhaar:" value={aadhaar?.nameOnAadhaar} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
        <div className="flex items-center justify-start space-x-2.5 mb-5 mt-1">
          <img
            src="/india.png"
            alt="Flag of India"
            className="h-[14px] w-auto object-contain rounded-[1px]"
          />
          <span className="text-[16px] font-bold text-gray-800">PAN Card</span>
        </div>

        <div className="flex flex-col space-y-0.5 mt-2">
          <InfoRow label="Permanent Account Number:" value={pan?.panNumber} />
          <InfoRow
            label="Date of Birth:"
            value={formatDate(pan?.dateOfBirth)}
          />
          <InfoRow label="Name on PAN:" value={pan?.nameOnPan} />
          <InfoRow label="Father's Name:" value={pan?.fatherName} />
        </div>
      </div>
    </div>
  );
}
