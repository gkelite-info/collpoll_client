"use client";

import { Info } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

export type HeaderConfig = {
  collegeTcHeaderId?: number;
  collegeName: string;
  affiliation: string;
  address: string;
  phone: string;
  logoUrl?: string;
};

export function TransferUploadHeaderScreen({
  config,
  onCancel,
  onSave,
  onDraft,
}: {
  config: HeaderConfig;
  onCancel: () => void;
  onSave: (updatedConfig: HeaderConfig) => Promise<void> | void;
  onDraft: () => void;
}) {
  const [collegeName, setCollegeName] = useState(config.collegeName);
  const [affiliation, setAffiliation] = useState(config.affiliation);
  const [address, setAddress] = useState(config.address);
  const [phone, setPhone] = useState(config.phone);
  const [isSaving, setIsSaving] = useState(false);
  const logoUrl = config.logoUrl || null;

  const handleSave = async () => {
    if (!collegeName.trim() || !affiliation.trim() || !address.trim() || !phone.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        collegeName,
        affiliation,
        address,
        phone,
        logoUrl: logoUrl || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Top Breadcrumb Header */}
      <section>
        <h1 className="flex flex-wrap items-center gap-2 text-[24px] font-bold leading-tight md:text-[28px]">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer text-[#17213D] transition-colors hover:text-[#43C17A]"
          >
            Bonafides
          </button>
          <span className="text-[#17213D] font-normal">/</span>
          <span className="text-[#43C17A]">Transfer Certificate</span>
        </h1>
        <p className="mt-1 text-[13px] font-medium text-[#7B8AA3]">
          Configure the official header details and branding for generated TCs.
        </p>
      </section>

      {/* Info Blue Banner */}
      <div className="flex items-center gap-3 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[#1E40AF]">
        <Info size={20} className="shrink-0" />
        <span className="text-[12px] font-semibold">
          Upload the college header information that will appear at the top of the Transfer Certificate.
        </span>
      </div>

      {/* Two Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        
        {/* Left Card: Header Information Configuration Form */}
        <section className="rounded-lg border border-[#E7ECF3] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.06)] flex flex-col gap-5">
          <h2 className="text-[16px] font-bold text-[#17213D] border-b border-[#F1F5F9] pb-3 mb-2">
            Header Information
          </h2>

          {/* College Name */}
          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#17213D]">
              College / Institution Name <span className="text-[#EF4444]">*</span>
            </span>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="Enter College Name"
              className="h-10 rounded-md border border-[#D7DEE8] bg-white px-3 text-[13px] font-medium text-[#17213D] outline-none focus:border-[#43C17A] transition-colors w-full"
            />
          </label>

          {/* Affiliation / Board */}
          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#17213D]">
              Affiliation / Board <span className="text-[#EF4444]">*</span>
            </span>
            <input
              type="text"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder="e.g. (Affiliated to State Board of Technical Education)"
              className="h-10 rounded-md border border-[#D7DEE8] bg-white px-3 text-[13px] font-medium text-[#17213D] outline-none focus:border-[#43C17A] transition-colors w-full"
            />
          </label>

          {/* Address */}
          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#17213D]">
              Address <span className="text-[#EF4444]">*</span>
            </span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter College Address"
              rows={3}
              className="rounded-md border border-[#D7DEE8] bg-white px-3 py-2 text-[13px] font-medium text-[#17213D] outline-none focus:border-[#43C17A] transition-colors w-full resize-none h-[80px]"
            />
          </label>

          {/* Phone Number / Contact */}
          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#17213D]">
              Phone Number / Contact <span className="text-[#EF4444]">*</span>
            </span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08458-288974, 9505504219"
              className="h-10 rounded-md border border-[#D7DEE8] bg-white px-3 text-[13px] font-medium text-[#17213D] outline-none focus:border-[#43C17A] transition-colors w-full"
            />
          </label>

          {/* College Logo */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#17213D]">
              College Logo
            </span>
            <div className="rounded-md border border-[#D7DEE8] bg-[#F8FAFC] p-6 flex min-h-[140px] flex-col items-center justify-center text-center">
              {logoUrl ? (
                <>
                <Image
                  src={logoUrl}
                  alt="College Logo"
                  width={64}
                  height={64}
                  unoptimized
                  className="mb-3 h-16 w-16 rounded-full object-contain"
                />
                  <p className="text-[13px] font-bold text-[#17213D]">College logo loaded</p>
                </>
              ) : (
                <p className="max-w-[360px] text-[13px] font-bold leading-relaxed text-[#E11D48]">
                  College logo is not available. Please contact admin to add the logo.
                </p>
              )}
            </div>
          </div>

          {/* Action buttons inside card (Cancel, Draft, Save Header) */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#F1F5F9] mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-10 rounded-md border border-[#DDE4EE] bg-white px-6 text-[13px] font-bold text-[#17213D] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDraft}
              className="h-10 rounded-md border border-[#16284F] bg-white px-6 text-[13px] font-bold text-[#16284F] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Draft
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-10 cursor-pointer rounded-md bg-[#16284F] px-8 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(22,40,79,0.15)] transition-all hover:bg-[#0f1c37] disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </section>

        {/* Right Card: Live Preview Card */}
        <aside className="rounded-lg border border-[#E7ECF3] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.06)] flex flex-col gap-4">
          <h2 className="text-[16px] font-bold text-[#17213D]">
            Live Preview
          </h2>

          <div className="border border-slate-200 rounded-md p-8 bg-white flex flex-col items-center justify-between min-h-[500px] shadow-sm text-center">
            <div className="flex flex-col items-center w-full">
              {/* Logo Placeholder */}
              <div className="mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-slate-50">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt="College Logo Preview"
                    width={112}
                    height={112}
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <svg className="w-12 h-12 text-slate-300" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
                    <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1" />
                    <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1" />
                  </svg>
                )}
              </div>

              {/* College Name */}
              <h3 className="text-[18px] font-extrabold uppercase text-[#17213D] leading-tight tracking-wide">
                {collegeName || "COLLEGE NAME"}
              </h3>

              {/* Affiliation */}
              <p className="mt-2 text-[16px] font-bold italic leading-tight text-slate-500">
                {affiliation || "Affiliation Details"}
              </p>

              {/* Decorative separator with star/sun */}
              <div className="my-5 flex w-full items-center justify-center gap-2 text-slate-400">
                <span className="h-[1px] bg-slate-200 flex-1"></span>
                <span className="text-[10px]">✸</span>
                <span className="h-[1px] bg-slate-200 flex-1"></span>
              </div>

              {/* Address */}
              <p className="px-2 text-[16px] font-medium leading-relaxed text-slate-600">
                {address || "College Address Details"}
              </p>

              {/* Phone */}
              <p className="mt-2 text-[18px] font-bold text-slate-800">
                Ph : {phone || "Phone Details"}
              </p>
            </div>
            
            {/* Draft notice */}
            <div className="text-[10px] text-slate-400 font-semibold italic border-t border-slate-100 pt-4 w-full mt-6">
              Official Transfer Certificate Header Preview
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
