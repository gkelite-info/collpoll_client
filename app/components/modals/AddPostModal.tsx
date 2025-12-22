"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";

function Portal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return createPortal(children, document.body);
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

/* -------------------------------------------
      TAGS INPUT — CHIP STYLE LIKE FIGMA
----------------------------------------------*/
function TagsInputBox() {
    const [tags, setTags] = useState(["#AI", "#Workshop", "#Faculty"]);
    const [inputValue, setInputValue] = useState("");

    const addTag = (e: any) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            let val = inputValue.trim();
            if (!val.startsWith("#")) val = "#" + val;

            setTags([...tags, val]);
            setInputValue("");
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    return (
        <div
            className="
        w-full min-h-[50px] mt-2
        border border-[#C4C4C4] rounded-md
        flex items-center flex-wrap gap-2
        px-4 py-2
      "
        >
            {tags.map((tag) => (
                <div
                    key={tag}
                    className="
            bg-[#E7F6ED]
            text-[#2FAD63]
            rounded-full px-4 py-1
            flex items-center gap-2
            text-[16px] font-medium
          "
                >
                    {tag}
                    <X
                        size={15}
                        onClick={() => removeTag(tag)}
                        className="cursor-pointer text-[#2FAD63]"
                    />
                </div>
            ))}

            <input
                type="text"
                placeholder="add tag..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={addTag}
                className="
        outline-none flex-1 font-medium rounded-full
        text-[#2FAD63] text-[16px]
        placeholder:text-[#2FAD63]      /* <-- ADD THIS */
    "
            />

        </div>
    );
}



export default function AddPostModal({ isOpen, onClose }: Props) {
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    return (
        <AnimatePresence>
            {isOpen && (
                <Portal>
                    {/* BACKDROP */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[4000]"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* MODAL */}
                    <motion.div
                        className="
    fixed top-[70px] left-1/2 -translate-x-1/2
    bg-white w-[700px] max-h-[84vh]
    rounded-[20px] shadow-xl z-[5000]
    overflow-hidden   /* <<< SUPER IMPORTANT */
    flex flex-col
  "
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >

                        {/* HEADER */}
                        <div className="px-[40px] pt-[30px] pb-[20px] bg-white">
                            <div className="flex justify-between items-center">
                                <h2 className="text-[24px] font-roboto font-semibold text-[#282828]">
                                    Create a New Post
                                </h2>

                                <button onClick={onClose}>
                                    <X size={28} className="text-[#282828]" />
                                </button>
                            </div>

                            <p className="text-[18px] font-roboto font-normal text-[#282828] mt-[6px]">
                                Share announcements, achievements, or updates with studenetsand faculty.
                            </p>
                        </div>

                        {/* SCROLLABLE BODY */}
                        <div className="px-[40px] pt-[10px] pb-[20px] overflow-y-auto flex-1 pb-[20px]">

                            {/* Post Title */}
                            <div className="mb-6">
                                <label className="text-[20px] font-roboto font-medium text-[#282828]">
                                    Post Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="Faculty Development  Workshop on Generative AI"
                                    className="
                    w-full h-[50px] mt-2 px-4
                    border border-[#C4C4C4] rounded-md
                    text-[18px] font-roboto text-[#282828]
                    placeholder:text-[#898989]
                    outline-none
                  "
                                />
                            </div>

                            {/* Category */}
                            <div className="mb-6">
                                <label className="text-[20px] font-roboto font-medium text-[#282828]">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    placeholder="Announcements"
                                    className="
                    w-full h-[50px] mt-2 px-4
                    border border-[#C4C4C4] rounded-md
                    text-[18px] font-roboto text-[#282828]
                    placeholder:text-[#898989]
                    outline-none
                  "
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <label className="text-[20px] font-roboto font-medium text-[#282828]">
                                    Description
                                </label>

                                <textarea
                                    rows={4}
                                    defaultValue={`The Department of computer Science is Organizing a 2 - day workshop on generative AI for all faculty members. Experts from Google and IIIT-H will be joining us. Register before 20th Nov.`}
                                    className="
    w-full mt-2
    border border-[#C4C4C4] rounded-md
    text-[18px] font-roboto
    text-[#898989]
    leading-[100%]
    outline-none
    whitespace-normal break-words
    px-4 py-3   
  " style={{
                                        resize: "vertical",
                                    }}
                                ></textarea>




                            </div>

                            {/* TAGS (NEW CHIP UI) */}
                            <div className="mb-6">
                                <label className="text-[20px] font-roboto font-medium text-[#282828]">
                                    Tags
                                </label>

                                <TagsInputBox />
                            </div>
                            {/* Image Upload */}
                            <div className="mb-6">
                                <label className="text-[20px] font-roboto font-medium text-[#282828]">
                                    Image
                                </label>

                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    id="imageUploadInput"
                                    accept="image/png, image/jpeg"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        // Validate file type
                                        if (!["image/png", "image/jpeg"].includes(file.type)) {
                                            alert("Only JPG and PNG allowed!");
                                            return;
                                        }

                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            setUploadedImages((prev) => [...prev, reader.result as string]);
                                        };
                                        reader.readAsDataURL(file);
                                    }}
                                />

                                {/* Upload Box */}
                                <div
                                    onClick={() => document.getElementById("imageUploadInput")?.click()}
                                    className="
      mt-3 w-full h-[220px] border-2 border-dashed border-[#C4C4C4]
      rounded-xl flex flex-col items-center justify-center
      text-gray-500 gap-3 cursor-pointer
    "
                                >
                                    <Upload size={40} className="opacity-70 text-[#282828]" />
                                    <p className="text-[18px] text-[#282828]">Drag & Drop Images</p>

                                    <button
                                        className="
        px-6 py-2 bg-[#43C17A] text-white text-[18px]
        rounded-lg font-medium cursor-pointer
      "
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            document.getElementById("imageUploadInput")?.click();
                                        }}
                                    >
                                        Upload
                                    </button>
                                </div>

                                {/* Image Preview Outside Box */}
                                {uploadedImages.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-4">
                                        {uploadedImages.map((img, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={img}
                                                    alt="preview"
                                                    className="w-[140px] h-[140px] object-cover rounded-lg border"
                                                />

                                                {/* Remove button */}
                                                <button
                                                    onClick={() =>
                                                        setUploadedImages(uploadedImages.filter((_, i) => i !== index))
                                                    }
                                                    className="
              absolute -top-2 -right-2 bg-red-500 text-white
              w-6 h-6 rounded-full flex items-center justify-center text-sm
            "
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* FOOTER BUTTONS */}
                        <div className="px-[40px] py-[20px] border-t bg-white flex justify-between gap-3">

                            {/* SHARE POST */}
                            <button
                                className="
      flex-1 h-[50px] rounded-lg bg-[#43C17A]
      text-[18px] text-white font-medium
      cursor-pointer
    "
                                onClick={() => console.log("Share post clicked")}
                            >
                                Share Post
                            </button>

                            {/* CANCEL BUTTON */}
                            <button
                                className="
      flex-1 h-[50px] rounded-lg border border-[#C4C4C4]
      text-[18px] text-[#282828] font-medium
      cursor-pointer
    "
                                onClick={onClose}   // <-- WORKING CANCEL NOW
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
