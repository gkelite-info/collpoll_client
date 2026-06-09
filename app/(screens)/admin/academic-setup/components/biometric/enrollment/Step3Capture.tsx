"use client";

import { useState, useRef, useEffect } from "react";
import {
  Fingerprint,
  IdentificationCard,
  Camera,
  CaretDown,
  Check,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { upsertUserCredential } from "@/lib/helpers/devices/userDeviceCredentialAPI";
import { BiometricDeviceRow } from "@/lib/helpers/devices/biometricDeviceAPI";
import {
  registerUserOnDevice,
  registerCardOnDevice,
  registerFaceBase64OnDevice,
  captureFingerprint,
  registerFingerprintOnDevice,
} from "@/lib/helpers/devices/hikvisionAPI";
import { UserSearchResult, EnrollCredType } from "./types";

interface Step3CaptureProps {
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

export default function Step3Capture({
  collegeId,
  adminId,
  selectedUser,
  selectedDevices,
  onSuccess,
}: Step3CaptureProps) {
  const [enrollCredType, setEnrollCredType] = useState<EnrollCredType>("FaceTemplate");
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

  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [facePreview, setFacePreview] = useState<string>("");
  const [cardNumber, setCardNumber] = useState("");
  const [fingerIndex, setFingerIndex] = useState(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedData, setCapturedData] = useState<string>("");

  const handleFaceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaceImage(file);
    const reader = new FileReader();
    reader.onload = () => setFacePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const enrollFace = async () => {
    if (!selectedUser || selectedDevices.length === 0 || !faceImage) return;
    setIsEnrolling(true);
    setEnrollResult(null);

    const initialStatuses: typeof deviceEnrollStatuses = {};
    selectedDevices.forEach((d) => {
      initialStatuses[d.deviceId] = { status: "enrolling" };
    });
    setDeviceEnrollStatuses(initialStatuses);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.readAsDataURL(faceImage);
      });

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

            await registerFaceBase64OnDevice(
              device.deviceId,
              selectedUser.userId,
              base64,
            );

            setDeviceEnrollStatuses((prev) => ({
              ...prev,
              [device.deviceId]: { status: "success" },
            }));
            return { deviceId: device.deviceId, success: true };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Face enrollment failed";
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
          credentialType: "FaceTemplate",
          credentialIdentifier: `FACE-${selectedUser.userId}`,
          enrolledBy: adminId,
        });

        if (successCount === selectedDevices.length) {
          setEnrollResult({ success: true, message: `Face registered successfully on all ${selectedDevices.length} devices!` });
          toast.success("Face enrolled on all devices!");
        } else {
          setEnrollResult({
            success: true,
            message: `Face registered on ${successCount}/${selectedDevices.length} devices. (${selectedDevices.length - successCount} failed)`,
          });
          toast.success(`Face enrolled on ${successCount}/${selectedDevices.length} devices.`);
        }
        onSuccess();
      } else {
        setEnrollResult({
          success: false,
          message: `Face enrollment failed on all devices. Details: ${errors.join(", ")}`,
        });
        toast.error("Face enrollment failed on all devices.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Face enrollment failed";
      setEnrollResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setIsEnrolling(false);
    }
  };

  const enrollCard = async () => {
    const cardVal = cardNumber.trim();
    if (!selectedUser || selectedDevices.length === 0 || !cardVal) return;

    if (!/^[a-zA-Z0-9]{10,20}$/.test(cardVal)) {
      toast.error("Invalid card format. Please enter between 10 and 20 alphanumeric characters.");
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

            await registerCardOnDevice(
              device.deviceId,
              selectedUser.userId,
              cardVal,
            );

            setDeviceEnrollStatuses((prev) => ({
              ...prev,
              [device.deviceId]: { status: "success" },
            }));
            return { deviceId: device.deviceId, success: true };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Card enrollment failed";
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
          credentialType: "Card",
          credentialIdentifier: cardVal,
          enrolledBy: adminId,
        });

        if (successCount === selectedDevices.length) {
          setEnrollResult({ success: true, message: `Card registered successfully on all ${selectedDevices.length} devices!` });
          toast.success("Card enrolled on all devices!");
        } else {
          setEnrollResult({
            success: true,
            message: `Card registered on ${successCount}/${selectedDevices.length} devices. (${selectedDevices.length - successCount} failed)`,
          });
          toast.success(`Card enrolled on ${successCount}/${selectedDevices.length} devices.`);
        }
        onSuccess();
      } else {
        setEnrollResult({
          success: false,
          message: `Card enrollment failed on all devices. Details: ${errors.join(", ")}`,
        });
        toast.error("Card enrollment failed on all devices.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Card enrollment failed";
      setEnrollResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setIsEnrolling(false);
    }
  };

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
            const msg = e instanceof Error ? e.message : "Fingerprint enrollment failed";
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
        toast.error("Fingerprint enrollment failed on all devices.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fingerprint enrollment failed";
      setEnrollResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setIsEnrolling(false);
    }
  };

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
            onClick={() => {
              setEnrollCredType(type);
              setEnrollResult(null);
            }}
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
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#43C17A] transition-colors bg-white">
            {facePreview ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={facePreview}
                  alt="Face preview"
                  className="w-32 h-32 rounded-xl object-cover shadow-sm"
                />
                <button
                  onClick={() => {
                    setFaceImage(null);
                    setFacePreview("");
                  }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer border-none bg-transparent outline-none"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 cursor-pointer">
                <Camera size={40} className="text-gray-300" />
                <span className="text-sm text-gray-500">Click to upload face photo</span>
                <span className="text-[10px] text-gray-400">
                  JPG, PNG — clear, front-facing
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFaceImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <button
            onClick={enrollFace}
            disabled={!faceImage || isEnrolling}
            className="w-full py-2.5 bg-[#43C17A] text-white rounded-lg font-medium hover:bg-[#3ab06e] disabled:opacity-60 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold border-none"
          >
            {isEnrolling && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Register Face
          </button>
        </div>
      )}

      {enrollCredType === "Card" && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#16284F]">
              Card Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 1234567890"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] font-mono text-lg text-center tracking-wider font-semibold"
            />
            <p className="text-[10px] text-gray-400">
              Enter the number printed or encoded on the access card.
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
        </div>
      )}

      {enrollCredType === "Fingerprint" && (
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
        </div>
      )}

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
