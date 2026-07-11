import {
  Building2,
  ChevronLeft,
  CloudUpload,
  FileText,
  ReceiptText,
} from "lucide-react";
import Field from "./Field";
import FormCard from "./FormCard";

type SubmitReimbursementProps = {
  onBack: () => void;
};

export default function SubmitReimbursement({
  onBack,
}: SubmitReimbursementProps) {
  return (
    <div className="w-full rounded-[12px] bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="mb-7 flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="mt-[6px] shrink-0 cursor-pointer text-[#4C5565] transition-colors hover:text-[#14213A]"
          aria-label="Back"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-[28px] font-bold text-[#14213A]">
            Submit Reimbursement
          </h1>
          <p className="mt-1 text-[15px] text-[#4C5565]">
            Fill in the details below to request a refund for your business
            expenses.
          </p>
        </div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <FormCard icon={ReceiptText} title="Expense Information">
            <label className="mb-4 block">
              <span className="mb-2 block text-[12px] font-semibold tracking-wide text-[#4A5565]">
                Expense Title
              </span>
              <input
                className="h-11 w-full rounded-[7px] border border-[#BFD0C2] px-3 text-[14px] text-[#14213A] placeholder-[#9CA3AF] outline-none focus:border-[#43C17A]"
                placeholder="e.g., Clien t Lunch at Bistro"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Expense Category" as="select">
                <option>Travel & Commute</option>
                <option>Meals</option>
                <option>Office</option>
                <option>Software</option>
                <option>Other</option>
              </Field>
              <Field label="Expense Date" placeholder="mm/dd/yyyy" />
              <Field label="Amount" placeholder="₹  0.00" />
            </div>
          </FormCard>

          <FormCard icon={FileText} title="Description">
            <textarea
              className="min-h-[110px] w-full resize-none rounded-[7px] border border-[#BFD0C2] p-3 text-[14px] text-[#14213A] placeholder-[#9CA3AF] outline-none focus:border-[#43C17A]"
              placeholder="Briefly describe the purpose of this expense..."
            />
          </FormCard>
        </div>

        <div className="space-y-5">
          <FormCard
            icon={CloudUpload}
            title="Attachments"
            action={
              <span className="rounded bg-[#EEF4FF] px-2 py-1 text-[11px] font-bold text-[#6B7B93]">
                Max 5MB per file
              </span>
            }
          >
            <div className="flex items-center gap-4 rounded-[7px] border border-dashed border-[#BFD0C2] bg-[#FBFEFC] p-4">
              <span className="grid h-12 w-12 place-items-center rounded-[8px] bg-[#E5F0FF] text-[#14213A]">
                <ReceiptText size={20} />
              </span>
              <div>
                <p className="text-[13px] font-medium text-[#14213A]">
                  Upload Receipt
                </p>
                <p className="text-[12px] text-[#4C5565]">
                  Drag and drop or click to browse
                </p>
              </div>
            </div>
          </FormCard>

          <FormCard icon={Building2} title="Payment Details">
            <Field label="Bank Name" placeholder="Bank of Baroda" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Account Number"
                placeholder="XXXX  XXXX  XXXX  4521"
              />
              <Field label="IFSC Code" placeholder="GTB0000123" />
            </div>
          </FormCard>
        </div>
      </div>
    </div>
  );
}
