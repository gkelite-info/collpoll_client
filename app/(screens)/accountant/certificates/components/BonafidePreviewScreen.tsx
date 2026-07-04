import { DownloadSimple, X } from "@phosphor-icons/react";

const studentDetails = [
  ["Roll No.", "23CS1056"],
  ["Student Name", "Arun Kumar"],
  ["Father Name", "Suresh Kumar"],
  ["Course", "B.Tech"],
  ["Sub Course", "Computer Science and Engineering"],
  ["Course Year", "III Year"],
  ["Academic Year", "2024 - 2025"],
  ["Batch Code", "CS23A"],
];

const bonafideDetails = [
  ["Bonafide No.", "BON/24-25/0001"],
  ["Date", "20 May 2025"],
  ["Purpose", "Higher Studies"],
  ["Student Type", "Regular"],
  ["Conduct", "Good"],
];

function DetailsCard({
  title,
  rows,
}: {
  title: string;
  rows: string[][];
}) {
  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white p-5">
      <h3 className="text-[14px] font-bold uppercase text-[#17213D]">{title}</h3>
      <div className="mt-4 flex flex-col gap-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-5">
            <span className="text-[11px] font-medium text-[#7B8AA3]">{label}</span>
            <span className="max-w-[130px] text-right text-[11px] font-bold text-[#17213D]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BonafidePreviewScreen({
  onBackToEdit,
  onCancel,
}: {
  onBackToEdit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
      <header className="flex items-start justify-between border-b border-[#E7ECF3] px-7 py-5">
        <div>
          <h1 className="text-[18px] font-bold text-[#17213D]">
            Preview Bonafide Certificate
          </h1>
          <p className="mt-1 text-[12px] font-medium text-[#7B8AA3]">
            Please verify the details below. You can download the certificate.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close preview"
          onClick={onCancel}
          className="cursor-pointer text-[#7B8AA3] hover:text-[#17213D]"
        >
          <X size={22} weight="regular" />
        </button>
      </header>

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-md border border-[#DDE4EE] bg-white p-7">
          <div className="mx-auto min-h-[540px] max-w-[620px] border border-[#242424] p-0.5 text-[#111827]">
            <div className="min-h-[530px] border-[3px] border-[#242424] p-8">
            <h2 className="text-center text-[28px] font-bold tracking-[0.04em]">
              BONAFIDE CERTIFICATE
            </h2>

            <div className="mt-12 space-y-5 text-[13px] leading-7">
              <p>
                This is to certify that Mr./Miss.{" "}
                <span className="inline-block min-w-[150px] border-b border-[#242424] px-3 text-center">
                  Arun Kumar
                </span>{" "}
                S/o or D/o of Mr./Mrs.{" "}
                <span className="inline-block min-w-[150px] border-b border-[#242424] px-3 text-center">
                  Suresh Kumar
                </span>
              </p>
              <p>
                bearing roll no{" "}
                <span className="inline-block min-w-[120px] border-b border-[#242424] px-3 text-center">
                  23CS1056
                </span>{" "}
                and admission no{" "}
                <span className="inline-block min-w-[120px] border-b border-[#242424] px-3 text-center">
                  AD-2023-0012
                </span>
              </p>
              <p>
                is a bonafide student of this school/college/institution and studied in Class{" "}
                <span className="inline-block min-w-[110px] border-b border-[#242424] px-3 text-center">
                  B.Tech
                </span>
              </p>
              <p>
                during the financial year{" "}
                <span className="inline-block min-w-[110px] border-b border-[#242424] px-3 text-center">
                  2024-2025
                </span>{" "}
                studying{" "}
                <span className="inline-block min-w-[110px] border-b border-[#242424] px-3 text-center">
                  III Year
                </span>{" "}
                course
              </p>
              <p>
                for the academic year{" "}
                <span className="inline-block min-w-[110px] border-b border-[#242424] px-3 text-center">
                  2024-2025
                </span>
                .
              </p>
            </div>

            <div className="mt-12 text-[13px] leading-7">
              <p>Dated: 20 May 2025</p>
              <p>Place: City Campus</p>
            </div>

            <div className="mt-6 text-right text-[12px] font-bold">
              <p>Signature Head of the</p>
              <p>Institution/School</p>
              <p className="mt-1 text-[10px] font-medium">(with Stamp)</p>
            </div>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-5">
          <DetailsCard title="Student Details" rows={studentDetails} />
          <DetailsCard title="Bonafide Details" rows={bonafideDetails} />
        </aside>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E7ECF3] px-6 py-5">
        <button
          type="button"
          onClick={onBackToEdit}
          className="h-10 cursor-pointer rounded-md border border-[#43C17A] px-5 text-[13px] font-bold text-[#43C17A]"
        >
          Back to Edit
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 cursor-pointer rounded-md border border-[#DDE4EE] px-7 text-[13px] font-bold text-[#17213D]"
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#43C17A] px-7 text-[13px] font-bold text-white"
          >
            <DownloadSimple size={16} weight="bold" />
            Download PDF
          </button>
        </div>
      </footer>
    </div>
  );
}
