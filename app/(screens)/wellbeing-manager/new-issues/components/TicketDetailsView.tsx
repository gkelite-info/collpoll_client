"use client";

import {
  CaretRight,
  DownloadSimple,
  FileText,
  PaperclipIcon,
  UserCircle,
  UserPlus,
  Warning,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MdPictureAsPdf } from "react-icons/md";
import ReassignTicketModal from "../../components/ReassignTicketModal";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";

type CategoryRelation =
  | { categoryName?: string | null }
  | { categoryName?: string | null }[]
  | null;

type IssueDetailsRow = {
  wellbeingSupportIssueId: number;
  fullName: string;
  email: string;
  issueTitle: string;
  description: string;
  categoryId: number;
  priority: "high" | "medium" | "low";
  issueRaisedRole: string;
  appliesTo: string;
  createdAt: string | null;
  createdBy: number;
  profileUrl?: string | null;
  wellbeing_categories: CategoryRelation;
};

type AttachmentRow = {
  wellbeingSupportIssueAttachmentId: number;
  attachment: string;
  createdAt: string | null;
};

interface TicketDetailsViewProps {
  ticketId: string;
  onBack: () => void;
}

const getIssueIdFromTicket = (ticketId: string) => {
  const match = ticketId.match(/\d+/);
  return match ? Number(match[0]) : null;
};

const getCategoryName = (category: CategoryRelation) => {
  if (Array.isArray(category)) {
    return category[0]?.categoryName || "-";
  }

  return category?.categoryName || "-";
};

const formatPriority = (priority?: IssueDetailsRow["priority"]) =>
  priority === "high" ? "High" : priority === "medium" ? "Medium" : "Low";

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getAttachmentName = (path: string) =>
  path.split("/").pop()?.replace(/^\d+_\d+_/, "") || "Attachment";

export default function TicketDetailsView({ ticketId, onBack }: TicketDetailsViewProps) {
  const { collegeId } = useUser();
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [issue, setIssue] = useState<IssueDetailsRow | null>(null);
  const [attachments, setAttachments] = useState<AttachmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supportIssueId = useMemo(() => getIssueIdFromTicket(ticketId), [ticketId]);
  const categoryName = getCategoryName(issue?.wellbeing_categories ?? null);
  const displayTicketId = issue ? `#TK-${issue.wellbeingSupportIssueId}` : ticketId;

  const loadIssue = useCallback(async () => {
    if (!collegeId || !supportIssueId) {
      setIssue(null);
      setAttachments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("wellbeing_support_issues")
        .select(`
          wellbeingSupportIssueId,
          fullName,
          email,
          issueTitle,
          description,
          categoryId,
          priority,
          issueRaisedRole,
          appliesTo,
          createdAt,
          createdBy,
          wellbeing_categories(categoryName)
        `)
        .eq("collegeId", collegeId)
        .eq("wellbeingSupportIssueId", supportIssueId)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .maybeSingle();

      if (error) throw error;

      const issueData = data as IssueDetailsRow | null;
      if (issueData) {
        const { data: profile } = await supabase
          .from("user_profile")
          .select("profileUrl")
          .eq("userId", issueData.createdBy)
          .eq("is_deleted", false)
          .maybeSingle();

        setIssue({
          ...issueData,
          profileUrl: profile?.profileUrl ?? null,
        });
      } else {
        setIssue(null);
      }

      const { data: attachmentData, error: attachmentError } = await supabase
        .from("wellbeing_support_issue_attachments")
        .select("wellbeingSupportIssueAttachmentId, attachment, createdAt")
        .eq("wellbeingSupportIssueId", supportIssueId)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

      if (attachmentError) throw attachmentError;

      setAttachments((attachmentData ?? []) as AttachmentRow[]);
    } catch (error) {
      console.error("load ticket details error:", error);
      setIssue(null);
      setAttachments([]);
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, supportIssueId]);

  useEffect(() => {
    loadIssue();
  }, [loadIssue]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center p-8 text-sm font-bold text-[#16284F]">
        Loading ticket...
      </main>
    );
  }

  if (!issue) {
    return (
      <main className="flex min-h-screen w-full flex-col gap-4 p-4">
        <button
          type="button"
          onClick={onBack}
          className="w-fit cursor-pointer text-sm font-bold text-[#047857]"
        >
          Back to tickets
        </button>
        <div className="rounded-xl bg-white p-6 text-sm font-semibold text-gray-500 shadow-sm">
          Ticket details not found.
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col gap-5 p-2 md:gap-6">
      <div className="flex items-center gap-2 text-sm font-medium select-none">
        <span
          onClick={onBack}
          className="cursor-pointer text-gray-600 transition-colors hover:text-gray-900"
        >
          Tickets
        </span>
        <CaretRight size={12} weight="bold" className="mt-0.5 text-gray-500" />
        <span className="font-bold text-[#047857]">{displayTicketId}</span>
      </div>

      {issue.priority === "high" ? (
        <div className="flex items-start gap-3 rounded-xl bg-[#FCE8E8] p-4 text-[#9B1C1C] sm:items-center">
          <Warning size={24} weight="fill" className="mt-0.5 shrink-0 text-[#7F1D1D] sm:mt-0" />
          <div className="flex flex-col">
            <span className="text-sm font-bold sm:text-[15px]">High Priority Warning</span>
            <span className="mt-0.5 text-xs font-medium opacity-90 sm:text-sm">
              This ticket has been marked high priority and needs quick review.
            </span>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center md:p-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-bold text-gray-800 md:text-xl">
              {displayTicketId}: {issue.issueTitle}
            </h1>
            <span className="rounded-full bg-[#E8F0E4] px-3 py-1 text-[11px] font-bold tracking-wide text-[#006E2F]">
              {formatPriority(issue.priority)}
            </span>
          </div>
          <p className="text-[13px] font-semibold text-gray-500 md:text-sm">
            Reported {formatDateTime(issue.createdAt)} &bull; Categorized under {categoryName}
          </p>
        </div>
        <button
          onClick={() => setIsReassignModalOpen(true)}
          className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#047857] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#036549] active:scale-95"
        >
          <UserPlus size={18} weight="bold" />
          Reassign
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="ml-3 mt-1 flex items-center gap-2 px-1 font-bold text-[#16284F]">
          <UserCircle size={20} weight="bold" className="text-[#047857]" />
          <h2 className="text-[15px]">Requester Information</h2>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            {issue.profileUrl ? (
              <Image
                src={issue.profileUrl}
                alt={issue.fullName}
                width={112}
                height={112}
                unoptimized
                className="h-28 w-28 shrink-0 rounded-2xl object-cover"
              />
            ) : null}
          <div className="grid w-full grid-cols-2 gap-x-4 gap-y-5 px-2 md:grid-cols-3 md:px-0">
            <InfoItem label="Full Name" value={issue.fullName} />
            <InfoItem label="Email" value={issue.email} />
            <InfoItem label="Role" value={issue.issueRaisedRole} />
            <InfoItem label="Applies To" value={issue.appliesTo} />
            <InfoItem label="Requester ID" value={String(issue.createdBy)} />
            <InfoItem label="Priority" value={formatPriority(issue.priority)} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-white shadow-sm">
        <div className="ml-3 mt-3 flex items-center gap-2 px-1 font-bold text-[#16284F]">
          <FileText size={20} weight="fill" className="text-[#047857]" />
          <h2 className="text-[15px]">Issue Description</h2>
        </div>
        <div className="p-5 pt-1">
          <p className="whitespace-pre-line text-[14px] font-medium leading-relaxed text-gray-700 md:text-[15px]">
            {issue.description}
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-3 rounded-2xl bg-white pb-4 pt-4 shadow-sm">
        <div className="ml-4 flex items-center gap-2 px-1 font-bold text-[#16284F]">
          <PaperclipIcon size={20} weight="bold" className="text-[#047857]" />
          <h2 className="text-[15px]">Proof / Evidence</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 pt-2 md:grid-cols-2">
          {attachments.length ? (
            attachments.map((file) => (
              <div
                key={file.wellbeingSupportIssueAttachmentId}
                className="flex items-center justify-between rounded-xl border border-[#E8F0E4] bg-[#F3FCEF] p-3 px-2"
              >
                <div className="flex min-w-0 items-center gap-3 md:gap-4">
                  <div className="shrink-0 rounded-sm bg-[#FCE8E8] p-2.5">
                    <MdPictureAsPdf className="text-[24px] text-[#D32F2F]" />
                  </div>
                  <div className="flex min-w-0 flex-col justify-center">
                    <span className="break-all text-[14px] font-bold leading-tight text-gray-800 md:text-[15px]">
                      {getAttachmentName(file.attachment)}
                    </span>
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-gray-500 md:text-[11px]">
                      Added {formatDateTime(file.createdAt)}
                    </span>
                  </div>
                </div>
                <a
                  href={supabase.storage.from("wellbeing-support-attachments").getPublicUrl(file.attachment).data.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-lg p-2.5 transition-colors"
                  title="Open attachment"
                >
                  <DownloadSimple size={20} weight="bold" className="cursor-pointer text-[#047857]" />
                </a>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 p-5 text-sm font-semibold text-gray-400">
              No evidence uploaded for this ticket.
            </div>
          )}
        </div>
      </div>

      <ReassignTicketModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        onReassigned={loadIssue}
        ticketId={displayTicketId}
        issue={{
          supportIssueId: issue.wellbeingSupportIssueId,
          ticketId: displayTicketId,
          fullName: issue.fullName,
          email: issue.email,
          profileUrl: issue.profileUrl,
          categoryId: issue.categoryId,
          category: categoryName,
          issueTitle: issue.issueTitle,
          description: issue.description,
          priority: issue.priority,
        }}
      />
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 md:text-[13px]">
        {label}
      </span>
      <span className="break-words text-[15px] font-bold text-gray-900">{value || "-"}</span>
    </div>
  );
}
