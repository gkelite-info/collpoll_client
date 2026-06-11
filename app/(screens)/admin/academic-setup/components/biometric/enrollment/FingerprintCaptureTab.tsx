"use client";

import { useState, useRef, useEffect } from "react";
import { Fingerprint, CaretDown, Check, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { upsertUserCredential } from "@/lib/helpers/devices/userDeviceCredentialAPI";
import { BiometricDeviceRow } from "@/lib/helpers/devices/biometricDeviceAPI";
import { registerUserOnDevice, registerFingerprintOnDevice, captureFingerprint } from "@/lib/helpers/devices/hikvisionAPI";
import { UserSearchResult } from "./types";

interface FingerprintCaptureTabProps {
  collegeId: number;
  adminId: number;
  selectedUser: UserSearchResult;
  selectedDevices: BiometricDeviceRow[];
  onSuccess: () => void;
}

const FINGER_NAMES = [
  "Left Thumb",
  "Left Index",
  "Left Middle",
  "Left Ring",
  "Left Little",
  "Right Thumb",
  "Right Index",
  "Right Middle",
  "Right Ring",
  "Right Little",
];

export default function FingerprintCaptureTab({
  collegeId,
  adminId,
  selectedUser,
  selectedDevices,
  onSuccess,
}: FingerprintCaptureTabProps) {
  const [fingerIndex, setFingerIndex] = useState(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedData, setCapturedData] = useState<string>("");
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

  const handleCaptureFingerprint = async () => {
    if (!captureDevice) {
      toast.error("No capture device selected.");
      return;
    }
    setIsCapturing(true);
    setCapturedData("");
    try {
      const result = await captureFingerprint(captureDevice.deviceId, fingerIndex);
      let extractedData = "";
      if (result?.CaptureFingerPrint?.fingerData) {
        extractedData = result.CaptureFingerPrint.fingerData;
      } else if (result?.FingerPrintCfg?.fingerData) {
        extractedData = result.FingerPrintCfg.fingerData;
      } else if (result?.fingerData) {
        extractedData = result.fingerData;
      } else if (result?.rawXml) {
        const match = result.rawXml.match(/<fingerData>(.*?)<\/fingerData>/);
        if (match) {
          extractedData = match[1];
        }
      }

      if (extractedData) {
        setCapturedData(extractedData);
        toast.success("Fingerprint captured! Click Register to save.");
      } else {
        toast.error("No fingerprint data received. Please try again.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Capture failed";
      toast.error(msg);
    } finally {
      setIsCapturing(false);
    }
  };

  const enrollFingerprint = async () => {
    if (!selectedUser || selectedDevices.length === 0 || !capturedData) return;
    setIsEnrolling(true);
    setEnrollResult(null);

    const initialStatuses: typeof deviceEnrollStatuses = {};
    selectedDevices.forEach((d) => {
      initialStatuses[d.deviceId] = { status: "enrolling" };
    });
    setDeviceEnrollStatuses(initialStatuses);

    try {
      const results = await Promise.all(
        selectedDevices.map(async (device) => {
          try {
            try {
              await registerUserOnDevice(
                device.deviceId,
                selectedUser.userId,
                selectedUser.fullName,
              );
            } catch (e: any) {
              if (e?.subStatusCode !== "employeeNoAlreadyExist") {
                console.warn(`Device ${device.deviceId} user registration warning:`, e);
              }
            }

            await registerFingerprintOnDevice(
              device.deviceId,
              selectedUser.userId,
              fingerIndex,
              capturedData,
            );

            setDeviceEnrollStatuses((prev) => ({
              ...prev,
              [device.deviceId]: { status: "success" },
            }));
            return { deviceId: device.deviceId, success: true };
          } catch (e: unknown) {
            let msg = e instanceof Error ? e.message : "Fingerprint enrollment failed";
            const errObj = e as any;
            const subStatusCode = errObj?.subStatusCode || "";

            if (
              subStatusCode === "fingerPrintAlreadyExist" ||
              subStatusCode === "employeeNoAlreadyExist" ||
              msg.includes("fingerPrintAlreadyExist") ||
              msg.includes("dataAlreadyExist") ||
              msg.toLowerCase().includes("already exist") ||
              msg.toLowerCase().includes("fingerprint register")
            ) {
              msg = "This fingerprint is already registered on this device.";
            }

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

      if (successCount > 0) {
        await upsertUserCredential({
          userId: selectedUser.userId,
          collegeId,
          credentialType: "Fingerprint",
          credentialIdentifier: `FP-${selectedUser.userId}-${fingerIndex}`,
          fingerIndex,
          enrolledBy: adminId,
        });

        if (successCount === selectedDevices.length) {
          setEnrollResult({ success: true, message: `Fingerprint registered successfully on all ${selectedDevices.length} devices!` });
          toast.success("Fingerprint enrolled on all devices!");
        } else {
          setEnrollResult({
            success: true,
            message: `Fingerprint registered on ${successCount}/${selectedDevices.length} devices. (${selectedDevices.length - successCount} failed)`,
          });
          toast.success(`Fingerprint enrolled on ${successCount}/${selectedDevices.length} devices.`);
        }
        onSuccess();
      } else {
        setEnrollResult({
          success: false,
          message: `Fingerprint enrollment failed on all devices. Details: ${errors.join(", ")}`,
        });

        if (errors.length > 0) {
          if (errors[0].includes("already registered on this device")) {
            toast.error("This fingerprint is already registered on the device.");
          } else {
            toast.error(errors[0]);
          }
        } else {
          toast.error("Fingerprint enrollment failed on all devices.");
        }
      }
    } catch (e: unknown) {
      let msg = e instanceof Error ? e.message : "Fingerprint enrollment failed";

      // Intercept DB constraint errors (e.g. duplicate key, unique constraint)
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
      toast.error(msg);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-[#16284F]">Select Finger</label>
        <div className="grid grid-cols-5 gap-2">
          {FINGER_NAMES.map((name, i) => (
            <button
              key={i}
              onClick={() => setFingerIndex(i + 1)}
              className={`p-2 rounded-lg text-[10px] font-medium text-center transition-all cursor-pointer border-none outline-none ${
                fingerIndex === i + 1
                  ? "bg-[#16284F] text-white shadow-sm font-semibold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1 bg-gray-50 border border-gray-100 p-3 rounded-lg" ref={captureDropdownRef}>
        <label className="text-xs font-semibold text-gray-500 block mb-1">
          Capture Device (Select device with fingerprint reader to capture template):
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
            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
              {selectedDevices.map((d) => (
                <button
                  key={d.deviceId}
                  type="button"
                  onClick={() => {
                    setCaptureDevice(d);
                    setIsCaptureDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                    d.deviceId === captureDevice?.deviceId
                      ? "bg-[#D6F1E2] text-[#43C17A]"
                      : "text-[#2D3748]"
                  }`}
                >
                  <span>{d.deviceName} ({d.isOnline ? "Online" : "Offline"})</span>
                  {d.deviceId === captureDevice?.deviceId && <Check size={14} weight="bold" className="text-[#43C17A]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 text-center bg-white">
        <Fingerprint
          size={48}
          className={`mx-auto mb-3 ${
            capturedData
              ? "text-[#43C17A]"
              : isCapturing
              ? "text-amber-500 animate-pulse"
              : "text-gray-300"
          }`}
        />
        {capturedData ? (
          <p className="text-sm text-[#1E8E3E] font-semibold">✓ Fingerprint captured</p>
        ) : isCapturing ? (
          <p className="text-sm text-amber-600 font-medium">
            Place finger on {captureDevice?.deviceName || "scanner"}...
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Click below to start fingerprint capture
          </p>
        )}
        <button
          type="button"
          onClick={handleCaptureFingerprint}
          disabled={isCapturing || !captureDevice?.isOnline}
          className="mt-3 px-5 py-2 bg-[#16284F] text-white rounded-lg text-sm font-medium hover:bg-[#1e3a6a] disabled:opacity-60 transition-colors cursor-pointer border-none outline-none"
        >
          {isCapturing ? "Capturing..." : !captureDevice?.isOnline ? "Device Offline" : "Start Capture"}
        </button>
      </div>

      <button
        onClick={enrollFingerprint}
        disabled={!capturedData || isEnrolling}
        className="w-full py-2.5 bg-[#43C17A] text-white rounded-lg font-medium hover:bg-[#3ab06e] disabled:opacity-60 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold border-none"
      >
        {isEnrolling && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        Register Fingerprint
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
