"use client";

import CardComponent from "@/app/utils/card";
import {
  CaretDown,
  CheckCircle,
  Clock,
  UploadSimple,
  Warning,
} from "@phosphor-icons/react";
import {
  wellbeingCards,
  wellbeingCategories,
  wellbeingSubCategories,
} from "../data";

export default function WellbeingSupportPage() {
  return (
    <div className="bg-[#F3F3F3] px-8 py-7 flex flex-col">
      <section className="mx-auto my-auto w-full max-w-5xl rounded-xl bg-white px-16 py-10 shadow-sm flex flex-col flex-1">

        {/* Stats cards — fixed at top, never scrolls */}
        <div className="mx-auto grid w-full max-w-3xl grid-cols-4 gap-4 flex-shrink-0">
          {wellbeingCards.map((card) => (
            <CardComponent
              key={card.id}
              style="h-28 w-full"
              inlineStyle={{ backgroundColor: card.bg }}
              icon={
                <Warning
                  size={18}
                  weight="fill"
                  style={{ color: card.iconColor }}
                />
              }
              value={
                <span style={{ color: card.iconColor }} className="font-bold">
                  {card.value}
                </span>
              }
              label={card.label}
              iconBgColor="#FFFFFF"
              textSize="text-sm"
            />
          ))}
        </div>

        {/* Form card — stretches to fill all remaining height */}
        <div className="mx-auto  mt-8 w-full max-w-2xl flex flex-col flex-1 min-h-screen overflow-y-auto rounded-2xl bg-[#E8E8E8] shadow-sm">

          {/* Green header — sticky, never scrolls */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#205B3A] to-[#43C17A] px-8 py-8 text-white flex-shrink-0">
            {/* Large circle — top-right, partially clipped */}
            <div
              className="pointer-events-none absolute rounded-full bg-white/25"
              style={{ width: 150, height: 150, right: -25, top: -55 }}
            />
            {/* Small circle — clearly separated, bottom-right, no overlap */}
            <div
              className="pointer-events-none absolute rounded-full bg-white/20"
              style={{ width: 80, height: 80, right: 75, bottom: -40 }}
            />
            <h1 className="relative z-10 text-xl font-bold">Raise Well being Issue</h1>
            <p className="relative z-10 mt-2 max-w-md text-sm leading-snug text-white/90">
              Fill in the details below. Every submission is tracked and resolved
              transparently.
            </p>
          </div>

          {/* Scrollable form body — fills remaining card height */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <Field label="Full Name">
                <input
                  value="Stephen Jones"
                  readOnly
                  className="h-10 w-full rounded border border-[#D0D0D0] bg-transparent px-4 text-sm text-[#555555] outline-none"
                />
              </Field>

              <Field label="Email address">
                <input
                  value="Stephen Jones@gmail.com"
                  readOnly
                  className="h-10 w-full rounded border border-[#D0D0D0] bg-transparent px-4 text-sm text-[#555555] outline-none"
                />
              </Field>

              <Field label="Role">
                <input
                  value="Finance Manager"
                  readOnly
                  className="h-10 w-full rounded border border-[#D0D0D0] bg-transparent px-4 text-sm text-[#555555] outline-none"
                />
              </Field>

              <Field label="Category">
                <SelectField options={wellbeingCategories} />
              </Field>

              <Field label="Sub Category">
                <SelectField options={wellbeingSubCategories} />
              </Field>

              <Field label="Issue Visibility">
                <div className="grid grid-cols-2 gap-2">
                  {["Executive", "Manager"].map((visibility) => (
                    <button
                      key={visibility}
                      type="button"
                      className="flex h-10 items-center justify-center gap-2 rounded border border-[#D0D0D0] text-sm text-[#555555]"
                    >
                      <CheckCircle size={16} />
                      {visibility}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="col-span-2">
                <Field label="Description">
                  <textarea
                    placeholder="Describe you issue in detail................"
                    className="h-32 w-full resize-none rounded border border-[#D0D0D0] bg-transparent px-4 py-3 text-sm text-[#555555] outline-none placeholder:text-[#8A8A8A]"
                  />
                </Field>
              </div>

              <div className="col-span-2">
                <Field label="Attachments">
                  <div className="flex min-h-32 flex-col items-center justify-center rounded border border-dashed border-[#43C17A] bg-transparent px-4 py-6 text-center">
                    <UploadSimple size={46} className="text-[#8A8A8A]" />
                    <p className="mt-2 text-sm text-[#8A8A8A]">
                      Drag & Drop Your File here or
                    </p>
                    <button
                      type="button"
                      className="mt-2 rounded bg-[#43C17A] px-4 py-1.5 text-xs font-semibold text-white"
                    >
                      Browse Files
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-3 rounded bg-[#DFF0FF] px-4 py-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-[#46A5EA] text-white">
                <Clock size={22} />
              </div>
              <p className="text-xs font-semibold leading-snug text-[#0585D9]">
                Our team will review your complaint and respond within 24-48
                hours.
              </p>
            </div>

            <div className="mt-6 mb-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-12 rounded-md bg-[#E2E2E2] text-base font-semibold text-[#282828]"
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-12 rounded-md bg-[#16284F] text-base font-semibold text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#282828]">
        {label}
      </span>
      {children}
    </label>
  );
}

function SelectField({ options }: { options: string[] }) {
  return (
    <div className="relative">
      <select className="h-10 w-full appearance-none rounded border border-[#D0D0D0] bg-transparent px-4 pr-10 text-sm text-[#555555] outline-none">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <CaretDown
        size={18}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#282828]"
      />
    </div>
  );
}