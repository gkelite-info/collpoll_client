"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "../utils/context/UserContext";
import { Image as ImageIcon } from "@phosphor-icons/react";

interface ProfileInfoData {
  registrationId: string;
  email: string;
  phone: string;
  educationType: string;
  branch: string;
  batchYear: string;
  currentYear: string;
  section: string;
  profilePhoto?: string | null;
}

export default function ProfileInfo() {
  const router = useRouter();

  const {
    studentId,
    fullName,
    email,
    mobile,
    collegeEducationType,
    collegeBranchCode,
    collegeAcademicYear,
  } = useUser();

  const [profileData, setProfileData] = useState<ProfileInfoData>({
    registrationId: String(studentId || ""),
    email: email || "",
    phone: mobile || "",
    educationType: collegeEducationType || "",
    branch: collegeBranchCode || "",
    batchYear: "",
    currentYear: collegeAcademicYear || "",
    section: "",
    profilePhoto: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const DefaultAvatar = () => (
    <div className="w-40 h-40 rounded-full border-4 border-[#43C17A] bg-gray-200 flex items-center justify-center text-gray-400">
      <svg
        className="w-24 h-24"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoLoading(true);
    try {
      // In production: Upload 'file' to AWS S3, Cloudinary, or Firebase here
      // For now, we create a local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileData((prev) => ({ ...prev, profilePhoto: result }));
        toast.success("Photo updated successfully");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload photo");
      console.error("Photo upload error:", error);
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (!profileData.registrationId) {
        toast.error("Registration ID is required");
        return;
      }
      // In production: API call to save data
      // await saveProfileData(profileData);

      toast.success("Profile information saved successfully");
      router.push(`/profile?profile=personal-details&Step=2`, { scroll: false });
    } catch (error) {
      toast.error("Failed to save profile information");
      console.error("Save error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper component for uniform rows
  const ProfileRow = ({ label, value }: { label: string; value: string }) => (
    <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-4 py-2">
      <span className="text-gray-700 font-medium text-sm sm:text-base">{label}</span>
      <span className="text-gray-600 text-sm sm:text-base">{value || "—"}</span>
    </div>
  );

  return (
    <div className="w-full min-h-[85vh]">
      <div className="mx-auto bg-white rounded-lg p-6 sm:p-10 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-medium text-gray-900">Profile</h2>
          <button
            onClick={() => router.push(`/profile?profile=personal-details&Step=2`, { scroll: false })}
            className="px-6 py-2 cursor-pointer bg-[#43C17A] text-white rounded-md text-sm font-medium"
          >
            Next
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-10 md:gap-16 md:items-center">
          <div className="flex flex-col items-center shrink-0">
            {profileData.profilePhoto ? (
              <img
                src={profileData.profilePhoto}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-[#43C17A]"
              />
            ) : (
              <DefaultAvatar />
            )}

            <label className="mt-6 bg-[#1A2238] text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 text-sm font-medium">
              <ImageIcon size={18} />
              {photoLoading ? "Uploading..." : "Upload Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={photoLoading}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-[#1B2B5B] mb-6">
              {fullName || "Shravani Reddy"}
            </h3>

            <div className="flex flex-col space-y-1">
              <ProfileRow label="Registration ID" value={profileData.registrationId} />
              <ProfileRow label="Email" value={profileData.email} />
              <ProfileRow label="Phone" value={profileData.phone} />
              <ProfileRow label="Education Type" value={profileData.educationType} />
              <ProfileRow label="Branch" value={profileData.branch} />
              <ProfileRow label="Batch Year" value={profileData.batchYear} />
              <ProfileRow label="Current Year" value={profileData.currentYear} />
              <ProfileRow label="Section" value={profileData.section} />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-12 pt-6">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-8 py-2.5 bg-[#43C17A] text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}