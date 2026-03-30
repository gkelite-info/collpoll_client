"use client";

import { CheckCircle } from "@phosphor-icons/react";

export default function PasswordChecklist({ password }: { password: string }) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const Row = (ok: boolean, label: string) => (
    <li className="flex items-center gap-2 text-sm">
      <CheckCircle
        size={16}
        weight="fill"
        className={ok ? "text-[#10B981]" : "text-gray-300"}
      />
      <span className={ok ? "text-gray-700" : "text-gray-400"}>{label}</span>
    </li>
  );

  return (
    <ul className="space-y-2 mb-4">
      {Row(checks.length, "At Least 8 Characters")}
      {Row(checks.uppercase, "One Uppercase Letter")}
      {Row(checks.number, "One Number")}
      {Row(checks.special, "One Special Character")}
    </ul>
  );
}
