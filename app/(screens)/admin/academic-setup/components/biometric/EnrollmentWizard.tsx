"use client";

import { useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { BiometricDeviceRow } from "@/lib/helpers/devices/biometricDeviceAPI";

import { EnrollStep, UserSearchResult } from "./enrollment/types";
import Step1SearchUser from "./enrollment/Step1SearchUser";
import Step2SelectDevice from "./enrollment/Step2SelectDevice";
import Step3Capture from "./enrollment/Step3Capture";

interface EnrollmentWizardProps {
  collegeId: number;
  adminId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EnrollmentWizard({
  collegeId,
  adminId,
  onClose,
  onSuccess,
}: EnrollmentWizardProps) {
  const [enrollStep, setEnrollStep] = useState<EnrollStep>("search");
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<BiometricDeviceRow[]>([]);

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setEnrollStep("select-device");
  };

  const handleNextToCapture = (devices: BiometricDeviceRow[]) => {
    setSelectedDevices(devices);
    setEnrollStep("enroll");
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer border-none bg-transparent outline-none"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>
        <h2 className="text-xl font-bold text-[#16284F]">Enroll User Credential</h2>
      </div>

      <div className="w-full max-w-lg mx-auto flex items-center gap-2 mb-8 justify-center">
        {["Search User", "Select Device", "Enroll Credential"].map(
          (label, i) => {
            const stepNames: EnrollStep[] = ["search", "select-device", "enroll"];
            const isActive = stepNames.indexOf(enrollStep) >= i;
            const isCurrent = stepNames.indexOf(enrollStep) === i;
            const isClickable =
              i === 0 ||
              (i === 1 && selectedUser !== null) ||
              (i === 2 && selectedUser !== null && selectedDevices.length > 0);
            return (
              <div key={label} className={`flex items-center gap-2 ${i < 2 ? "flex-1" : "flex-none"}`}>
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => {
                    if (isClickable) setEnrollStep(stepNames[i]);
                  }}
                  className={`flex items-center gap-2 border-none bg-transparent p-0 outline-none text-left ${
                    isClickable ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      isActive
                        ? "bg-[#43C17A] text-white shadow-sm"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline whitespace-nowrap ${
                      isCurrent ? "text-[#16284F]" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </button>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full ${
                      isActive && i < stepNames.indexOf(enrollStep)
                        ? "bg-[#43C17A]"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          },
        )}
      </div>

      {enrollStep === "search" && (
        <Step1SearchUser collegeId={collegeId} onSelectUser={handleSelectUser} />
      )}

      {enrollStep === "select-device" && selectedUser && (
        <Step2SelectDevice
          collegeId={collegeId}
          selectedUser={selectedUser}
          onNext={handleNextToCapture}
        />
      )}

      {enrollStep === "enroll" && selectedUser && selectedDevices.length > 0 && (
        <Step3Capture
          collegeId={collegeId}
          adminId={adminId}
          selectedUser={selectedUser}
          selectedDevices={selectedDevices}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
