"use client";

import WellbeingExecutiveNavbar from "./wellbeingExecutiveNavbar";

type WellbeingManagerNavbarProps = {
  onClose?: () => void;
};

export default function WellbeingManagerNavbar({
  onClose,
}: WellbeingManagerNavbarProps) {
  return (
    <WellbeingExecutiveNavbar
      onClose={onClose}
      basePath="/wellbeing-manager"
      showExecutives
      showLeaveRequest={true}
    />
  );
}
