"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, CheckCircle, WarningCircle, UploadSimple, X, VideoCamera } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { getCredentialsForUser, upsertUserCredential, uploadFaceCredentialImage } from "@/lib/helpers/devices/userDeviceCredentialAPI";
import { BiometricDeviceRow } from "@/lib/helpers/devices/biometricDeviceAPI";
import { registerUserOnDevice, registerFaceOnDevice } from "@/lib/helpers/devices/hikvisionAPI";
import { UserSearchResult } from "./types";
import imageCompression from 'browser-image-compression';
import { getBiometricValidity } from "@/lib/helpers/biometric/biometricValidity";

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
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [enrollResult, setEnrollResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [deviceEnrollStatuses, setDeviceEnrollStatuses] = useState<
    Record<number, { status: "idle" | "enrolling" | "success" | "failed"; error?: string }>
  >({});

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Bind stream to video element when it mounts
  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (err) {
      toast.error("Unable to access camera. Please check browser permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Draw mirrored if using front camera (optional, but standard UX)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: "image/jpeg" });
      
      stopCamera();
      await processAndSetImage(file);
    }, "image/jpeg", 0.9);
  };

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

    await processAndSetImage(file);
    e.target.value = "";
  };

  const processAndSetImage = async (file: File) => {
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
      fileToUpload = file;
    }

    if (fileToUpload.size > 1 * 1024 * 1024) {
      toast.error("Image could not be compressed enough. Please use a smaller file.");
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
              const { beginTime, endTime } = getBiometricValidity(selectedUser.role, selectedUser.educationType);
              await registerUserOnDevice(
                device.deviceId,
                selectedUser.userId,
                selectedUser.fullName,
                beginTime,
                endTime
              );
            } catch (e: unknown) {
              const subStatusCode =
                typeof e === "object" && e !== null && "subStatusCode" in e
                  ? (e as { subStatusCode?: string }).subStatusCode
                  : undefined;
              if (subStatusCode === "employeeNoAlreadyExist") {
                // Already handled
              } else {
                throw e;
              }
            }

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
        
        if (errors.length > 0) {
          if (errors[0].includes("already has a face registered")) {
            toast.error("This user already has a face registered on the device.");
          } else {
            toast.error(errors[0]);
          }
        } else {
          toast.error("Face enrollment failed on all devices.");
        }
      }
    } catch (e: unknown) {
      let msg = e instanceof Error ? e.message : "Face enrollment failed";
      
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
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#43C17A] transition-colors bg-white min-h-[200px] flex flex-col items-center justify-center">
        {isCameraOpen ? (
          <div className="flex flex-col items-center gap-3 w-full animate-in fade-in zoom-in duration-200">
            <div className="relative w-full max-w-[240px] rounded-xl overflow-hidden bg-black aspect-square shadow-inner">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
            <div className="flex items-center justify-center gap-3 w-full mt-2">
              <button
                onClick={stopCamera}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer border-none flex-1 max-w-[120px]"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-[#43C17A] hover:bg-[#3ab06e] rounded-lg transition-colors cursor-pointer border-none flex items-center justify-center gap-2 flex-1 max-w-[120px] shadow-sm"
              >
                <Camera size={18} weight="bold" />
                Capture
              </button>
            </div>
          </div>
        ) : facePreview ? (
          <div className="flex flex-col items-center gap-3 animate-in fade-in duration-200">
            <img
              src={facePreview}
              alt="Face preview"
              className="w-32 h-32 rounded-xl object-cover shadow-sm ring-4 ring-[#43C17A]/20"
            />
            <button
              onClick={() => {
                setFaceImage(null);
                setFacePreview("");
              }}
              className="text-xs text-red-500 hover:text-red-600 font-semibold cursor-pointer border-none bg-red-50 px-3 py-1.5 rounded-full outline-none flex items-center gap-1.5 transition-colors"
            >
              <X size={14} weight="bold" /> Remove Image
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="w-16 h-16 bg-[#E6F4EA]/50 rounded-full flex items-center justify-center mb-1">
              <Camera size={32} className="text-[#43C17A]" weight="duotone" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-[15px] text-[#16284F] font-bold">Add Face Photo</p>
              <p className="text-[11px] text-gray-500 max-w-[200px] leading-tight">
                Upload an image or take a clear photo with your camera
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-3 w-full mt-3">
              <label className="flex-1 max-w-[140px] py-2.5 px-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-[#43C17A] hover:text-[#43C17A] hover:bg-[#E6F4EA]/30 transition-all cursor-pointer flex items-center justify-center gap-2 text-[13px] font-bold shadow-sm">
                <UploadSimple size={18} weight="bold" />
                Upload File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFaceImageChange}
                  className="hidden"
                />
              </label>
              <button
                onClick={startCamera}
                className="flex-1 max-w-[140px] py-2.5 px-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-[#43C17A] hover:text-[#43C17A] hover:bg-[#E6F4EA]/30 transition-all cursor-pointer flex items-center justify-center gap-2 text-[13px] font-bold shadow-sm"
              >
                <VideoCamera size={18} weight="bold" />
                Take Photo
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={enrollFace}
        disabled={!faceImage || isEnrolling || isCameraOpen}
        className="w-full py-3 bg-[#43C17A] text-white rounded-lg hover:bg-[#3ab06e] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 text-sm font-bold border-none shadow-sm"
      >
        {isEnrolling && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {isEnrolling ? "Registering Face..." : "Register Face on Devices"}
      </button>

      {(isEnrolling || Object.keys(deviceEnrollStatuses).length > 0) && (
        <div className="border border-gray-200 rounded-xl p-3.5 mt-4 bg-gray-50 space-y-2.5">
          <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-3">Device Sync Status:</p>
          {selectedDevices.map((d) => {
            const statusInfo = deviceEnrollStatuses[d.deviceId];
            if (!statusInfo) return null;
            return (
              <div key={d.deviceId} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-200/60 last:border-0">
                <span className="font-semibold text-[#16284F]">{d.deviceName}</span>
                <div className="flex items-center gap-1.5">
                  {statusInfo.status === "enrolling" && (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#43C17A] border-t-transparent rounded-full animate-spin shrink-0" />
                      <span className="text-gray-500 font-medium">Syncing...</span>
                    </>
                  )}
                  {statusInfo.status === "success" && (
                    <span className="text-green-600 font-bold flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded-md">
                      <CheckCircle size={15} weight="fill" /> Success
                    </span>
                  )}
                  {statusInfo.status === "failed" && (
                    <span className="text-red-600 font-bold flex items-center gap-1.5 bg-red-50 px-2 py-0.5 rounded-md" title={statusInfo.error}>
                      <WarningCircle size={15} weight="fill" /> Failed
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
          className={`mt-4 p-3.5 rounded-xl flex items-center gap-2.5 text-sm font-semibold ${
            enrollResult.success
              ? "bg-[#E6F4EA] text-[#1E8E3E] border border-[#43C17A]/20"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {enrollResult.success ? (
            <CheckCircle size={20} weight="fill" className="shrink-0" />
          ) : (
            <WarningCircle size={20} weight="fill" className="shrink-0" />
          )}
          <span>{enrollResult.message}</span>
        </div>
      )}
    </div>
  );
}
