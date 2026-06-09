"use client";

import { useState, useEffect } from "react";
import {
  getBiometricDevices,
  BiometricDeviceRow,
} from "@/lib/helpers/devices/biometricDeviceAPI";
import DeviceListShimmer from "../shimmers/DeviceListShimmer";
import { UserSearchResult } from "./types";

interface Step2SelectDeviceProps {
  collegeId: number;
  selectedUser: UserSearchResult;
  onNext: (selectedDevices: BiometricDeviceRow[]) => void;
}

export default function Step2SelectDevice({
  collegeId,
  selectedUser,
  onNext,
}: Step2SelectDeviceProps) {
  const [devices, setDevices] = useState<BiometricDeviceRow[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<BiometricDeviceRow[]>([]);
  const [isFetchingDevices, setIsFetchingDevices] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDevices = async () => {
      setIsFetchingDevices(true);
      const res = await getBiometricDevices(collegeId, 1, 50);
      if (res.success && isMounted) {
        setDevices(res.data);
        const activeDevices = res.data.filter((d) => d.isActive);
        setSelectedDevices(activeDevices);
      }
      if (isMounted) setIsFetchingDevices(false);
    };
    fetchDevices();
    return () => {
      isMounted = false;
    };
  }, [collegeId]);

  const toggleDevice = (device: BiometricDeviceRow) => {
    if (selectedDevices.some((d) => d.deviceId === device.deviceId)) {
      setSelectedDevices(selectedDevices.filter((d) => d.deviceId !== device.deviceId));
    } else {
      setSelectedDevices([...selectedDevices, device]);
    }
  };

  const activeDevices = devices.filter((d) => d.isActive);
  const allSelected = activeDevices.length > 0 && selectedDevices.length === activeDevices.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(activeDevices);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-[#E6F4EA]/30 border border-[#43C17A]/20 rounded-lg p-3 mb-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-[#16284F] text-sm">{selectedUser.fullName}</p>
          <p className="text-xs text-gray-500">{selectedUser.email}</p>
        </div>
        <span className="text-xs bg-[#43C17A] text-white px-2.5 py-0.5 rounded-full font-semibold">
          {selectedUser.role}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600 font-medium">Select devices to enroll on:</p>
        {!isFetchingDevices && activeDevices.length > 0 && (
          <label className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-[#43C17A] focus:ring-[#43C17A] cursor-pointer"
            />
            Select All Active
          </label>
        )}
      </div>

      {isFetchingDevices ? (
        <DeviceListShimmer />
      ) : devices.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          No devices available. Add a device first.
        </p>
      ) : (
        <>
          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar mb-4">
            {devices.map((d) => {
              const isChecked = selectedDevices.some((sd) => sd.deviceId === d.deviceId);
              return (
                <div
                  key={d.deviceId}
                  onClick={() => d.isActive && toggleDevice(d)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer ${
                    !d.isActive
                      ? "border-gray-200 opacity-50 cursor-not-allowed"
                      : isChecked
                      ? "border-[#43C17A] bg-[#E6F4EA]/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={!d.isActive}
                      onChange={() => {}} // Handled by parent click
                      className="rounded border-gray-300 text-[#43C17A] focus:ring-[#43C17A] shrink-0 cursor-pointer"
                    />
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        d.isOnline ? "bg-green-500 animate-pulse" : "bg-red-400"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#16284F] text-sm truncate">{d.deviceName}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {d.deviceIp}:{d.devicePort} ·{" "}
                        {d.deviceType === "facerecognition" ? "Face" : d.deviceType}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium capitalize shrink-0 ml-2">
                    {d.deviceCategory}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNext(selectedDevices)}
            disabled={selectedDevices.length === 0}
            className="w-full py-2.5 bg-[#43C17A] text-white rounded-lg font-medium hover:bg-[#3ab06e] disabled:opacity-50 transition-colors cursor-pointer text-center text-sm font-semibold border-none"
          >
            Proceed to Enroll ({selectedDevices.length} Selected)
          </button>
        </>
      )}
    </div>
  );
}
