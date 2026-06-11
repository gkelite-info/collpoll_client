"use client";

import { useState } from "react";
import {
  Fingerprint,
  IdentificationCard,
  Camera,
} from "@phosphor-icons/react";
import { BiometricDeviceRow } from "@/lib/helpers/devices/biometricDeviceAPI";
import { UserSearchResult, EnrollCredType } from "./types";

import FaceCaptureTab from "./FaceCaptureTab";
import CardCaptureTab from "./CardCaptureTab";
import FingerprintCaptureTab from "./FingerprintCaptureTab";

interface Step3CaptureProps {
  collegeId: number;
  adminId: number;
  selectedUser: UserSearchResult;
  selectedDevices: BiometricDeviceRow[];
  onSuccess: () => void;
}

export default function Step3Capture({
  collegeId,
  adminId,
  selectedUser,
  selectedDevices,
  onSuccess,
}: Step3CaptureProps) {
  const [enrollCredType, setEnrollCredType] = useState<EnrollCredType>("FaceTemplate");

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-gray-50 rounded-lg p-3 mb-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">User</span>
          <span className="text-xs font-semibold text-[#16284F]">
            {selectedUser?.fullName}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-500 font-medium">Target Devices ({selectedDevices.length})</span>
          <div
            className={`flex gap-1.5 pb-1 custom-scrollbar ${
              selectedDevices.length > 10
                ? "flex-nowrap overflow-x-auto whitespace-nowrap"
                : "flex-wrap"
            }`}
          >
            {selectedDevices.map((d) => (
              <span
                key={d.deviceId}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white rounded text-[10px] text-[#16284F] font-semibold border border-gray-200 shrink-0"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    d.isOnline ? "bg-green-500" : "bg-red-400"
                  }`}
                />
                {d.deviceName}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["FaceTemplate", "Card", "Fingerprint"] as EnrollCredType[]).map((type) => (
          <button
            key={type}
            onClick={() => setEnrollCredType(type)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none outline-none ${
              enrollCredType === type
                ? "bg-[#16284F] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type === "FaceTemplate" && <Camera size={14} />}
            {type === "Card" && <IdentificationCard size={14} />}
            {type === "Fingerprint" && <Fingerprint size={14} />}
            {type === "FaceTemplate" ? "Face" : type}
          </button>
        ))}
      </div>

      {enrollCredType === "FaceTemplate" && (
        <FaceCaptureTab
          collegeId={collegeId}
          adminId={adminId}
          selectedUser={selectedUser}
          selectedDevices={selectedDevices}
          onSuccess={onSuccess}
        />
      )}

      {enrollCredType === "Card" && (
        <CardCaptureTab
          collegeId={collegeId}
          adminId={adminId}
          selectedUser={selectedUser}
          selectedDevices={selectedDevices}
          onSuccess={onSuccess}
        />
      )}

      {enrollCredType === "Fingerprint" && (
        <FingerprintCaptureTab
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
