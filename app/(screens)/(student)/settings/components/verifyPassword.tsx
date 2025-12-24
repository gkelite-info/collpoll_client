"use client";

import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

export default function CurrentPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const handleContinue = () => {
    router.push("/settings?reset");
  };

  return (
    <main className="min-h-screen bg-[#FAFBFC] p-8">
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
                className="w-full rounded border text-[#616161] border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#43C17A]"
                placeholder="*******"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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
            <Link href="#" className="text-sm text-[#10B981]">
              Forgot your password?
            </Link>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              className="bg-[#43C17A] text-white px-6 py-2 rounded shadow font-semibold"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
