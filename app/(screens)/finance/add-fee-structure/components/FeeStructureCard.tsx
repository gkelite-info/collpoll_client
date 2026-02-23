"use client";

import { downloadFeePdf } from "@/lib/helpers/finance/downloadFeePdf";
import { CaretDown, DownloadSimple, Pencil } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface FeeStructureCardProps {
  structures: any[];
  collegeName?: string;
}

export default function FeeStructureCard({
  structures,
  collegeName = "ABC Institute",
}: FeeStructureCardProps) {
  const router = useRouter();

  const [selectedId, setSelectedId] = useState(structures[0]?.feeStructureId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getSessionLabel = (struct: any) => {
    return (
      struct.sessionName ||
      struct.college_session?.sessionName ||
      "Unknown Session"
    );
  };

  const currentData = useMemo(
    () =>
      structures.find((s) => s.feeStructureId === selectedId) || structures[0],
    [structures, selectedId],
  );

  const sortedSessions = useMemo(() => {
    return [...structures].sort((a, b) =>
      getSessionLabel(a).localeCompare(getSessionLabel(b)),
    );
  }, [structures]);

  const { gstPercent, displayTotal } = useMemo(() => {
    if (!currentData || !currentData.components)
      return { gstPercent: 0, displayTotal: 0 };

    const gstComp = currentData.components.find(
      (c: any) => c.label.toUpperCase() === "GST",
    );
    const gstAmount = gstComp ? Number(gstComp.amount) : 0;
    const total = Number(currentData.totalAmount);
    const subTotal = total - gstAmount;

    const percent = subTotal > 0 ? Math.round((gstAmount / subTotal) * 100) : 0;

    return { gstPercent: percent, displayTotal: total };
  }, [currentData]);

  const handleEdit = () => {
    const params = new URLSearchParams();
    params.set("fee", "create-fee");
    params.set("edit", "true");
    params.set("id", currentData.feeStructureId);
    params.set("branchId", currentData.collegeBranchId);
    if (currentData.sessionId || currentData.collegeSessionId) {
      params.set(
        "sessionId",
        currentData.sessionId || currentData.collegeSessionId,
      );
    }
    router.push(`?${params.toString()}`);
  };

  const formatCurrency = (amount: any) =>
    "₹ " + Number(amount).toLocaleString("en-IN");

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  const handleDownload = () => {
    downloadFeePdf(
      { ...currentData, calculatedGstPercent: gstPercent },
      collegeName,
    );
  };

  if (!currentData) return null;

  return (
    <div className="w-full border-2 rounded-lg bg-white overflow-hidden mb-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="bg-[#EBFFF4] px-8 pt-4 pb-5 rounded-t-lg h-[100px] w-full">
          <div className="flex justify-between ">
            <div className="flex flex-col justify-between flex-1">
              <div className="flex items-start">
                <div className="w-[13%]">
                  <div className="w-[40px] h-[40px] rounded-full overflow-hidden bg-white flex items-center justify-center shadow-sm">
                    <img
                      src="/logo.png"
                      alt="Logo"
                      className="w-[30px] h-[30px] object-contain"
                    />
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-[#282828]">
                  {collegeName}
                </h2>
              </div>
              <p className="text-sm font-medium ml-[13%] text-[#555]">
                Duration: 4 Years (8 Semesters)
              </p>
            </div>

            <div className="flex flex-col justify-between flex-1">
              <div className="flex flex-col justify-between h-full">
                <h3 className="text-lg font-semibold text-[#282828]">
                  Academic Session: {getSessionLabel(currentData)}
                </h3>
                <p className="text-lg text-[#282828]">
                  Branch : {currentData.branchName}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-between items-end relative">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 bg-[#1F2F56] text-white text-sm px-3 py-1 rounded-md hover:bg-[#2a3f70] transition-colors"
                >
                  {getSessionLabel(currentData)}
                  <CaretDown size={14} />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20 overflow-hidden">
                      {sortedSessions.map((struct) => (
                        <button
                          key={struct.feeStructureId}
                          onClick={() => {
                            setSelectedId(struct.feeStructureId);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 
                              ${
                                selectedId === struct.feeStructureId
                                  ? "font-bold text-[#43C17A] bg-green-50"
                                  : "text-gray-700"
                              }
                          `}
                        >
                          {getSessionLabel(struct)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full bg-[#43C17A] text-white hover:bg-[#36a165] transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={handleDownload}
                  className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full bg-[#43C17A] text-white hover:bg-[#36a165] transition-colors"
                >
                  <DownloadSimple size={16} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <h4 className="text-lg font-semibold text-[#1F2F56] mb-4">
          {getSessionLabel(currentData)} Fee Breakdown
        </h4>

        <div className="space-y-3 text-base text-[#282828]">
          {currentData.components.length > 0 ? (
            currentData.components.map((comp: any, index: number) => (
              <div
                key={index}
                className="flex justify-between border-b border-gray-50 pb-1 last:border-0"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[18px] text-[#1F2F56] leading-none">
                    •
                  </span>
                  {comp.label}
                </span>
                <span className="font-medium">
                  {formatCurrency(comp.amount)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic text-sm">
              No fee components added.
            </p>
          )}
        </div>

        <div className="border-t my-4 border-gray-200"></div>

        <div className="space-y-2 text-[14px]">
          <div className="flex justify-between items-center">
            <div className="font-bold text-[#1F2F56] text-lg">
              Total Fee : {formatCurrency(displayTotal)}
            </div>
            {gstPercent > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Includes {gstPercent}% GST
              </span>
            )}
          </div>

          <div className="text-base text-[#282828] mt-2">
            <span className="font-medium">Due Date:</span>{" "}
            {formatDate(currentData.dueDate)}
          </div>

          <div className="flex justify-between items-center text-base text-[#282828] mt-1">
            <span>
              <span className="font-medium">Late Fee:</span> ₹
              {currentData.lateFeePerDay} / Day
            </span>
            <span className="text-gray-500 text-sm">
              Finance Office - {collegeName}
            </span>
          </div>

          {currentData.remarks && (
            <div className="mt-2 text-sm text-gray-500 italic bg-gray-50 p-2 rounded">
              Remarks: "{currentData.remarks}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
