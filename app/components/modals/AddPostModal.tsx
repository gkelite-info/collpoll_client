"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2 } from "lucide-react";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { saveCampusBuzzPost } from "@/lib/helpers/campusBuzz/campusBuzzAPI";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
};

function TagsInputBox({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: (tags: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      let val = inputValue.trim().replace(/,/g, "");

      if (val === "") return;

      if (!val.startsWith("#")) val = "#" + val;

      const prospectiveString = [...tags, val].join(", ");
      if (!tags.includes(val) && prospectiveString.length < 240) {
        setTags([...tags, val]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div
      className="w-full min-h-[50px] mt-2 border border-[#C4C4C4] focus-within:border-[#43C17A] transition-colors rounded-md flex items-center flex-wrap gap-2 px-4 py-2 cursor-text"
      onClick={() => document.getElementById("tag-input")?.focus()}
    >
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, width: 0, margin: 0, padding: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#EAF7F1] text-[#43C17A] rounded-full px-3 py-[4px] flex items-center gap-1.5 text-[15px] font-medium whitespace-nowrap overflow-hidden origin-left"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="hover:bg-[#43C17A] hover:text-white rounded-full p-[2px] transition-colors flex items-center justify-center"
            >
              <X size={14} strokeWidth={3} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <input
        id="tag-input"
        type="text"
        placeholder={
          tags.length === 0 ? "Add tags (press Enter or comma)..." : ""
        }
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="outline-none flex-1 min-w-[140px] font-medium text-[#282828] text-[16px] placeholder:text-[#898989] bg-transparent"
      />
    </div>
  );
}

export default function AddPostModal({ isOpen, onClose, onSuccess }: Props) {
  const { collegeId, userId } = useUser();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<
    "achievements" | "announcements" | "clubactivities"
  >("announcements");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setCategory("announcements");
      setDescription("");
      setTags([]);
      setImageFile(null);
      setImagePreview(null);
      setErrorMsg("");
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setErrorMsg("Only JPG and PNG allowed!");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImageToSupabase = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${collegeId}/campus-buzz/${fileName}`;

    const { data, error } = await supabase.storage
      .from("buzz_images")
      .upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("buzz_images").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!title.trim() || !description.trim()) {
      setErrorMsg("Title and Description are required.");
      return;
    }

    if (!collegeId || !userId) {
      setErrorMsg("User session missing. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = undefined;

      if (imageFile) {
        finalImageUrl = await uploadImageToSupabase(imageFile);
      }

      const payload = {
        collegeId: collegeId,
        title,
        category,
        description,
        tags: tags.length > 0 ? tags : undefined,
        imageUrl: finalImageUrl,
      };

      const result = await saveCampusBuzzPost(payload, userId);

      if (!result.success) throw result.error;

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to post:", error);
      setErrorMsg(error.message || "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[4000]"
            onClick={!isSubmitting ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed top-[70px] left-1/2 -translate-x-1/2 bg-white w-[700px] max-h-[84vh] rounded-[20px] shadow-xl z-[5000] overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="px-[40px] pt-[30px] pb-[20px] bg-white shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-roboto font-semibold text-[#282828]">
                  Create a New Post
                </h2>
                <button
                  onClick={!isSubmitting ? onClose : undefined}
                  disabled={isSubmitting}
                >
                  <X
                    size={28}
                    className="text-[#282828] hover:text-red-500 transition-colors cursor-pointer"
                  />
                </button>
              </div>
              <p className="text-base font-roboto font-normal text-[#282828] mt-[6px]">
                Share announcements, achievements, or updates with students and
                faculty.
              </p>
              {errorMsg && (
                <p className="text-red-500 font-medium mt-2">{errorMsg}</p>
              )}
            </div>

            <div className="px-[40px] pt-[10px] pb-[20px] overflow-y-auto flex-1 custom-scrollbar">
              <div className="mb-6">
                <label className="text-lg font-roboto font-medium text-[#282828]">
                  Post Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Faculty Development Workshop on Generative AI"
                  className="w-full h-[50px] mt-2 px-3 border border-[#C4C4C4] rounded-md text-base font-roboto text-[#282828] placeholder:text-[#898989] outline-none focus:border-[#43C17A]"
                />
              </div>

              <div className="mb-6">
                <label className="text-lg font-roboto font-medium text-[#282828]">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-[50px] mt-2 px-4 border border-[#C4C4C4] rounded-md text-base font-roboto text-[#282828] outline-none focus:border-[#43C17A] bg-white cursor-pointer"
                >
                  <option value="announcements">Announcements</option>
                  <option value="achievements">Achievements</option>
                  <option value="clubactivities">Clubs & Activities</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="text-lg font-roboto font-medium text-[#282828]">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about the event..."
                  className="w-full mt-2 border border-[#C4C4C4] rounded-md text-base font-roboto text-[#282828] outline-none px-3 py-3 focus:border-[#43C17A]"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="mb-6">
                <label className="text-lg font-roboto font-medium text-[#282828]">
                  Tags
                </label>
                <TagsInputBox tags={tags} setTags={setTags} />
              </div>

              <div className="mb-6">
                <label className="text-lg font-roboto font-medium text-[#282828]">
                  Image Feature (Optional)
                </label>
                <input
                  type="file"
                  id="imageUploadInput"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={handleImageChange}
                />

                {!imagePreview ? (
                  <div
                    onClick={() =>
                      document.getElementById("imageUploadInput")?.click()
                    }
                    className="mt-3 w-full h-[220px] border-2 border-dashed border-[#C4C4C4] rounded-xl flex flex-col items-center justify-center text-gray-500 gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload size={40} className="opacity-70 text-[#282828]" />
                    <p className="text-base text-[#282828]">
                      Click to Upload Image
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full max-h-[300px] object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        (
                          document.getElementById(
                            "imageUploadInput",
                          ) as HTMLInputElement
                        ).value = "";
                      }}
                      className="absolute -top-3 -right-3 cursor-pointer bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-md hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="px-[40px] py-[20px] border-t bg-white flex justify-between gap-4 shrink-0">
              <button
                className="flex-1 h-[50px] rounded-lg bg-[#43C17A] text-base text-white font-medium cursor-pointer hover:bg-[#3ba869] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />{" "}
                    Posting...
                  </>
                ) : (
                  "Share Post"
                )}
              </button>
              <button
                className="flex-1 h-[50px] rounded-lg border border-[#C4C4C4] text-base text-[#282828] font-medium cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
