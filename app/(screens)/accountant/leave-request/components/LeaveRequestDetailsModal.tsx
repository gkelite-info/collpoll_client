"use client";

import DynamicLeaveRequestDetailsModal from "@/app/(screens)/finance-manager/leave-request/components/LeaveRequestDetailsModal";
import type { AccountantLeaveRequest } from "../data";

type LeaveRequestDetailsModalProps = {
  request: AccountantLeaveRequest | null;
  onClose: () => void;
};

export default function LeaveRequestDetailsModal(
  props: LeaveRequestDetailsModalProps,
) {
  return <DynamicLeaveRequestDetailsModal {...props} />;
}
