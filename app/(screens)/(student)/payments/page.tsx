"use client";

import { useUser } from "@/app/utils/context/UserContext";
import PaymentsSkeleton from "./shimmer/PaymentsSkeleton";
import SharedPaymentDashboard from "@/app/components/payments/SharedPaymentDashboard";

const StudentPaymentPage = () => {
  const { userId } = useUser();

  if (!userId) return <PaymentsSkeleton />;

  return <SharedPaymentDashboard targetUserId={userId} />;
};

export default StudentPaymentPage;
