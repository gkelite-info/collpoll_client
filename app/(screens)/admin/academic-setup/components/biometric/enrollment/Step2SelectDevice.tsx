"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getBiometricDevices,
  BiometricDeviceRow,
} from "@/lib/helpers/devices/biometricDeviceAPI";
import { MagnifyingGlass, WifiSlash } from "@phosphor-icons/react";
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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchDevices = async () => {
      setIsFetchingDevices(true);
      const res = await getBiometricDevices(collegeId, 1, 100);
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

  const filteredDevices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return devices;
    return devices.filter(
      (d) =>
        d.deviceName.toLowerCase().includes(query) ||
        d.deviceIp.toLowerCase().includes(query) ||
        d.deviceType.toLowerCase().includes(query) ||
        d.deviceCategory.toLowerCase().includes(query),
    );
  }, [devices, searchQuery]);

  const allActiveFiltered = filteredDevices.filter((d) => d.isActive);
  const allSelected =
    activeDevices.length > 0 && selectedDevices.length === activeDevices.length;

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

      {!isFetchingDevices && devices.length > 0 && (
        <div className="relative mb-3">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search devices by name, IP, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
          />
        </div>
      )}

      {isFetchingDevices ? (
        <DeviceListShimmer />
      ) : devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <WifiSlash size={40} className="text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500 mb-1">No Devices Available</p>
          <p className="text-xs text-gray-400">
            Add a biometric device in the Devices tab to start enrolling users.
          </p>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <MagnifyingGlass size={32} className="text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">
            No devices match &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">
              {selectedDevices.length} of {activeDevices.length} active device{activeDevices.length !== 1 ? "s" : ""} selected
            </span>
            <span className="text-xs text-gray-400">
              {filteredDevices.length} device{filteredDevices.length !== 1 ? "s" : ""} shown
            </span>
          </div>

          <div className="space-y-2 min-h-[200px] max-h-80 overflow-y-auto custom-scrollbar mb-4 pr-0.5">
            {filteredDevices.map((d) => {
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
