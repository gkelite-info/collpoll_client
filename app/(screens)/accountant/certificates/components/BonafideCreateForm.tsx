import { CalendarBlank, CaretDown, CaretLeft } from "@phosphor-icons/react";

const inputClass =
  "h-10 rounded-md border border-[#D7DEE8] bg-white px-3 text-[13px] font-medium text-[#303642] outline-none placeholder:text-[#8A96A8]";

const fieldLabelClass = "text-[12px] font-bold text-[#303642]";

function RequiredMark() {
  return <span className="text-[#EF4444]">*</span>;
}

function TextField({
  label,
  value,
  placeholder,
  required,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={fieldLabelClass}>
        {label} {required && <RequiredMark />}
      </span>
      <input
        readOnly={Boolean(value)}
        defaultValue={value}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  required,
}: {
  label: string;
  value: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={fieldLabelClass}>
        {label} {required && <RequiredMark />}
      </span>
      <button
        type="button"
        className={`${inputClass} flex cursor-pointer items-center justify-between text-left`}
      >
        {value}
        <CaretDown size={14} weight="bold" className="text-[#7B8AA3]" />
      </button>
    </label>
  );
}

export function BonafideCreateForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="rounded-lg bg-white px-4 py-5 shadow-sm">
      <button
        type="button"
        onClick={onCancel}
        aria-label="Back to bonafide certificates"
        className="mb-5 flex h-9 w-9 cursor-pointer items-center justify-center text-[#17213D] transition-colors hover:text-[#43C17A]"
      >
        <CaretLeft size={20} weight="bold" />
      </button>

      <section>
        <h2 className="text-[15px] font-bold text-[#17213D]">
          1. Search Student
        </h2>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_1fr_200px]">
          <SelectField label="Graduation" value="Select Graduation" required />
          <SelectField label="Academic Year" value="2024 - 2025" required />
          <TextField
            label="Hall Ticket No."
            placeholder="Enter Hall Ticket No."
            required
          />
          <div className="flex flex-col justify-end">
            <button
              type="button"
              className="h-10 cursor-pointer rounded-md bg-[#43C17A] text-[13px] font-bold text-white"
            >
              Get Details
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-[#E7ECF3] bg-[#FBFCFE] p-5">
        <h2 className="text-[15px] font-bold text-[#17213D]">
          2. Student Details{" "}
          <span className="text-[11px] font-medium text-[#596579]">
            (Auto Fetched)
          </span>
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <TextField label="Roll No." value="23CS1056" />
          <TextField label="Student Name" value="Arun Kumar" />
          <TextField label="Father Name" value="Suresh Kumar" />
          <TextField label="Course" value="B.Tech" />
          <TextField label="Sub Course" value="Computer Science and Engineering" />
          <TextField label="Course Year" value="III Year" />
          <TextField label="Academic Year" value="2024 - 2025" />
          <TextField label="Batch Code" value="CS23A" />
        </div>
      </section>

      <section className="mt-5">
        <h2 className="text-[15px] font-bold text-[#17213D]">
          3. Bonafide Details
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <TextField
            label="Bonafide No."
            placeholder="Enter Bonafide No."
            required
          />
          <label className="flex flex-col gap-2">
            <span className={fieldLabelClass}>
              Date <RequiredMark />
            </span>
            <button
              type="button"
              className={`${inputClass} flex cursor-pointer items-center gap-2 text-left`}
            >
              <CalendarBlank size={15} weight="regular" />
              20 May 2025
            </button>
          </label>
          <SelectField label="Purpose" value="Select Purpose" required />
          <SelectField label="Student Type" value="Select Student Type" required />
          <SelectField label="Conduct" value="Select Conduct" required />
        </div>
      </section>

      <div className="mt-10 flex justify-end gap-3 border-t border-[#E7ECF3] pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 cursor-pointer rounded-md border border-[#303642] px-8 text-[14px] font-bold text-[#303642]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="h-10 cursor-pointer rounded-md bg-[#16284F] px-10 text-[14px] font-bold text-white"
        >
          Save
        </button>
      </div>
    </div>
  );
}
