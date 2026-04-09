"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { Lock } from "@phosphor-icons/react";
import { fetchResumePersonalDetails, saveResumePersonalDetails } from "@/lib/helpers/student/Resume/Resumepersonaldetailsapi";
import { useUser } from "@/app/utils/context/UserContext";



// ─── Shimmer skeleton (same style as ProfilePersonalDetailsSkeleton) ──────────
function ResumePersonalDetailsSkeleton() {
  return (
    <div className="w-full bg-[#f6f7f9] mt-2 mb-4 animate-pulse">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        {/* header */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-8 w-16 bg-gray-200 rounded-md" />
        </div>

        {/* grid fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
              <div className="h-10 w-full bg-gray-100 rounded-md" />
            </div>
          ))}
        </div>

        {/* work status */}
        <div className="mt-6">
          <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-gray-100 rounded-md" />
            <div className="h-20 bg-gray-100 rounded-md" />
          </div>
        </div>

        {/* submit button */}
        <div className="mt-6 flex justify-end">
          <div className="h-8 w-20 bg-gray-200 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ResumePersonalDetails() {
  const router = useRouter();

  // ── context ─────────────────────────────────────────────────────────────────
  const {
    userId,
    studentId: ctxStudentId,
    collegeId: ctxCollegeId,
    fullName: ctxFullName,
    mobile: ctxMobile,
    email: ctxEmail,
  } = useUser();

  // ── auth / ids ──────────────────────────────────────────────────────────────
  const [studentId, setStudentId] = useState<number | null>(null);
  const [collegeId, setCollegeId] = useState<number | null>(null);
  const [collegeCode, setCollegeCode] = useState("");
  const [resumePersonalDetailsId, setResumePersonalDetailsId] = useState<
    number | null
  >(null);

  // ── form fields ─────────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [workStatus, setWorkStatus] = useState<"experienced" | "fresher">("fresher");
  // ── ui state ────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // ── shared styles ───────────────────────────────────────────────────────────
  const inputBase =
    "w-full border rounded-md px-3 py-2 outline-none transition-all";
  const disabled =
    "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed pr-10";
  const enabled =
    "border-[#CCCCCC] text-[#282828] focus:border-[#43C17A]";

  // ── load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (ctxStudentId && ctxCollegeId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxStudentId, ctxCollegeId]);

  async function loadData() {
    if (!ctxStudentId || !ctxCollegeId) return;
    setIsPageLoading(true);
    try {
      // 1. set ids and locked fields from context
      setStudentId(ctxStudentId);
      setCollegeId(ctxCollegeId);
      setFullName(ctxFullName || "");
      setMobile(ctxMobile || "");
      setEmail(ctxEmail || "");

      // 2. fetch college code (read-only display)
      const { data: college } = await supabase
        .from("colleges")
        .select("collegeCode")
        .eq("collegeId", ctxCollegeId)
        .is("deletedAt", null)
        .single();

      if (college) setCollegeCode(college.collegeCode || "");

      // 3. fetch existing resume personal details row
      const pdRes = await fetchResumePersonalDetails(ctxStudentId);
      if (pdRes?.data) {
        setResumePersonalDetailsId(pdRes.data.resumePersonalDetailsId);
        setLinkedIn(pdRes.data.linkedInId || "");
        setCurrentCity(pdRes.data.currentCity || "");
        setWorkStatus(pdRes.data.workStatus ?? "fresher");
        // override locked fields with latest saved values if present
        setFullName(pdRes.data.fullName || ctxFullName || "");
        setMobile(pdRes.data.mobile || ctxMobile || "");
        setEmail(pdRes.data.email || ctxEmail || "");
      }
    } catch (err) {
      toast.error("Failed to load resume personal details");
    } finally {
      setIsPageLoading(false);
    }
  }

  // ── sanitizers ──────────────────────────────────────────────────────────────
  const sanitizeCity = (value: string) => {
    let clean = value.replace(/[^A-Za-z ]/g, "");
    clean = clean.replace(/\s+/g, " ");
    return clean.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const sanitizeLinkedIn = (value: string) =>
    value.replace(/[^a-zA-Z0-9:/._-]/g, "");

  // ── validators ──────────────────────────────────────────────────────────────
  const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+){0,3}$/;
  const linkedInRegex = /^https:\/\/(www\.)?linkedin\.com\/.+$/;

  // ── submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!studentId || !collegeId) return;

    const trimmedName = fullName.trim();
    if (!trimmedName) return toast.error("Full Name is required!");
    if (!nameRegex.test(trimmedName))
      return toast.error("Name should contain only letters and spaces");

    if (!mobile) return toast.error("Mobile number is required!");
    if (!email) return toast.error("Email is required!");

    if (linkedIn && !linkedInRegex.test(linkedIn))
      return toast.error("Enter a valid LinkedIn URL (must start with https://linkedin.com/)");

    setIsLoading(true);

    const res = await saveResumePersonalDetails({
      resumePersonalDetailsId: resumePersonalDetailsId || undefined,
      studentId,
      collegeId,
      fullName: trimmedName,
      mobile,
      email,
      linkedInId: linkedIn || null,
      currentCity,
      workStatus,
    });

    setIsLoading(false);

    if (!res.success) {
      return toast.error(
        typeof res.error === "string"
          ? res.error
          : "Failed to save resume personal details"
      );
    }

    if (res.resumePersonalDetailsId) {
      setResumePersonalDetailsId(res.resumePersonalDetailsId);
    }

    toast.success("Personal details saved successfully");
  };

  // ── render ───────────────────────────────────────────────────────────────────
  if (isPageLoading) return <ResumePersonalDetailsSkeleton />;

  return (
    <div className="w-full bg-[#f6f7f9] mt-2 mb-4">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        {/* header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-[#000000]">
            Personal Details
          </h2>
          <button
            onClick={() => router.push("/profile?resume=education&Step=2")}
            className="bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium"
          >
            Next
          </button>
        </div>

        {/* fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

          {/* Full Name — editable */}
          <div>
            <label className="block text-sm font-medium text-[#282828] mb-1">
              Full Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`${inputBase} ${enabled}`}
            />
          </div>

          {/* Mobile — locked */}
          <div>
            <label className="block text-sm font-medium text-[#282828] mb-1">
              Mobile Number<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={mobile}
                disabled
                className={`${inputBase} ${disabled}`}
              />
              <Lock
                className="absolute cursor-not-allowed right-2 top-3 text-gray-400"
                size={16}
              />
            </div>
          </div>

          {/* Email — locked */}
          <div>
            <label className="block text-sm font-medium text-[#282828] mb-1">
              Email ID<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                disabled
                className={`${inputBase} ${disabled}`}
              />
              <Lock
                className="absolute cursor-not-allowed right-2 top-3 text-gray-400"
                size={16}
              />
            </div>
          </div>

          {/* College Code — locked */}
          {/* <div>
            <label className="block text-sm font-medium text-[#282828] mb-1">
              College Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={collegeCode}
                readOnly
                disabled
                className={`${inputBase} ${disabled}`}
              />
              <Lock
                className="absolute cursor-not-allowed right-2 top-3 text-gray-400"
                size={16}
              />
            </div>
          </div> */}

          {/* LinkedIn — editable */}
          <div>
            <label className="block text-sm font-medium text-[#282828] mb-1">
              LinkedIn ID
            </label>
            <input
              type="text"
              placeholder="Enter LinkedIn ID"
              value={linkedIn}
              onChange={(e) => setLinkedIn(sanitizeLinkedIn(e.target.value))}
              className={`${inputBase} ${enabled}`}
            />
          </div>

          {/* Current City — editable */}
          <div>
            <label className="block text-sm font-medium text-[#282828] mb-1">
              Current City
            </label>
            <input
              type="text"
              placeholder="Enter Current City"
              value={currentCity}
              onChange={(e) => setCurrentCity(sanitizeCity(e.target.value))}
              className={`${inputBase} ${enabled}`}
            />
          </div>

          {/* College ID — locked */}
          {/* <div>
            <label className="block text-sm font-medium text-[#282828] mb-1">
              College ID<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={collegeId !== null ? collegeId : ""}
                disabled
                className={`${inputBase} ${disabled}`}
              />
              <Lock
                className="absolute cursor-not-allowed right-2 top-3 text-gray-400"
                size={16}
              />
            </div>
          </div> */}
        </div>

        {/* Work Status */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-[#282828] mb-2">
            Work Status
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setWorkStatus("experienced")}
              className={`border rounded-md p-4 cursor-pointer transition-all ${
                workStatus === "experienced"
                  ? "border-[#43C17A] bg-green-50"
                  : "hover:border-[#43C17A] border-[#CCCCCC]"
              }`}
            >
              <p
                className={`font-medium ${
                  workStatus === "experienced"
                    ? "text-[#43C17A]"
                    : "text-[#282828]"
                }`}
              >
                I'm experienced
              </p>
              <p className="text-sm mt-1 text-[#525252]">
                i have work experience (excluding internships)
              </p>
            </div>

            <div
              onClick={() => setWorkStatus("fresher")}
              className={`border rounded-md p-4 cursor-pointer transition-all ${
                workStatus === "fresher"
                  ? "border-[#43C17A] bg-green-50"
                  : "hover:border-[#43C17A] border-[#CCCCCC]"
              }`}
            >
              <p
                className={`font-medium ${
                  workStatus === "fresher"
                    ? "text-[#43C17A]"
                    : "text-[#282828]"
                }`}
              >
                I'm a fresher
              </p>
              <p className="text-sm mt-1 text-[#525252]">
                i am a student/Haven't worked after graduation
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button
            className={`bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}