"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import imageCompression from 'browser-image-compression';
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { getCollegeMedia, upsertCollegeMedia } from "@/lib/helpers/admin/academicSetup/collegeMediaAPI";
import { uploadCollegeMediaFile, deleteCollegeMediaByUrl, validateMediaFile } from "@/lib/helpers/admin/academicSetup/collegeMediaStorageAPI";
import ConfirmDeleteModal from "../../../calendar/components/ConfirmDeleteModal";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

type Tab = "logo" | "banner";

export default function CollegeMediaStructure() {
  const [activeTab, setActiveTab] = useState<Tab>("logo");
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [mediaId, setMediaId] = useState<number | undefined>(undefined);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [originalLogo, setOriginalLogo] = useState<string | null>(null);
  const [originalBanner, setOriginalBanner] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<Tab | null>(null);

  const { userId, collegeId, adminId } = useUser();
  const { collegeEducationType } = useAdmin();
  const isSchool = isSchoolEducation(collegeEducationType);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: "logo", label: "Logo" },
    { id: "banner", label: "Banner" },
  ];

  useEffect(() => {
    fetchMediaData();
  }, [userId]);

  const fetchMediaData = async () => {
    if (!userId) return;
    try {
      setIsFetching(true);
      const { collegeId } = await fetchAdminContext(userId);
      const res = await getCollegeMedia(collegeId);

      if (res.success && res.data) {
        setMediaId(res.data.collegeMediaId);
        setLogoUrl(res.data.logoUrl || null);
        setBannerUrl(res.data.bannerUrl || null);
        setOriginalLogo(res.data.logoUrl || null);
        setOriginalBanner(res.data.bannerUrl || null);
      }
    } catch (error) {
      toast.error(`Failed to load ${isSchool ? "school" : "college"} media`, { id: "media-load-err" });
    } finally {
      setIsFetching(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateMediaFile(file);

      let fileToUpload = file;
      try {
        const options = {
          maxSizeMB: activeTab === "banner" ? 1 : 0.3,
          maxWidthOrHeight: activeTab === "banner" ? 1920 : 1080,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.85
        };
        // @ts-ignore
        const compressedBlob = await imageCompression(file, options);
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
        fileToUpload = new File([compressedBlob], newFileName, {
          type: "image/webp",
          lastModified: Date.now(),
        });
      } catch (error) {
        console.error("Compression failed, using original.", error);
      }

      if (fileToUpload.size > 5 * 1024 * 1024) {
        toast.error("Image is still too large after compression (Max 5MB).", { id: "media-size-err" });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const previewUrl = URL.createObjectURL(fileToUpload);

      if (activeTab === "logo") {
        setLogoFile(fileToUpload);
        setLogoUrl(previewUrl);
      } else {
        setBannerFile(fileToUpload);
        setBannerUrl(previewUrl);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process image.", { id: "media-process-err" });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveMediaClick = () => {
    setMediaToDelete(activeTab);
    setIsDeleteModalOpen(true);
  };

  const confirmRemoveMedia = async () => {
    if (!userId || !collegeId) return;

    if (mediaToDelete === "logo" && logoFile) {
      setLogoFile(null);
      setLogoUrl(originalLogo);
      toast.success("Logo removed successfully", { id: `logo-rm-success-${Date.now()}` });
      setIsDeleteModalOpen(false);
      setMediaToDelete(null);
      return;
    } else if (mediaToDelete === "banner" && bannerFile) {
      setBannerFile(null);
      setBannerUrl(originalBanner);
      toast.success("Banner removed successfully", { id: `banner-rm-success-${Date.now()}` });
      setIsDeleteModalOpen(false);
      setMediaToDelete(null);
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(`Removing ${mediaToDelete === "logo" ? "logo" : "banner"}...`);
    try {
      if (mediaToDelete === "logo") {
        if (originalLogo) {
          await deleteCollegeMediaByUrl(originalLogo);
        }

        const payload = {
          ...(mediaId && { collegeMediaId: mediaId }),
          collegeId,
          createdBy: userId,
          logoUrl: null,
          bannerUrl: originalBanner
        };
        const res = await upsertCollegeMedia(payload);
        if (res.success) {
          setLogoFile(null);
          setLogoUrl(null);
          setOriginalLogo(null);
          if (res.data?.collegeMediaId) setMediaId(res.data.collegeMediaId);
          toast.dismiss(toastId);
          toast.success("Logo removed successfully", { id: `logo-rm-db-success-${Date.now()}` });
        } else {
          throw new Error(res.error);
        }
      } else if (mediaToDelete === "banner") {
        if (originalBanner) {
          await deleteCollegeMediaByUrl(originalBanner);
        }

        const payload = {
          ...(mediaId && { collegeMediaId: mediaId }),
          collegeId,
          createdBy: userId,
          logoUrl: originalLogo,
          bannerUrl: null
        };
        const res = await upsertCollegeMedia(payload);
        if (res.success) {
          setBannerFile(null);
          setBannerUrl(null);
          setOriginalBanner(null);
          if (res.data?.collegeMediaId) setMediaId(res.data.collegeMediaId);
          toast.dismiss(toastId);
          toast.success("Banner removed successfully", { id: `banner-rm-db-success-${Date.now()}` });
        } else {
          throw new Error(res.error);
        }
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to remove media", { id: `media-rm-err-${Date.now()}` });
    } finally {
      setIsDeleteModalOpen(false);
      setMediaToDelete(null);
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!userId || !collegeId) return;

    let toastId = "";
    try {
      setIsSaving(true);
      toastId = toast.loading(`Saving ${isSchool ? "school" : "college"} media...`);

      let finalLogoUrl = logoUrl;
      let finalBannerUrl = bannerUrl;

      if (logoFile) {
        if (originalLogo) {
          await deleteCollegeMediaByUrl(originalLogo);
        }
        finalLogoUrl = await uploadCollegeMediaFile(logoFile, "logo", collegeId, adminId!);
      } else if (!logoUrl && originalLogo) {
        await deleteCollegeMediaByUrl(originalLogo);
        finalLogoUrl = null;
      }

      if (bannerFile) {
        if (originalBanner) {
          await deleteCollegeMediaByUrl(originalBanner);
        }
        finalBannerUrl = await uploadCollegeMediaFile(bannerFile, "banner", collegeId, adminId!);
      } else if (!bannerUrl && originalBanner) {
        await deleteCollegeMediaByUrl(originalBanner);
        finalBannerUrl = null;
      }

      const payload = {
        ...(mediaId && { collegeMediaId: mediaId }),
        collegeId,
        createdBy: userId,
        logoUrl: finalLogoUrl,
        bannerUrl: finalBannerUrl
      };

      const res = await upsertCollegeMedia(payload);

      if (!res.success) {
        throw new Error(res.error);
      }

      toast.dismiss(toastId);
      toast.success(`${isSchool ? "School" : "College"} media saved successfully`, { id: `media-save-success-${Date.now()}` });

      if (res.data) {
        setMediaId(res.data.collegeMediaId);
        setOriginalLogo(res.data.logoUrl || null);
        setOriginalBanner(res.data.bannerUrl || null);
        setLogoUrl(res.data.logoUrl || null);
        setBannerUrl(res.data.bannerUrl || null);
        setLogoFile(null);
        setBannerFile(null);
      }

    } catch (error: any) {
      toast.dismiss(toastId);
      const isKnownError = error.message && (error.message.includes("network") || error.message.includes("timeout") || error.message.includes("reference"));
      const errorMsg = isKnownError ? error.message : `Failed to save ${isSchool ? "school" : "college"} media. Please try again.`;
      toast.error(errorMsg, { id: `media-save-err-${Date.now()}` });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = logoFile !== null || bannerFile !== null;

  const currentUrl = activeTab === "logo" ? logoUrl : bannerUrl;

  return (
    <div className="relative min-h-[500px]">
      <Toaster position="top-right" />
      {isFetching && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#43C17A] animate-spin" />
            <span className="text-[#16284F] font-medium text-sm">Loading media details...</span>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <div className="relative flex items-center bg-gray-100 p-1.5 rounded-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative cursor-pointer px-8 py-2 text-sm font-semibold z-10 transition-colors ${activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="college-media-pill"
                  className="absolute shadow-[0_2px_8px_rgba(16,185,129,0.4)] inset-0 rounded-full -z-10"
                  style={{ background: "linear-gradient(180deg, #34D399 0%, #10B981 100%)" }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col items-center gap-8">
        {!currentUrl && (
          <div className="w-full max-w-md">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full group relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100/50 hover:border-[#43C17A] transition-all duration-300 flex flex-col items-center justify-center py-12 px-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="bg-white p-4 rounded-full cursor-pointer shadow-sm mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <Upload className="w-6 h-6 text-[#43C17A]" />
              </div>
              <p className="text-[#16284F] font-semibold mb-1">
                Click to upload {activeTab === "logo" ? "Logo" : "Banner"}
              </p>
              <p className="text-gray-500 text-xs">
                Supports JPG, PNG, WEBP (Max 5MB)
              </p>
            </button>
          </div>
        )}

        {currentUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group"
          >
            <button
              onClick={handleRemoveMediaClick}
              className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 hover:scale-110 transition-all z-10 cursor-pointer"
              title="Remove media"
            >
              <X className="w-4 h-4" />
            </button>
            <div className={`relative w-full overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center ${activeTab === "logo" ? "aspect-square max-w-[200px] mx-auto" : "aspect-video"}`}>
              <Image
                src={currentUrl}
                alt={`${activeTab} preview`}
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
              <ImageIcon className="w-4 h-4" />
              <span>Current {activeTab === "logo" ? "Logo" : "Banner"} Preview</span>
            </div>
          </motion.div>
        )}

        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-2.5 cursor-pointer bg-[#43C17A] text-white rounded-md text-sm font-medium shadow-lg hover:bg-[#34A362] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </motion.div>
        )}
      </div>

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmRemoveMedia}
        isDeleting={isSaving}
        loadingText="Removing..."
        title="Remove"
        name={mediaToDelete === "logo" ? `${isSchool ? "school" : "college"} logo` : `${isSchool ? "school" : "college"} banner`}
        confirmText="Remove"
        actionType="remove"
      />
    </div>
  );
}
