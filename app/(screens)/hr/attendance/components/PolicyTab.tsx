"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import PolicyShimmer from "./PolicyShimmer";

export default function PolicyTab() {
  const { collegeId, collegeHrId } = useCollegeHr();
  const { userId: currentUserId } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState<{
    graceMinutes: number | "";
    halfDayMinPercent: number | "";
    halfDayMaxPercent: number | "";
    fullDayMinPercent: number | "";
    earlyOutThresholdMin: number | "";
    lopPerAbsentDay: boolean;
  }>({
    graceMinutes: "",
    halfDayMinPercent: "",
    halfDayMaxPercent: "",
    fullDayMinPercent: "",
    earlyOutThresholdMin: "",
    lopPerAbsentDay: false,
  });

  useEffect(() => {
    if (!collegeId) return;
    const fetchPolicy = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("staff_attendance_policies")
          .select("*")
          .eq("collegeId", collegeId)
          .eq("is_deleted", false)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setPolicy({
            graceMinutes: data.graceMinutes,
            halfDayMinPercent: data.halfDayMinPercent,
            halfDayMaxPercent: data.halfDayMaxPercent,
            fullDayMinPercent: data.fullDayMinPercent,
            earlyOutThresholdMin: data.earlyOutThresholdMin,
            lopPerAbsentDay: data.lopPerAbsentDay,
          });
        }
      } catch (err) {
        console.error("Failed to load policy:", err);
        toast.error("Failed to load attendance policy", { id: "policy-load-err" });
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [collegeId]);

  const handleSave = async () => {
    if (!collegeId || !collegeHrId) return;

    if (policy.graceMinutes === "") {
      toast.error("Grace Period is required", { id: "policy-val-grace" });
      return;
    }
    if (policy.earlyOutThresholdMin === "") {
      toast.error("Early Out Threshold is required", { id: "policy-val-early" });
      return;
    }
    if (policy.fullDayMinPercent === "") {
      toast.error("Full Day Minimum (%) is required", { id: "policy-val-full" });
      return;
    }
    if (policy.halfDayMinPercent === "") {
      toast.error("Half Day Minimum (%) is required", { id: "policy-val-half" });
      return;
    }

    setSaving(true);
    try {
      // Auto-compute halfDayMaxPercent = fullDayMinPercent (50%-75% range = HalfDay)
      const payload = {
        collegeId,
        userId: currentUserId,
        ...policy,
        halfDayMaxPercent: policy.fullDayMinPercent, // Always synced
      };

      const res = await fetch("/api/hr/attendance/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success("Staff attendance policy updated successfully", { id: "policy-save-succ" });
    } catch (err: any) {
      toast.error(err.message || "Failed to update policy", { id: "policy-save-err" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PolicyShimmer />;
  }

  return (
    <div className=" bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 relative">
      <Toaster position="top-right" />
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Staff Attendance Policy</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure grace periods, half-day thresholds, and late calculations for staff attendance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Grace Period */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Grace Period (Minutes) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Time allowed after shift start before marking as Late.
          </p>
          <input
            type="number"
            min="0"
            placeholder="e.g. 15"
            className="border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#6C20CA] focus:border-transparent transition-all cursor-pointer"
            value={policy.graceMinutes}
            onChange={(e) => setPolicy({ ...policy, graceMinutes: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })}
          />
        </div>

        {/* Early Out */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Early Out Threshold (Minutes) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Leaving this many minutes before shift end triggers an Early Out.
          </p>
          <input
            type="number"
            min="0"
            placeholder="e.g. 30"
            className="border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#6C20CA] focus:border-transparent transition-all cursor-pointer"
            value={policy.earlyOutThresholdMin}
            onChange={(e) => setPolicy({ ...policy, earlyOutThresholdMin: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })}
          />
        </div>

        {/* Full Day Min % */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Full Day Minimum (%) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            % of effective shift required for a Full Day Present.
          </p>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 75"
              className="border border-gray-300 rounded-lg p-2.5 w-full outline-none focus:ring-2 focus:ring-[#6C20CA] focus:border-transparent transition-all cursor-pointer"
              value={policy.fullDayMinPercent}
              onChange={(e) => setPolicy({ ...policy, fullDayMinPercent: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })}
            />
            <span className="absolute right-4 top-3 text-gray-400 font-medium">%</span>
          </div>
        </div>

        {/* Half Day Min % */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Half Day Minimum (%) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            % of effective shift required to avoid Absent (marks as Half Day).
          </p>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 50"
              className="border border-gray-300 rounded-lg p-2.5 w-full outline-none focus:ring-2 focus:ring-[#6C20CA] focus:border-transparent transition-all cursor-pointer"
              value={policy.halfDayMinPercent}
              onChange={(e) => setPolicy({ ...policy, halfDayMinPercent: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })}
            />
            <span className="absolute right-4 top-3 text-gray-400 font-medium">%</span>
          </div>
        </div>

      </div>

      {/* Checkbox settings */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-5 h-5 accent-[#6C20CA] cursor-pointer rounded"
            checked={policy.lopPerAbsentDay}
            onChange={(e) => setPolicy({ ...policy, lopPerAbsentDay: e.target.checked })}
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">Apply LOP for Absent Days</span>
            <span className="text-xs text-gray-500">Automatically deduct salary for unapproved absences during payroll.</span>
          </div>
        </label>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all cursor-pointer ${
            saving ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#6C20CA] to-[#8C3BEA] hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save Policy"
          )}
        </button>
      </div>
    </div>
  );
}
