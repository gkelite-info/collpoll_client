"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PaymentsSkeleton from "@/app/(screens)/(student)/payments/shimmer/PaymentsSkeleton";
import SharedPaymentDashboard from "@/app/components/payments/SharedPaymentDashboard";
import { useParent } from "@/app/utils/context/parent/useParent";

export default function ParentPaymentPage() {
  const { childUserId, loading } = useParent();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [fetchingPhoto, setFetchingPhoto] = useState(true);

  useEffect(() => {
    const fetchChildProfilePhoto = async () => {
      if (!childUserId) {
        setFetchingPhoto(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_profile")
          .select("profileUrl")
          .eq("userId", childUserId)
          .eq("is_deleted", false)
          .maybeSingle();

        if (error) throw error;

        if (data?.profileUrl) {
          setProfilePhoto(data.profileUrl);
        }
      } catch (err) {
        console.error("Failed to fetch child profile photo:", err);
      } finally {
        setFetchingPhoto(false);
      }
    };

    if (!loading) {
      fetchChildProfilePhoto();
    }
  }, [childUserId, loading]);

  if (loading || fetchingPhoto) {
    return <PaymentsSkeleton />;
  }

  if (!childUserId) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-2">
        <h2 className="text-xl font-bold text-red-500">
          Could not find linked student
        </h2>
        <p className="text-gray-500 font-medium">
          Child User ID returned null. Check your database relationships.
        </p>
      </div>
    );
  }

  return (
    <SharedPaymentDashboard
      targetUserId={childUserId}
      profilePhoto={profilePhoto}
    />
  );
}
