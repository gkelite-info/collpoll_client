"use client";

import DynamicLeaveRequestDetailsModal from "@/app/(screens)/finance-manager/leave-request/components/LeaveRequestDetailsModal";
import type { FinanceLeaveRequest } from "@/app/(screens)/finance-manager/leave-request/data";

type LeaveRequestDetailsModalProps = {
  request: FinanceLeaveRequest | null;
  onClose: () => void;
};

export default function LeaveRequestDetailsModal(
  props: LeaveRequestDetailsModalProps,
) {
  return <DynamicLeaveRequestDetailsModal {...props} />;
}
