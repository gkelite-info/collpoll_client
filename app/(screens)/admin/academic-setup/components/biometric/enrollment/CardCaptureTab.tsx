"use client";

import { useState, useRef, useEffect } from "react";
import { IdentificationCard, CaretDown, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { upsertUserCredential } from "@/lib/helpers/devices/userDeviceCredentialAPI";
import { upsertUserDeviceSync } from "@/lib/helpers/devices/userDeviceSyncAPI";
import { BiometricDeviceRow } from "@/lib/helpers/devices/biometricDeviceAPI";
import { registerUserOnDevice, registerCardOnDevice, captureCard } from "@/lib/helpers/devices/hikvisionAPI";
import { UserSearchResult } from "./types";
import { getBiometricValidity } from "@/lib/helpers/biometric/biometricValidity";

interface CardCaptureTabProps {
  collegeId: number;
  adminId: number;
  selectedUser: UserSearchResult;
  selectedDevices: BiometricDeviceRow[];
  onSuccess: () => void;
}

export default function CardCaptureTab({
  collegeId,
  adminId,
  selectedUser,
  selectedDevices,
  onSuccess,
}: CardCaptureTabProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [isCapturingCard, setIsCapturingCard] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollResult, setEnrollResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [deviceEnrollStatuses, setDeviceEnrollStatuses] = useState<
    Record<number, { status: "idle" | "enrolling" | "success" | "failed"; error?: string }>
  >({});

  const [captureDevice, setCaptureDevice] = useState<BiometricDeviceRow | null>(() => {
    const onlineSelected = selectedDevices.find((sd) => sd.isOnline);
    return onlineSelected || selectedDevices[0] || null;
  });
  const [isCaptureDropdownOpen, setIsCaptureDropdownOpen] = useState(false);
  const captureDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (captureDropdownRef.current && !captureDropdownRef.current.contains(event.target as Node)) {
        setIsCaptureDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCaptureCard = async () => {
    if (!captureDevice) {
      toast.error("Please select a capture device first.", { id: "card-no-device" });
      return;
    }
    setIsCapturingCard(true);
    setCardNumber("");
    
    try {
      const res = await captureCard(captureDevice.deviceId);
      const cardNo = res?.CardInfo?.cardNo || res?.CardInfoSearch?.CardInfo?.[0]?.cardNo || res?.cardNo;
      
      if (cardNo) {
        setCardNumber(String(cardNo));
        toast.success("Card read successfully!", { id: "card-read-success" });
      } else {
        toast.error("No card detected. Please try tapping the card again.", { id: "card-read-empty" });
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to read card. Please check the device connection.", { id: "card-read-error" });
    } finally {
      setIsCapturingCard(false);
    }
  };

  const enrollCard = async () => {
    const cardVal = cardNumber.trim();
    if (!selectedUser || selectedDevices.length === 0 || !cardVal) return;

    if (!/^[A-Za-z0-9]+$/.test(cardVal)) {
      toast.error("Invalid card format. Please use only alphanumeric characters.", { id: "card-format-err" });
      return;
    }

    setIsEnrolling(true);
    setEnrollResult(null);

    const initialStatuses: typeof deviceEnrollStatuses = {};
    selectedDevices.forEach((d) => {
      initialStatuses[d.deviceId] = { status: "enrolling" };
    });
    setDeviceEnrollStatuses(initialStatuses);

    try {
      const saveRes = await upsertUserCredential({
        userId: selectedUser.userId,
        collegeId,
        credentialType: "Card",
        credentialIdentifier: cardVal,
        enrolledBy: adminId,
      });

      if (!saveRes.success || !saveRes.data) {
        throw new Error(saveRes.error || "Failed to save credential to database.");
      }

      const credentialId = saveRes.data.userDeviceCredentialId;

      await Promise.all(
        selectedDevices.map((device) =>
          upsertUserDeviceSync({
            userDeviceCredentialId: credentialId,
            deviceId: device.deviceId,
            syncStatus: "Pending",
          })
        )
      );

      const results = await Promise.all(
        selectedDevices.map(async (device) => {
          try {
            try {
              const { beginTime, endTime } = getBiometricValidity(selectedUser.role, selectedUser.educationType);
              await registerUserOnDevice(
                device.deviceId,
                selectedUser.userId,
                selectedUser.fullName,
                beginTime,
                endTime
              );
            } catch (e: any) {
              const subStatusCode = e?.subStatusCode || "";
              if (subStatusCode !== "employeeNoAlreadyExist") throw e;
            }

            await registerCardOnDevice(
              device.deviceId,
              selectedUser.userId,
              cardVal,
            );

            await upsertUserDeviceSync({
              userDeviceCredentialId: credentialId,
              deviceId: device.deviceId,
              syncStatus: "Success",
            });

            setDeviceEnrollStatuses((prev) => ({
              ...prev,
              [device.deviceId]: { status: "success" },
            }));
            return { deviceId: device.deviceId, success: true };
          } catch (e: unknown) {
            let msg = e instanceof Error ? e.message : "Card enrollment failed";
            const errObj = e as any;
            const subStatusCode = errObj?.subStatusCode || "";

            if (
              subStatusCode === "cardNoAlreadyExist" ||
              msg.includes("cardNoAlreadyExist") ||
              msg.includes("dataAlreadyExist") ||
              msg.toLowerCase().includes("already exist")
            ) {
              msg = "This card number is already registered on this device.";
            }

            await upsertUserDeviceSync({
              userDeviceCredentialId: credentialId,
              deviceId: device.deviceId,
              syncStatus: "Failed",
              failureReason: msg,
            });

            setDeviceEnrollStatuses((prev) => ({
              ...prev,
              [device.deviceId]: { status: "failed", error: msg },
            }));
            return { deviceId: device.deviceId, success: false, error: `${device.deviceName}: ${msg}` };
          }
        })
      );

      const successCount = results.filter((r) => r.success).length;
      const errors = results.filter((r) => !r.success).map((r) => r.error).filter(Boolean) as string[];

      if (successCount === selectedDevices.length) {
        setEnrollResult({ success: true, message: `Card registered successfully on all ${selectedDevices.length} devices!` });
        toast.success("Card enrolled on all devices!", { id: "card-enroll-success" });
      } else if (successCount > 0) {
        setEnrollResult({
          success: true,
          message: `Card saved to database and registered on ${successCount}/${selectedDevices.length} devices. Offline devices will sync automatically.`,
        });
        toast.success(`Card enrolled on ${successCount}/${selectedDevices.length} devices.`, { id: "card-enroll-partial" });
      } else {
        setEnrollResult({
          success: false,
          message: `Card saved to database but physical sync failed on all devices. Details: ${errors.join(", ")}`,
        });
        toast.error("Physical enrollment failed, but credential is saved and will retry later.", { id: "card-enroll-fail" });
      }
      onSuccess();
    } catch (e: unknown) {
      let msg = e instanceof Error ? e.message : "Card enrollment failed";

      if (
        msg.includes("duplicate key") || 
        msg.includes("Unique constraint") || 
        msg.includes("violates") || 
        msg.includes("already exists") ||
        msg.includes("P2002") || 
        msg.includes("23505")
      ) {
        msg = "This credential data already exists in the system database.";
      }

      setEnrollResult({ success: false, message: msg });
      toast.error(msg, { id: "card-enroll-error" });
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1 bg-gray-50 border border-gray-100 p-3 rounded-lg" ref={captureDropdownRef}>
        <label className="text-xs font-semibold text-gray-500 block mb-1">
          Capture Device (Select device to read card from):
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCaptureDropdownOpen(!isCaptureDropdownOpen)}
            className={`w-full border ${
              isCaptureDropdownOpen ? "border-[#43C17A] ring-1 ring-[#43C17A]" : "border-gray-300"
            } rounded-lg px-2.5 py-2 pr-8 outline-none text-xs font-semibold text-[#2D3748] bg-white cursor-pointer flex justify-between items-center text-left transition-all min-h-[36px] relative`}
          >
            <span className="truncate">
              {captureDevice 
                ? `${captureDevice.deviceName} (${captureDevice.isOnline ? "Online" : "Offline"})`
                : "Select a device"}
            </span>
            <CaretDown
              size={14}
              className="absolute right-2.5 top-1/2 text-gray-400 pointer-events-none transition-transform duration-200"
              style={{
                transform: `translateY(-50%) ${isCaptureDropdownOpen ? "rotate(180deg)" : "rotate(0deg)"}`,
              }}
            />
          </button>

          {isCaptureDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
              {selectedDevices.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500 text-center">
                  No devices selected for enrollment
                </div>
              ) : (
                selectedDevices.map((d) => (
                  <button
                    key={d.deviceId}
                    type="button"
                    onClick={() => {
                      setCaptureDevice(d);
                      setIsCaptureDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors border-none outline-none cursor-pointer ${
                      captureDevice?.deviceId === d.deviceId
                        ? "bg-[#43C17A]/10 text-[#43C17A] font-bold"
                        : "text-[#2D3748] hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{d.deviceName}</span>
                      <span className="text-[10px] text-gray-400">{d.deviceIp}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={handleCaptureCard}
          disabled={!captureDevice || isCapturingCard}
          className="mt-3 w-full py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:border-[#43C17A] hover:text-[#43C17A] transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[80px]"
        >
          {isCapturingCard ? (
            <>
              <div className="w-5 h-5 border-2 border-[#43C17A] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#43C17A]">Waiting for card tap on device...</span>
            </>
          ) : (
            <>
              <IdentificationCard size={24} weight="duotone" />
              <span>Click here and tap card on device</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-[#16284F]">
          Card Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. 1234567890 (Auto-filled by scan)"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] font-mono text-lg text-center tracking-wider font-semibold bg-gray-50"
        />
        <p className="text-[10px] text-gray-400">
          Card number should be scanned from the device. You can edit if needed.
        </p>
      </div>
      <button
        onClick={enrollCard}
        disabled={!cardNumber.trim() || isEnrolling}
        className="w-full py-2.5 bg-[#43C17A] text-white rounded-lg font-medium hover:bg-[#3ab06e] disabled:opacity-60 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold border-none"
      >
        {isEnrolling && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        Register Card
      </button>

      {(isEnrolling || Object.keys(deviceEnrollStatuses).length > 0) && (
        <div className="border border-gray-200 rounded-lg p-3 mt-4 bg-gray-50/50 space-y-2">
          <p className="text-xs font-bold text-gray-500 mb-2">Device Enrollment Sync Status:</p>
          {selectedDevices.map((d) => {
            const statusInfo = deviceEnrollStatuses[d.deviceId];
            if (!statusInfo) return null;
            return (
              <div key={d.deviceId} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                <span className="font-medium text-[#16284F]">{d.deviceName}</span>
                <div className="flex items-center gap-1.5">
                  {statusInfo.status === "enrolling" && (
                    <>
                      <div className="w-3 h-3 border border-[#43C17A] border-t-transparent rounded-full animate-spin shrink-0" />
                      <span className="text-gray-500">Enrolling...</span>
                    </>
                  )}
                  {statusInfo.status === "success" && (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle size={14} weight="fill" /> Success
                    </span>
                  )}
                  {statusInfo.status === "failed" && (
                    <span className="text-red-500 font-semibold flex items-center gap-1" title={statusInfo.error}>
                      <WarningCircle size={14} weight="fill" /> Failed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {enrollResult && (
        <div
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
            enrollResult.success
              ? "bg-[#E6F4EA] text-[#1E8E3E]"
              : "bg-red-50 text-red-600"
          }`}
        >
          {enrollResult.success ? (
            <CheckCircle size={18} weight="fill" />
          ) : (
            <WarningCircle size={18} weight="fill" />
          )}
          {enrollResult.message}
        </div>
      )}
    </div>
  );
}
