"use client";

import { useUser } from "@/app/utils/context/UserContext";
import PaymentsSkeleton from "./shimmer/PaymentsSkeleton";
import SharedPaymentDashboard from "@/app/components/payments/SharedPaymentDashboard";

const StudentPaymentPage = () => {
  const { userId, profilePhoto } = useUser();

  if (!userId) return <PaymentsSkeleton />;

  return (
    <SharedPaymentDashboard targetUserId={userId} profilePhoto={profilePhoto} />
  );
};

export default StudentPaymentPage;
