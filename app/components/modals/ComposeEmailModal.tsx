"use client";

import { useUser } from "@/app/utils/context/UserContext";
import {
  getBranches,
  getEducationTypes,
  getSections,
  getSemesters,
  getUniqueRoles,
  getYears,
} from "@/lib/helpers/email/emailFiltersAPI";
import { supabase } from "@/lib/supabaseClient";
import { PaperPlaneRightIcon } from "@phosphor-icons/react";
import {
  Bold,
  Check,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  Paperclip,
  Smile,
  Underline,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  collegeId: number;
  onSuccess?: () => void;
  replyData?: {
    to: string;
    subject: string;
    body: string;
    senderName: string;
    date: string;
    time: string;
  } | null;
  initialEmail?: string;
};

const EMOJI_LIST = [
  "😀",
  "😂",
  "🥰",
  "😎",
  "🤔",
  "🙌",
  "👍",
  "🔥",
  "✨",
  "🎉",
  "❤️",
  "💡",
  "✅",
  "👀",
  "💀",
  "📌",
  "💯",
];

export default function ComposeEmailModal({
  isOpen,
  onClose,
  collegeId,
  replyData,
  onSuccess,
  initialEmail,
}: Props) {
  const [audience, setAudience] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [edu, setEdu] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [sem, setSem] = useState("");
  const [sec, setSec] = useState("");

  const [rolesList, setRolesList] = useState<string[]>([]);
  const [eduList, setEduList] = useState<any[]>([]);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [yearList, setYearList] = useState<any[]>([]);
  const [semList, setSemList] = useState<any[]>([]);
  const [secList, setSecList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [attachments, setAttachments] = useState<
    { name: string; url: string; isImage: boolean }[]
  >([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { fullName, email, userId } = useUser();

  useEffect(() => {
    if (isOpen && collegeId) {
      getUniqueRoles(collegeId).then(setRolesList);
      getEducationTypes(collegeId).then(setEduList);
    }
  }, [isOpen, collegeId]);

  useEffect(() => {
    if (isOpen) {
      if (replyData) {
        setAudience("");
        setManualEmail(replyData.to);
        const newSubject = replyData.subject.toLowerCase().startsWith("re:")
          ? replyData.subject
          : `Re: ${replyData.subject}`;
        setSubject(newSubject);

        const doc = new DOMParser().parseFromString(
          replyData.body,
          "text/html",
        );
        const plainTextBody = doc.body.textContent || "";
        const quoteHeader = `<br/><br/><div style="color: #6B7280; font-size: 12px;">On ${replyData.date} at ${replyData.time}, ${replyData.senderName} &lt;${replyData.to}&gt; wrote:</div>`;
        const quotedBody = plainTextBody
          .split("\n")
          .map((line) => `> ${line}`)
          .join("<br/>");

        const finalHtml = `${quoteHeader}${quotedBody}`;
        setDescription(finalHtml);
        if (editorRef.current) {
          editorRef.current.innerHTML = finalHtml;
        }
      } else if (initialEmail) {
        setAudience("");
        setManualEmail(initialEmail);
      }
    }
  }, [isOpen, replyData, initialEmail]);

  useEffect(() => {
    setBranch("");
    if (edu) getBranches(edu).then(setBranchList);
    else setBranchList([]);
  }, [edu]);

  useEffect(() => {
    setYear("");
    if (branch) getYears(branch).then(setYearList);
    else setYearList([]);
  }, [branch]);

  useEffect(() => {
    setSem("");
    setSec("");
    if (year) {
      getSemesters(year).then(setSemList);
      getSections(year).then(setSecList);
    } else {
      setSemList([]);
      setSecList([]);
    }
  }, [year]);

  const handleClose = () => {
    setManualEmail("");
    setSubject("");
    setDescription("");
    setAttachments([]);
    setShowLinkInput(false);
    setShowEmojiPicker(false);
    if (editorRef.current) editorRef.current.innerHTML = "";
    onClose();
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      setDescription(editorRef.current.innerHTML);
    }
  };

  const handleToggleCase = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      toast.error("Please highlight text to change its case.");
      return;
    }
    const text = selection.toString();
    if (!text) return;

    let newText = text;
    if (text === text.toLowerCase()) newText = text.toUpperCase();
    else if (text === text.toUpperCase())
      newText = text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    else newText = text.toLowerCase();

    document.execCommand("insertText", false, newText);
  };

  const applyLink = () => {
    if (linkUrl) {
      const validUrl = linkUrl.startsWith("http")
        ? linkUrl
        : `https://${linkUrl}`;
      formatText("createLink", validUrl);
    }
    setLinkUrl("");
    setShowLinkInput(false);
  };

  const insertEmoji = (emoji: string) => {
    formatText("insertText", emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isImage: boolean,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(`Uploading ${isImage ? "image" : "file"}...`);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `emails/${fileName}`;

      const { error } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);
      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("attachments").getPublicUrl(filePath);

      setAttachments((prev) => [
        ...prev,
        { name: file.name, url: publicUrl, isImage },
      ]);

      toast.success("Attached successfully!", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error("Upload failed.", { id: toastId });
    }
  };

  const handleSend = async () => {
    let finalDescription = editorRef.current?.innerHTML || "";

    if (!subject || !finalDescription || finalDescription === "<br>") {
      toast.error("Subject and description are required.");
      return;
    }
    if (!audience && !manualEmail) {
      toast.error("Please select an audience or enter an email.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Sending email...");

    try {
      if (attachments.length > 0) {
        finalDescription += `<br/><br/><div style="border-top: 1px solid #eee; padding-top: 10px;"><strong>Attachments:</strong><br/>`;
        attachments.forEach((att) => {
          if (att.isImage) {
            finalDescription += `<img src="${att.url}" alt="${att.name}" style="max-width: 100%; max-height: 300px; border-radius: 8px; margin-top: 10px;" /><br/>`;
          } else {
            finalDescription += `<br/><a href="${att.url}" target="_blank" style="color: #43C17A; text-decoration: underline;">📎 ${att.name}</a><br/>`;
          }
        });
        finalDescription += `</div>`;
      }

      const payload = {
        collegeId,
        audience,
        manualEmail,
        filters: { edu, branch, year, sem, sec },
        cc,
        subject,
        description: finalDescription,
        senderName: fullName,
        senderAddress: email,
        senderUserId: userId,
      };

      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to send email");

      toast.success("Email sent successfully!", { id: toastId });

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
      <div className="w-[90%] max-w-[580px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col relative">
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-gray-100">
          <h2 className="text-[17px] font-semibold text-[#282828]">
            Compose Email
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-[#282828] cursor-pointer" />
          </button>
        </div>

        <div className="px-5 py-3 flex flex-col gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-[#282828]">
              Send To
            </label>
            <div className="flex gap-3">
              {initialEmail ? (
                <input
                  type="email"
                  placeholder="or enter email"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-[13px] text-[#111827] focus:outline-none focus:border-[#43C17A]"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                />
              ) : (
                <>
                  <select
                    className="w-1/3 px-1 lg:px-3 py-1.5 border cursor-pointer border-gray-300 rounded-md text-[13px] text-[#111827] focus:outline-none focus:border-[#43C17A] capitalize"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  >
                    <option value="">Select Audience</option>
                    {rolesList.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <input
                    type="email"
                    placeholder="or enter email"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-[13px] text-[#111827] focus:outline-none focus:border-[#43C17A]"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                  />
                </>
              )}
            </div>
          </div>

          {!initialEmail && (
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-gray-500">
              <FilterPill
                label="Education Type"
                value={edu}
                onChange={setEdu}
                options={eduList}
                valKey="collegeEducationId"
                nameKey="collegeEducationType"
                defaultLabel="All"
              />
              <FilterPill
                label="Branch"
                value={branch}
                onChange={setBranch}
                options={branchList}
                valKey="collegeBranchId"
                nameKey="collegeBranchType"
                defaultLabel="All"
                disabled={!edu}
              />
              <FilterPill
                label="Year"
                value={year}
                onChange={setYear}
                options={yearList}
                valKey="collegeAcademicYearId"
                nameKey="collegeAcademicYear"
                defaultLabel="All Years"
                disabled={!branch}
              />
              <FilterPill
                label="Sem"
                value={sem}
                onChange={setSem}
                options={semList}
                valKey="collegeSemesterId"
                nameKey="collegeSemester"
                defaultLabel="All"
                disabled={!year}
              />
              <FilterPill
                label="Sec"
                value={sec}
                onChange={setSec}
                options={secList}
                valKey="collegeSectionsId"
                nameKey="collegeSections"
                defaultLabel="All Sections"
                disabled={!year}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-[#282828]">
              Cc
            </label>
            <input
              type="text"
              placeholder="comma separated emails"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-[13px] text-[#111827] focus:outline-none focus:border-[#43C17A]"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-[#282828]">
              Subject
            </label>
            <input
              type="text"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-[13px] text-[#111827] focus:outline-none focus:border-[#43C17A]"
              value={subject}
              placeholder="Subject"
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-[#282828]">
              Description
            </label>
            <div className="border border-gray-300 rounded-md flex flex-col focus-within:border-[#43C17A] relative">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => handleFileUpload(e, false)}
              />
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                className="hidden"
                onChange={(e) => handleFileUpload(e, true)}
              />

              <div
                ref={editorRef}
                contentEditable
                className="w-full h-[110px] p-3 text-[13px] text-[#111827] overflow-y-auto focus:outline-none bg-white rounded-t-md"
              />

              {attachments.length > 0 && (
                <div className="p-2 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-2">
                  {attachments.map((att, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-white border border-gray-200 px-2 py-1 rounded text-xs"
                    >
                      {att.isImage ? (
                        <ImageIcon size={12} className="text-[#43C17A]" />
                      ) : (
                        <Paperclip size={12} className="text-[#43C17A]" />
                      )}
                      <span className="truncate max-w-[120px] text-gray-700">
                        {att.name}
                      </span>
                      <button
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                        className="ml-1 text-gray-400 cursor-pointer hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showLinkInput && (
                <div className="absolute bottom-12 left-2 bg-white border border-gray-200 shadow-lg rounded-md p-2 flex items-center gap-2 z-10">
                  <input
                    type="url"
                    placeholder="https://"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs w-48 focus:outline-none focus:border-[#43C17A]"
                    autoFocus
                  />
                  <button
                    onClick={applyLink}
                    className="bg-[#43C17A] text-white p-1 rounded hover:bg-[#3ba869]"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setShowLinkInput(false)}
                    className="bg-gray-100 text-gray-500 p-1 rounded hover:bg-gray-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {showEmojiPicker && (
                <div className="absolute bottom-12 left-16 bg-white border border-gray-200 shadow-lg rounded-md p-2 w-48 z-10 grid grid-cols-5 gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="text-lg hover:bg-gray-100 rounded flex items-center justify-center p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between p-1.5 border-t border-gray-100 bg-gray-50 rounded-b-md">
                <div className="flex items-center gap-0.5 ml-0 md:ml-1 lg:ml-1">
                  <ToolbarIcon
                    onClick={() => formatText("bold")}
                    icon={<Bold size={14} />}
                    title="Bold"
                  />
                  <ToolbarIcon
                    onClick={() => formatText("italic")}
                    icon={<Italic size={14} />}
                    title="Italic"
                  />
                  <ToolbarIcon
                    onClick={() => formatText("underline")}
                    icon={<Underline size={14} />}
                    title="Underline"
                  />
                  <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                  <ToolbarIcon
                    onClick={handleToggleCase}
                    icon={
                      <span className="font-serif font-bold text-[13px] tracking-tighter">
                        Aa
                      </span>
                    }
                    title="Toggle Case"
                  />
                  <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                  <ToolbarIcon
                    onClick={() => fileInputRef.current?.click()}
                    icon={<Paperclip size={14} />}
                    title="Attach File"
                  />
                  <ToolbarIcon
                    onClick={() => {
                      setShowLinkInput(!showLinkInput);
                      setShowEmojiPicker(false);
                    }}
                    icon={<LinkIcon size={14} />}
                    title="Insert Link"
                  />
                  <ToolbarIcon
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowLinkInput(false);
                    }}
                    icon={<Smile size={14} />}
                    title="Insert Emoji"
                  />
                  <ToolbarIcon
                    onClick={() => imageInputRef.current?.click()}
                    icon={<ImageIcon size={14} />}
                    title="Insert Image"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={isSubmitting}
                  className="hidden md:block lg:block bg-[#43C17A] cursor-pointer hover:bg-[#3ba869] disabled:bg-[#a1e0bd] text-white px-6 py-1.5 rounded-md text-[13px] font-medium transition-colors"
                >
                  Send
                </button>

                {/* Mobile View*/}
                <button
                  onClick={handleSend}
                  disabled={isSubmitting}
                  className="block md:hidden lg:hidden bg-[#43C17A] cursor-pointer hover:bg-[#3ba869] disabled:bg-[#a1e0bd] text-white p-1 ml-0.5 rounded-full text-[13px] font-medium transition-colors"
                >
                  <PaperPlaneRightIcon size={15} weight="fill" />
                </button>
                {/* Mobile View*/}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  value,
  options,
  onChange,
  valKey,
  nameKey,
  defaultLabel,
  disabled,
}: any) {
  return (
    <div className={`flex items-center gap-1 ${disabled ? "opacity-50" : ""}`}>
      <span className="text-gray-500 whitespace-nowrap">{label} :</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="bg-[#EAFaf1] text-[#43C17A] border-none text-[11px] font-medium rounded-full px-2 py-0.5 cursor-pointer outline-none appearance-none pr-5 relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2343C17A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundPosition: `right 4px center`,
          backgroundRepeat: `no-repeat`,
          backgroundSize: `10px`,
        }}
      >
        <option value="">{defaultLabel}</option>
        {options.map((opt: any) => (
          <option key={opt[valKey]} value={opt[valKey]}>
            {opt[nameKey]}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToolbarIcon({
  icon,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-md bg-transparent text-gray-600 hover:bg-gray-200 transition-colors"
    >
      {icon}
    </button>
  );
}
