"use client";

import { FloppyDisk, ImageSquare, Package } from "@phosphor-icons/react";
import type { EquipmentFormState } from "../types";

type EquipmentFormProps = {
  title: string;
  description: string;
  form: EquipmentFormState;
  onChange: (nextForm: EquipmentFormState) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitText: string;
  compact?: boolean;
  itemLabel?: string;
  isSaving?: boolean;
  isCancelling?: boolean;
};

export function EquipmentForm({
  title,
  description,
  form,
  onChange,
  onCancel,
  onSubmit,
  submitText,
  compact = false,
  itemLabel = "Equipment",
  isSaving = false,
  isCancelling = false,
}: EquipmentFormProps) {
  const isBusy = isSaving || isCancelling;
  const isFormValid = form.name.trim().length > 0 && Number(form.quantity) > 0;
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (form.image?.startsWith("blob:")) {
      URL.revokeObjectURL(form.image);
    }
    onChange({ ...form, image: URL.createObjectURL(file), imageFile: file });
  };

  return (
    <section className={`mx-auto w-full ${compact ? "max-w-[700px]" : "max-w-[760px]"}`}>
      <div className={compact ? "mb-6" : "mb-7"}>
        <h1 className={`${compact ? "text-[24px]" : "text-[28px]"} font-extrabold text-[#16284F]`}>
          {title}
        </h1>
        <p className={`${compact ? "mt-1 text-[12px]" : "mt-1 text-[14px]"} font-medium text-[#525252]`}>
          {description}
        </p>
      </div>

      <div className="overflow-hidden rounded border border-[#CBD5E1] bg-white">
        <div className={`flex items-center gap-3 border-b border-[#E2E8F0] ${compact ? "px-6 py-4" : "px-7 py-5"}`}>
          <span className={`${compact ? "h-8 w-8" : "h-10 w-10"} flex items-center justify-center rounded bg-[#EEF3F8] text-[#16284F]`}>
            <Package size={compact ? 16 : 20} weight="fill" />
          </span>
          <h2 className={`${compact ? "text-[14px]" : "text-[17px]"} font-extrabold text-[#16284F]`}>
            {itemLabel} Details
          </h2>
        </div>

        <div className={`${compact ? "space-y-5 px-6 py-6" : "space-y-6 px-7 py-7"}`}>
          <label className="block">
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-[#475569]">
              {itemLabel} Name <span className="text-[#FF2A2A]">*</span>
            </span>
            <input
              value={form.name}
              onChange={(event) => onChange({ ...form, name: event.target.value })}
              placeholder={`Enter ${itemLabel.toLowerCase()} name`}
              className={`${compact ? "h-9" : "h-12"} mt-2 w-full rounded-sm border border-[#CBD5E1] bg-[#F8FAFC] px-4 text-[13px] font-semibold text-[#16284F] outline-none focus:border-[#43C17A]`}
            />
          </label>

          <div className={`grid gap-5 ${compact ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
            <label className="block">
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-[#475569]">
                Quantity <span className="text-[#FF2A2A]">*</span>
              </span>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(event) => onChange({ ...form, quantity: event.target.value })}
                placeholder="0"
                className={`${compact ? "h-9" : "h-12"} mt-2 w-full rounded-sm border border-[#CBD5E1] bg-[#F8FAFC] px-4 text-[13px] font-semibold text-[#16284F] outline-none focus:border-[#43C17A]`}
              />
            </label>
            <label className={compact ? "hidden" : "block"}>
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-[#475569]">Available</span>
              <input
                type="number"
                min="0"
                value={form.available}
                onChange={(event) => onChange({ ...form, available: event.target.value })}
                placeholder="0"
                className="mt-2 h-12 w-full rounded-sm border border-[#CBD5E1] bg-[#F8FAFC] px-4 text-[13px] font-semibold text-[#16284F] outline-none focus:border-[#43C17A]"
              />
            </label>
          </div>

          <label className={`${compact ? "p-3" : "p-4"} flex cursor-pointer items-center justify-between gap-4 rounded-sm border border-dashed border-[#CBD5E1] bg-[#F8FAFC]`}>
            <span className="flex items-center gap-4">
              <span className={`${compact ? "h-11 w-11" : "h-14 w-14"} flex shrink-0 items-center justify-center overflow-hidden rounded-sm border border-[#CBD5E1] bg-white text-[#64748B]`}>
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image} alt="Selected reference" className="h-full w-full object-cover" />
                ) : (
                  <ImageSquare size={compact ? 20 : 24} weight="bold" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-extrabold text-[#334155]">Reference Image</span>
                <span className="mt-1 block max-w-[360px] truncate text-[12px] font-medium text-[#64748B]">
                  {form.imageFile?.name || "Upload a visual reference for staff identification."}
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-sm border border-[#CBD5E1] bg-white px-5 py-2 text-[12px] font-bold text-[#16284F]">
              {form.image ? "Change" : "Browse"}
            </span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>

          <div className={`${compact ? "pt-6" : "pt-7"} flex justify-end gap-4 border-t border-[#CBD5E1]`}>
            <button type="button" onClick={onCancel} disabled={isBusy} className={`${compact ? "h-9 px-7" : "h-11 px-8"} inline-flex cursor-pointer items-center gap-2 rounded-sm border border-[#16284F] text-[12px] font-bold text-[#16284F] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60`}>
              {isCancelling ? "Cancelling..." : "Cancel"}
            </button>
            <button type="button" onClick={onSubmit} disabled={isBusy || !isFormValid} className={`${compact ? "h-9 px-7" : "h-11 px-8"} inline-flex cursor-pointer items-center gap-2 rounded-sm bg-[#16284F] text-[12px] font-bold text-white hover:bg-[#0F1E3A] disabled:cursor-not-allowed disabled:opacity-60`}>
              {!isSaving ? <FloppyDisk size={16} weight="bold" /> : null}
              {isSaving ? "Saving..." : submitText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
