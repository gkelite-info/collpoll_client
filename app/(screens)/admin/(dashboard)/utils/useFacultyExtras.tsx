'use client'
import { getEmployeeEmpId } from "@/lib/helpers/identifiers/upsertIdentifier";
import { getUserProfilePhoto } from "@/lib/helpers/profile/profileInfo";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useFacultyExtras(
  userId: number | undefined,
  collegeId: number | undefined,
  fallbackAvatar?: string | null
) {
  const [identifierId, setIdentifierId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !collegeId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    Promise.all([
      getEmployeeEmpId(userId, collegeId),
      getUserProfilePhoto(userId),
    ])
      .then(([empId, profileData]) => {
        if (cancelled) return;
        if (empId) setIdentifierId(empId);
        if (profileData?.profileUrl) setAvatarUrl(profileData.profileUrl);
      })
      .catch((err) => {
        toast.error("Failed to fetch additional faculty details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, collegeId]);

  return { identifierId, avatarUrl, loading };
}