import React from "react";

export const ShimmerCard = ({ height = "h-[100px]" }: { height?: string }) => (
  <div className={`w-full ${height} bg-gray-100 rounded-xl animate-pulse relative overflow-hidden`}>
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-[shimmer_1.5s_infinite]"></div>
  </div>
);

export const ShimmerBlock = () => (
  <div className="absolute inset-0 bg-white z-10 p-4 flex flex-col gap-3 animate-pulse rounded-xl">
    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mt-auto"></div>
  </div>
);

export const ShimmerTableRow = () => (
  <div className="w-full flex justify-between p-4 border-b border-gray-100 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
  </div>
);

export const StatCardShimmer = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    <div className="h-7 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export const TableRowShimmer = ({ columns = 5 }: { columns?: number }) => (
  <tr className="w-full border-b border-gray-100 animate-pulse">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-5 whitespace-nowrap">
        <div className={`h-4 bg-gray-200 rounded ${i === 0 ? 'w-3/4' : 'w-1/2'}`}></div>
        {i === 0 && <div className="h-3 bg-gray-100 rounded w-1/2 mt-2"></div>}
      </td>
    ))}
  </tr>
);

export const PaySlipShimmer = () => (
  <div className="bg-white rounded-xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 animate-pulse relative overflow-hidden">
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white via-gray-50 to-white animate-[shimmer_1.5s_infinite]"></div>
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
      <div className="flex items-center">
        <div className="w-[100px] h-4 bg-gray-200 rounded mr-2"></div>
        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
      </div>
      <div className="flex items-center">
        <div className="w-[100px] h-4 bg-gray-200 rounded mr-2"></div>
        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
      </div>
      <div className="flex items-center">
        <div className="w-[100px] h-4 bg-gray-200 rounded mr-2"></div>
        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
      </div>
      <div className="flex items-center">
        <div className="w-[100px] h-4 bg-gray-200 rounded mr-2"></div>
        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
      </div>
    </div>
  </div>
);

export const ModalDetailShimmer = ({ variant = "default" }: { variant?: "default" | "payslip" }) => {
  if (variant === "payslip") {
    return (
      <div className="overflow-x-auto w-full">
        <div className="max-w-3xl mx-auto bg-white p-4 w-[850px] min-w-[850px] animate-pulse">
          <div className="border-2 border-gray-200 border-solid">
            <div className="flex border-b-2 border-solid border-gray-200 p-4 items-center justify-center min-h-[120px] relative">
              <div className="absolute left-6 w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="flex flex-col items-center gap-2">
                 <div className="w-64 h-6 bg-gray-200 rounded"></div>
                 <div className="w-48 h-4 bg-gray-200 rounded"></div>
                 <div className="w-56 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 p-4 gap-y-4 border-b-2 border-solid border-gray-200">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                   <div className="w-32 h-4 bg-gray-200 rounded"></div>
                   <div className="w-40 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="w-full h-6 bg-gray-200 rounded"></div>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-full h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-pulse p-4">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="flex flex-col gap-2">
          <div className="h-5 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-100 rounded w-32"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 bg-[#f8f9fa] rounded-xl border border-gray-100 p-3 flex flex-col justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-16 bg-[#f8f9fa] rounded-xl border border-gray-100 p-3 flex flex-col justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-[120px] bg-[#f8f9fa] rounded-xl border border-gray-100 p-3 col-span-2 flex flex-col gap-3">
          <div className="h-3 bg-gray-200 rounded w-1/4 mb-1"></div>
          <div className="w-full flex justify-between">
            <div className="h-3 bg-gray-100 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="w-full flex justify-between">
            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="w-full flex justify-between">
            <div className="h-3 bg-gray-100 rounded w-1/5"></div>
            <div className="h-3 bg-gray-200 rounded w-8"></div>
          </div>
        </div>
        <div className="h-16 bg-[#f8f9fa] rounded-xl border border-gray-100 p-3 flex flex-col justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-16 bg-[#f8f9fa] rounded-xl border border-gray-100 p-3 flex flex-col justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="flex flex-col gap-3 mt-2">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="w-full flex justify-between">
          <div className="h-4 bg-gray-100 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="w-full flex justify-between">
          <div className="h-4 bg-gray-100 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="w-full flex justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          <div className="h-5 bg-gray-300 rounded w-1/5"></div>
        </div>
      </div>
    </div>
  );
};
