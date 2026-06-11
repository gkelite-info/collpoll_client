"use client";

import { useState } from "react";
import { Camera, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { getCredentialsForUser, upsertUserCredential, uploadFaceCredentialImage } from "@/lib/helpers/devices/userDeviceCredentialAPI";
import { BiometricDeviceRow } from "@/lib/helpers/devices/biometricDeviceAPI";
import { registerUserOnDevice, registerFaceOnDevice } from "@/lib/helpers/devices/hikvisionAPI";
import { UserSearchResult } from "./types";
import imageCompression from 'browser-image-compression';

interface FaceCaptureTabProps {
  collegeId: number;
  adminId: number;
  selectedUser: UserSearchResult;
  selectedDevices: BiometricDeviceRow[];
  onSuccess: () => void;
}

export default function FaceCaptureTab({
  collegeId,
  adminId,
  selectedUser,
  selectedDevices,
  onSuccess,
}: FaceCaptureTabProps) {
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [facePreview, setFacePreview] = useState<string>("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollResult, setEnrollResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [deviceEnrollStatuses, setDeviceEnrollStatuses] = useState<
    Record<number, { status: "idle" | "enrolling" | "success" | "failed"; error?: string }>
  >({});

  const handleFaceImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please upload only JPG, PNG or WEBP images.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.");
      e.target.value = "";
      return;
    }

    let fileToUpload = file;
    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1080,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: 0.85
      };
      const compressedBlob = await imageCompression(file, options);
      const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
      fileToUpload = new File([compressedBlob], newFileName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    } catch {
      console.error("Compression failed, using original.");
    }

    if (fileToUpload.size > 1 * 1024 * 1024) {
      toast.error("Image could not be compressed enough. Please use a smaller file.");
      e.target.value = "";
      return;
    }

    setFaceImage(fileToUpload);
    const reader = new FileReader();
    reader.onload = () => setFacePreview(reader.result as string);
    reader.readAsDataURL(fileToUpload);
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
      const results = await Promise.all(
        selectedDevices.map(async (device) => {
          try {
            try {
              await registerUserOnDevice(
                device.deviceId,
                selectedUser.userId,
                selectedUser.fullName,
              );
            } catch (e: unknown) {
              const subStatusCode =
                typeof e === "object" && e !== null && "subStatusCode" in e
                  ? (e as { subStatusCode?: string }).subStatusCode
                  : undefined;
              if (subStatusCode !== "employeeNoAlreadyExist") {
                console.warn(`Device ${device.deviceId} user registration warning:`, e);
              }
            }

            // Provide the compressed image file directly for multipart upload
            await registerFaceOnDevice(
              device.deviceId,
              selectedUser.userId,
              faceImage,
            );

            setDeviceEnrollStatuses((prev) => ({
              ...prev,
              [device.deviceId]: { status: "success" },
            }));
            return { deviceId: device.deviceId, success: true };
          } catch (e: unknown) {
            let msg = e instanceof Error ? e.message : "Face enrollment failed";
            const errObj = e as any;
            const subStatusCode = errObj?.subStatusCode || "";
            
            // Map Hikvision raw errors to user-friendly messages
            if (
              subStatusCode === "employeeNoAlreadyExist" ||
              subStatusCode === "deviceUserAlreadyExistFace" ||
              msg.includes("employeeNoAlreadyExist") ||
              msg.includes("dataAlreadyExist") ||
              msg.toLowerCase().includes("already exist") ||
              msg.toLowerCase().includes("face register")
            ) {
              msg = "This user already has a face registered on this device.";
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
        let imageUrl: string | null = null;
        
        const uploadRes = await uploadFaceCredentialImage(selectedUser.userId, faceImage);
        if (uploadRes.success && uploadRes.imageUrl) {
          imageUrl = uploadRes.imageUrl;
        } else {
          throw new Error(uploadRes.error || "Face registered on device, but failed to save image to cloud storage.");
        }

        const existingCredentials = await getCredentialsForUser(selectedUser.userId, collegeId);
        const existingFaceCredential = existingCredentials.success
          ? existingCredentials.data.find((credential) => credential.credentialType === "FaceTemplate")
          : undefined;

        const saveRes = await upsertUserCredential({
          userDeviceCredentialId: existingFaceCredential?.userDeviceCredentialId,
          userId: selectedUser.userId,
          collegeId,
          credentialType: "FaceTemplate",
          credentialIdentifier: `FACE-${selectedUser.userId}`,
          enrolledBy: adminId,
          imageUrl,
        });
        if (!saveRes.success) {
          throw new Error(saveRes.error || "Face registered on device, but failed to save credential.");
        }

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
        
        // Show the specific error if possible, rather than a generic one
        if (errors.length > 0) {
          // If the error contains our friendly mapped string, show it cleanly
          if (errors[0].includes("already has a face registered")) {
            toast.error("This user already has a face registered on the device.");
          } else {
            // Otherwise show the first device's error
            toast.error(errors[0]);
          }
        } else {
          toast.error("Face enrollment failed on all devices.");
        }
      }
    } catch (e: unknown) {
      let msg = e instanceof Error ? e.message : "Face enrollment failed";
      
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
              JPG, PNG, WEBP — max 5MB
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
