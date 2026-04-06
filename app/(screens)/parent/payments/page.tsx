"use client";

import PaymentsSkeleton from "@/app/(screens)/(student)/payments/shimmer/PaymentsSkeleton";
import SharedPaymentDashboard from "@/app/components/payments/SharedPaymentDashboard";
import { useParent } from "@/app/utils/context/parent/useParent";

export default function ParentPaymentPage() {
  const { childUserId, loading } = useParent();

  if (loading) {
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

  return <SharedPaymentDashboard targetUserId={childUserId} />;
}
