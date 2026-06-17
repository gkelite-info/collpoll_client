"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BasketballIcon,
  ConfettiIcon,
  FirstAidKitIcon,
  PaperPlaneRight,
  ShieldCheckIcon,
  Wrench,
  X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";

type ReassignIssueSummary = {
  supportIssueId: number;
  ticketId: string;
  fullName?: string | null;
  email?: string | null;
  profileUrl?: string | null;
  categoryId?: number | null;
  category?: string | null;
  issueTitle?: string | null;
  description?: string | null;
  priority?: "high" | "medium" | "low";
};

type CategoryOption = {
  categoryId: number;
  categoryName: string;
};

interface ReassignTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReassigned?: () => void | Promise<void>;
  ticketId?: string;
  issue?: ReassignIssueSummary;
}

const departmentIcons = [
  BasketballIcon,
  Wrench,
  ConfettiIcon,
  FirstAidKitIcon,
  ShieldCheckIcon,
];

const priorities = [
  { id: "high", label: "High", color: "bg-red-600", activeBg: "bg-red-600 text-white border-red-600" },
  { id: "medium", label: "Medium", color: "bg-amber-500", activeBg: "bg-amber-50 border-amber-500 text-[#282828]" },
  { id: "low", label: "Low", color: "bg-emerald-500", activeBg: "bg-emerald-50 border-green-500 text-[#282828]" },
] as const;

const getIssueIdFromTicket = (ticketId?: string) => {
  const match = ticketId?.match(/\d+/);
  return match ? Number(match[0]) : null;
};

const getInitials = (name?: string | null) =>
  (name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

export default function ReassignTicketModal({
  isOpen,
  onClose,
  onReassigned,
  ticketId = "#TK",
  issue,
}: ReassignTicketModalProps) {
  const { collegeId } = useUser();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [fallbackIssue, setFallbackIssue] = useState<ReassignIssueSummary | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedPriority, setSelectedPriority] =
    useState<ReassignIssueSummary["priority"]>("high");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeIssue = issue ?? fallbackIssue;
  const displayTicketId = activeIssue?.ticketId || ticketId;

  const loadCategories = useCallback(async () => {
    if (!collegeId) {
      setCategories([]);
      return;
    }

    const { data, error } = await supabase
      .from("wellbeing_categories")
      .select("categoryId, categoryName")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .order("categoryName", { ascending: true });

    if (error) {
      console.error("load reassign categories error:", error);
      setCategories([]);
      return;
    }

    setCategories((data ?? []) as CategoryOption[]);
  }, [collegeId]);

  const loadFallbackIssue = useCallback(async () => {
    if (issue || !collegeId) {
      setFallbackIssue(null);
      return;
    }

    const supportIssueId = getIssueIdFromTicket(ticketId);
    if (!supportIssueId) return;

    const { data, error } = await supabase
      .from("wellbeing_support_issues")
      .select(`
        wellbeingSupportIssueId,
        fullName,
        email,
        createdBy,
        issueTitle,
        description,
        categoryId,
        priority
      `)
      .eq("collegeId", collegeId)
      .eq("wellbeingSupportIssueId", supportIssueId)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error("load reassign issue error:", error);
      setFallbackIssue(null);
      return;
    }

    const [profileResult, categoryResult] = await Promise.all([
      supabase
        .from("user_profile")
        .select("profileUrl")
        .eq("userId", data.createdBy)
        .eq("is_deleted", false)
        .maybeSingle(),
      supabase
        .from("wellbeing_categories")
        .select("categoryName")
        .eq("categoryId", data.categoryId)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .maybeSingle(),
    ]);

    setFallbackIssue({
      supportIssueId: data.wellbeingSupportIssueId,
      ticketId: `#TK-${data.wellbeingSupportIssueId}`,
      fullName: data.fullName,
      email: data.email,
      profileUrl: profileResult.data?.profileUrl ?? null,
      issueTitle: data.issueTitle,
      description: data.description,
      categoryId: data.categoryId,
      category: categoryResult.data?.categoryName || "-",
      priority: data.priority,
    });
  }, [collegeId, issue, ticketId]);

  useEffect(() => {
    if (!isOpen) return;
    loadCategories();
    loadFallbackIssue();
  }, [isOpen, loadCategories, loadFallbackIssue]);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedCategoryId(activeIssue?.categoryId ?? null);
    setSelectedPriority(activeIssue?.priority ?? "high");
    setNote(
      activeIssue?.description
        ? `Reassigning ticket for follow-up: ${activeIssue.description}`
        : "",
    );
  }, [activeIssue, isOpen]);

  const selectedCategoryName = useMemo(
    () =>
      categories.find((category) => category.categoryId === selectedCategoryId)
        ?.categoryName ||
      activeIssue?.category ||
      "-",
    [activeIssue?.category, categories, selectedCategoryId],
  );

  const handleReassign = async () => {
    if (!activeIssue?.supportIssueId || !selectedCategoryId) {
      toast.error("Select a target department before reassigning.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("wellbeing_support_issues")
        .update({
          categoryId: selectedCategoryId,
          priority: selectedPriority,
          updatedAt: new Date().toISOString(),
        })
        .eq("wellbeingSupportIssueId", activeIssue.supportIssueId);

      if (error) throw error;

      toast.success("Ticket reassigned successfully.");
      window.dispatchEvent(new Event("wellbeing-issue-created"));
      await onReassigned?.();
      onClose();
    } catch (error) {
      console.error("reassign ticket error:", error);
      toast.error("Failed to reassign ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            onClick={(event) => event.stopPropagation()}
            className="my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#F8F9FB] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
              <h2 className="text-xl font-bold text-[#16284F]">Reassign Support Ticket</h2>
              <button
                onClick={onClose}
                className="cursor-pointer rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
                title="Close"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-6">
              <div className="grid grid-cols-1 gap-6 md:gap-4 lg:grid-cols-[1fr_1.2fr]">
                <div className="flex flex-col gap-2">
                  <span className="text-[12px] font-extrabold uppercase tracking-wider text-gray-500">
                    Reassign Ticket
                  </span>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-[#FFF4E5] px-3 py-1 text-[11px] font-bold text-[#D97706]">
                        Ticket Summary
                      </span>
                      <span className="font-mono text-[13px] font-bold text-gray-400">
                        ID: {displayTicketId}
                      </span>
                    </div>

                    <div className="mb-6 flex items-center gap-4">
                      {activeIssue?.profileUrl ? (
                        <Image
                          src={activeIssue.profileUrl}
                          alt={activeIssue.fullName || "Requester profile"}
                          width={48}
                          height={48}
                          unoptimized
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#E8F0E4] text-sm font-black text-[#047857]">
                          {getInitials(activeIssue?.fullName)}
                        </span>
                      )}

                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[16px] font-bold text-[#16284F]">
                          {activeIssue?.fullName || "-"}
                        </span>
                        <span className="truncate text-[12px] font-semibold text-gray-500">
                          {activeIssue?.email || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">
                          Issue
                        </span>
                        <span className="truncate text-[13px] font-bold text-gray-800">
                          {activeIssue?.issueTitle || "-"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">
                          Category
                        </span>
                        <span className="truncate text-[13px] font-bold text-gray-800">
                          {activeIssue?.category || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[12px] font-extrabold uppercase tracking-wider text-gray-500">
                    Target Department
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {categories.map((category, index) => {
                      const Icon = departmentIcons[index % departmentIcons.length];
                      const isActive = selectedCategoryId === category.categoryId;
                      return (
                        <button
                          key={category.categoryId}
                          onClick={() => setSelectedCategoryId(category.categoryId)}
                          className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border p-3 text-[14px] font-bold shadow-sm transition-all sm:flex-row ${
                            isActive
                              ? "border-[#14B86A] bg-[#14B86A] text-white shadow-[#14B86A]/20"
                              : "border-gray-200 bg-white text-gray-700 hover:border-[#14B86A]"
                          }`}
                        >
                          <span className={`rounded-sm p-2 ${isActive ? "bg-[#E8F0E4] text-[#22C55E]" : "bg-[#E8F0E4]"}`}>
                            <Icon size={20} weight="fill" />
                          </span>
                          <span className="truncate">{category.categoryName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-extrabold uppercase tracking-wider text-gray-500">
                  Internal Note
                </span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="custom-scrollbar h-28 w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-[14px] font-medium text-gray-700 shadow-sm focus:border-[#14B86A] focus:outline-none focus:ring-2 focus:ring-[#14B86A]/20"
                  placeholder={`Forwarding this ticket to ${selectedCategoryName}.`}
                />
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-6 border-t border-gray-100 bg-white p-4 sm:flex-row sm:items-center md:p-6">
              <div className="flex w-full flex-col gap-2 sm:w-auto">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  Confirm Priority
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {priorities.map((priority) => {
                    const isActive = selectedPriority === priority.id;
                    return (
                      <button
                        key={priority.id}
                        onClick={() => setSelectedPriority(priority.id)}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-2 text-[13px] font-bold transition-all ${
                          isActive
                            ? priority.activeBg
                            : "border-gray-200 bg-white text-gray-600 hover:border-[#14B86A]"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isActive && priority.id === "high" ? "bg-white" : priority.color}`} />
                        {priority.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleReassign}
                disabled={isSubmitting}
                className="flex w-full cursor-pointer items-center justify-center gap-2 self-end rounded-xl bg-[#14B86A] px-8 py-3 font-bold text-white shadow-md shadow-[#14B86A]/20 transition-colors hover:bg-[#109f5b] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <PaperPlaneRight size={20} weight="fill" />
                {isSubmitting ? "Reassigning..." : "Re Assign"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
