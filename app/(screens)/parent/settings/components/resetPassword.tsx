"use client";

import { useState } from "react";
import { Eye, EyeSlash, CaretLeft, CircleNotch } from "@phosphor-icons/react";
import PasswordChecklist from "./passwordChecklist";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import toast from "react-hot-toast";
import { updateUserPassword } from "@/lib/helpers/settings/passwordAPI";

export default function ResetPassword() {
  const router = useRouter();

  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdate = async () => {
    if (!newPwd || !confirmPwd) {
      toast.error("Please fill out both password fields.");
      return;
    }

    if (newPwd !== confirmPwd) {
      toast.error("Passwords do not match.");
      return;
    }

    const isValidLength = newPwd.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPwd);
    const hasNumber = /[0-9]/.test(newPwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPwd);

    if (!isValidLength || !hasUppercase || !hasNumber || !hasSpecial) {
      toast.error("Please ensure the password meets all requirements.");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Updating password...");

    try {
      await updateUserPassword(newPwd);
      toast.success("Password updated successfully!", { id: toastId });
      router.push("/settings?done");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password.", {
        id: toastId,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFBFC] p-6">
      <div className="flex justify-between mb-6">
        <div className="text-xl font-semibold flex flex-col">
          <div className="flex justify-start items-center gap-2 text-[#282828]">
            <Link
              href="/settings"
              className="hover:bg-gray-200 p-1 rounded-full transition-colors"
            >
              <CaretLeft size={24} className="text-[#282828]" weight="bold" />
            </Link>
            Create New Password
          </div>
          <p className="text-gray-500 text-sm ml-9">
            Secure your account with a new password
          </p>
        </div>
        <div className="w-[32%]">
          <CourseScheduleCard />
        </div>
      </div>
      <div className="mx-auto max-w-3xl">
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
                className="w-full rounded border text-[#282828] border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#43C17A] disabled:opacity-60"
                placeholder="New password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                disabled={isProcessing}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50"
                onClick={() => setShowNew((v) => !v)}
                disabled={isProcessing}
              >
                {showNew ? <Eye size={18} /> : <EyeSlash size={18} />}
              </button>
            </div>
          </label>

          <PasswordChecklist password={newPwd} />

          <label className="block mb-4 mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-[#282828]">
                Confirm New Password
              </span>
            </div>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full rounded border text-[#282828] border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#43C17A] disabled:opacity-60"
                placeholder="Confirm new password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                disabled={isProcessing}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50"
                onClick={() => setShowConfirm((v) => !v)}
                disabled={isProcessing}
              >
                {showConfirm ? <Eye size={18} /> : <EyeSlash size={18} />}
              </button>
            </div>
          </label>

          <div className="flex justify-center pt-4">
            <button
              onClick={handleUpdate}
              disabled={isProcessing}
              className="bg-[#43C17A] hover:bg-[#3ba869] disabled:bg-[#a1e0bd] text-white px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition-colors"
            >
              {isProcessing && (
                <CircleNotch size={18} className="animate-spin" />
              )}
              Update Password
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
