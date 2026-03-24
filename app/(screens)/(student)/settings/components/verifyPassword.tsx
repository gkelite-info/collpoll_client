"use client";

import { useState } from "react";
import { Eye, EyeSlash, CaretLeft, CircleNotch } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useUser } from "@/app/utils/context/UserContext";
import toast from "react-hot-toast";
import {
  verifyCurrentPassword,
  sendPasswordResetEmail,
} from "@/lib/helpers/settings/passwordAPI";

export default function CurrentPassword() {
  const router = useRouter();
  const { email } = useUser();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    if (!password) {
      toast.error("Please enter your current password.");
      return;
    }
    if (!email) {
      toast.error("User email not found.");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Verifying password...");

    try {
      await verifyCurrentPassword(email, password);
      toast.success("Password verified!", { id: toastId });
      router.push("/settings?reset");
    } catch (error: any) {
      toast.error("Incorrect password. Please try again.", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return;
    const toastId = toast.loading("Sending reset link...");

    try {
      await sendPasswordResetEmail(email);
      toast.success("Password reset link sent to your email!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link.", {
        id: toastId,
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="flex justify-between mb-6">
        <div className="text-xl font-semibold flex flex-col">
          <div className="flex justify-start items-center gap-2 text-[#282828]">
            <Link
              href="/settings"
              className="hover:bg-gray-200 p-1 rounded-full transition-colors"
            >
              <CaretLeft size={24} className="text-[#282828]" weight="bold" />
            </Link>
            Current Password
          </div>
          <p className="text-gray-500 text-sm ml-9">
            Verify Your Current Account Password
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
              <span className="text-sm font-medium text-[#111827]">
                Current Password
              </span>
            </div>

            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isProcessing}
                className="w-full rounded border text-[#616161] border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#43C17A] disabled:opacity-60"
                placeholder="*******"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50"
                disabled={isProcessing}
                onClick={() => setShow((s) => !s)}
              >
                {show ? <Eye size={18} /> : <EyeSlash size={18} />}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Enter your existing password
            </p>
          </label>

          <div className="text-center mb-4">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-[#10B981] hover:underline"
            >
              Forgot your password?
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={isProcessing}
              className="bg-[#43C17A] hover:bg-[#3ba869] disabled:bg-[#a1e0bd] text-white px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition-colors"
            >
              {isProcessing && (
                <CircleNotch size={18} className="animate-spin" />
              )}
              Continue
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
