"use client";

import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import PasswordChecklist from "./passwordChecklist";
import { useRouter } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

export default function ResetPassword() {
  const router = useRouter();

  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdate = () => {
    router.push("/settings?done");
  };

  return (
    <main className="min-h-screen bg-[#FAFBFC] p-6">
      <div className="flex justify-between mb-6">
        <div className="text-xl font-semibold flex flex-col">
          <div className="flex justify-start items-center gap-2 text-[#282828]">
            Current Password
          </div>
          <p className="text-gray-500 text-sm">
            Update Your Current Account Password
          </p>
        </div>
        <div className="w-[32%]">
          <CourseScheduleCard />
        </div>
      </div>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold mb-2 text-[#282828]">
          New Password
        </h1>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <label className="block mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-[#282828]">
                New Password
              </span>
            </div>

            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                className="w-full rounded border text-[#282828] border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#43C17A]"
                placeholder="New password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowNew((v) => !v)}
              >
                {showNew ? <Eye size={18} /> : <EyeSlash size={18} />}
              </button>
            </div>
          </label>

          <PasswordChecklist password={newPwd} />

          <label className="block mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-[#282828]">
                Confirm New Password
              </span>
            </div>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full rounded border text-[#282828] border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#43C17A]"
                placeholder="Confirm new password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <Eye size={18} /> : <EyeSlash size={18} />}
              </button>
            </div>
          </label>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleUpdate}
              className="bg-[#43C17A] text-white px-6 py-2 rounded shadow font-semibold"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
