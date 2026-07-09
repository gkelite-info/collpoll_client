"use client";

import { useEffect, useState } from "react";
import { X, FileText, CheckCircle, XCircle } from "@phosphor-icons/react";
import { getTaxDeclarationById } from "@/lib/helpers/Hr/payroll/taxDeclarationAPI";
import toast from "react-hot-toast";
import { TaxDeclarationModalShimmer } from "./TaxDeclarationModalShimmer";

interface TaxDeclarationModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxDeclarationId: number | null;
  userId: number;
  userName: string;
}

export default function TaxDeclarationModal({ isOpen, onClose, taxDeclarationId, userId, userName }: TaxDeclarationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (!taxDeclarationId) {
      setData(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    async function fetchDetails() {
      try {
        const details = await getTaxDeclarationById(taxDeclarationId!);
        if (isMounted) setData(details);
      } catch (error) {
        toast.error("Unable to load declaration details.", { id: "tax-details-error" });
        if (isMounted) onClose();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchDetails();
    return () => { isMounted = false; };
  }, [isOpen, taxDeclarationId, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden mx-2 sm:mx-0">
        {/* Header */}
        <div className="flex flex-row items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F8EF]">
              <FileText size={18} weight="bold" className="text-[#43C17A] sm:w-[20px] sm:h-[20px]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">Tax Declaration Review</h2>
              <p className="text-xs text-gray-500 truncate">{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer shrink-0 rounded-full p-1.5 sm:p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} weight="bold" className="sm:w-[20px] sm:h-[20px]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {isLoading ? (
            <TaxDeclarationModalShimmer />
          ) : !data ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-50 flex items-center justify-center mb-3 sm:mb-4">
                <FileText size={24} className="text-gray-400 sm:w-[32px] sm:h-[32px]" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">No Declaration Submitted</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 max-w-sm px-4">
                This employee has not submitted their tax declaration for the current financial year yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                  <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Regime</span>
                  <p className="mt-1 text-base sm:text-lg font-bold text-gray-900 capitalize">{data.taxRegime}</p>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                  <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Declared</span>
                  <p className="mt-1 text-base sm:text-lg font-bold text-gray-900">₹{Number(data.totalDeclared || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-100">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-800">Declaration Details</h4>
                </div>
                <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
                  {data.declarations && Object.keys(data.declarations).length > 0 ? (
                    Object.entries(data.declarations).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-50 last:border-0">
                        <span className="text-xs sm:text-sm text-gray-600 capitalize break-words pr-2">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 shrink-0">₹{Number(value).toLocaleString('en-IN')}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 text-center py-2">No detailed breakdown provided.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {data && data.proofStatus === "pending" && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
            <button className="cursor-pointer flex items-center justify-center gap-2 rounded-lg bg-white border border-red-200 px-4 py-2 sm:px-5 sm:py-2 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50 w-full sm:w-auto">
              <XCircle size={18} weight="bold" />
              Reject
            </button>
            <button className="cursor-pointer flex items-center justify-center gap-2 rounded-lg bg-[#43C17A] px-4 py-2 sm:px-5 sm:py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#38A166] w-full sm:w-auto">
              <CheckCircle size={18} weight="bold" />
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
