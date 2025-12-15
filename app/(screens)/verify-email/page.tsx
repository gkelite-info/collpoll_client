"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    toast.success("Email verified successfully!");
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-green-600">
        Email verified! Redirecting to login...
      </p>
    </div>
  );
}
