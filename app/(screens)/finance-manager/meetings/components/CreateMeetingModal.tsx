"use client";

import FinanceCreateMeetingModal from "../../../finance/meetings/components/CreateMeetingModal";

type CreateMeetingModalProps = {
  isOpen: boolean;
  initialRole?: "Parent" | "Student" | "Faculty" | "Staff";
  onClose: () => void;
  onSuccess: () => void;
  editingMeetingId?: number | null;
  editingSectionId?: number | null;
};

export default function CreateMeetingModal(props: CreateMeetingModalProps) {
  return <FinanceCreateMeetingModal {...props} />;
}
