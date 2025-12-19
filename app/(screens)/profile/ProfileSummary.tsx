"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProfileSummary() {
    const [description, setDescription] = useState<string>("");
    const router = useRouter();
    const handleSubmit = () => {
        // Handle the submission logic here
        toast.success("Profile Summary Submitted Successfully");
        console.log("Profile Summary Submitted:", description);
    }
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center rounded-xl mt-2 mb-5">
            <div className="w-full max-w-5xl bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-[#282828]">
                        Profile Summary
                    </h2>
                    <button
                        onClick={() => router.push('/profile?accomplishments')}
                        className="bg-[#43C17A] cursor-pointer text-white px-6 py-2 rounded-md text-sm font-medium">
                        Next
                    </button>
                </div>

                <div>
                    <h3 className="text-base font-medium text-[#282828] mb-1">
                        Write Your Professional Summary
                    </h3>
                    <p className="text-sm text-[#525252] mb-4 max-w-3xl">
                        Share a short overview of your education, skills, and career goals
                        what drives you and where you see your future.
                    </p>

                    <div className="relative">
                        <textarea
                            rows={4}
                            maxLength={500}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A passionate Computer Science student with a strong interest in software development and problem-solving. Eager to apply technical skills to real-world projects and grow as a developer."
                            className="w-full border border-[#CCCCCC] rounded-lg p-4 text-sm text-[#525252] focus:outline-none resize-none"
                        />

                        <span className="absolute bottom-3 right-4 text-xs text-gray-400">
                            {description.length}/500
                        </span>
                    </div>
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={handleSubmit}
                            className="bg-[#43C17A] cursor-pointer text-white px-5 py-1.5 rounded-md text-sm">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
