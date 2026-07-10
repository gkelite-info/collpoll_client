import { Money } from "@phosphor-icons/react";
import { Download, ListFilter } from "lucide-react";
import { reimbursementStats, requests } from "./data";
import RequestStatus from "./RequestStatus";
import StatCard from "./StatCard";

type ReimbursementsListProps = {
  onCreate: () => void;
  onViewDetails: () => void;
};

export default function ReimbursementsList({
  onCreate,
  onViewDetails,
}: ReimbursementsListProps) {
  return (
    <div className="w-full text-left">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#14213A]">
            Reimbursements
          </h1>
          <p className="mt-1 text-[14px] text-[#4C5565]">
            Manage and track your expense claims
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex cursor-pointer h-[42px] items-center gap-2 rounded-[6px] bg-[#007A3D] px-4 text-[13px] font-bold text-white hover:bg-[#006B35]"
        >
          <Money size={16} weight="regular" />
          New Reimbursement
        </button>
      </div>

      <div className="mb-5 w-full overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4">
          {reimbursementStats.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-[10px] bg-white shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-[20px] font-bold text-[#14213A]">
            Recent Requests
          </h2>
          <div className="flex items-center gap-4 text-[#3E4A59]">
            <button className="cursor-pointer" type="button" aria-label="Filter requests">
              <ListFilter size={18} />
            </button>
            <button className="cursor-pointer" type="button" aria-label="Download requests">
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse">
            <thead className="bg-[#F8FAFC]">
              <tr>
                {[
                  "REQUEST ID",
                  "EXPENSE TITLE",
                  "CATEGORY",
                  "AMOUNT",
                  "SUBMITTED DATE",
                  "STATUS",
                  "ACTION",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-8 py-4 text-left text-[12px] font-semibold text-[#4C5565]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-[#E7EDF5] last:border-b-0"
                >
                  <td className="whitespace-nowrap px-8 py-5 text-[14px] font-bold text-[#14213A]">
                    {request.id}
                  </td>
                  <td className="whitespace-nowrap px-8 py-5 text-[14px] font-semibold text-[#14213A]">
                    {request.title}
                  </td>
                  <td className="whitespace-nowrap px-8 py-5">
                    <span className="rounded-full bg-[#E8EEF8] px-3 py-1 text-[12px] font-medium text-[#4C5565]">
                      {request.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-8 py-5 text-[14px] font-semibold text-[#14213A]">
                    {request.amount}
                  </td>
                  <td className="whitespace-nowrap px-8 py-5 text-[14px] text-[#3E4A59]">
                    {request.submittedDate}
                  </td>
                  <td className="whitespace-nowrap px-8 py-5">
                    <RequestStatus status={request.status} />
                  </td>
                  <td className="whitespace-nowrap px-8 py-5">
                    <button
                      type="button"
                      onClick={onViewDetails}
                      className="cursor-pointer text-[13px] font-bold text-[#16284F] hover:text-[#007A3D]"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-[12px] text-[#4C5565]">
          <span>Showing 4 of 24 entries</span>
          <div className="flex items-center gap-2">
            <button className="cursor-pointer rounded-[4px] border border-[#C9D3DD] px-3 py-1.5">
              Previous
            </button>
            <button className="cursor-pointer rounded-[4px] bg-[#007A3D] px-3 py-1.5 font-bold text-white">
              1
            </button>
            <button className="cursor-pointer rounded-[4px] border border-[#C9D3DD] px-3 py-1.5">
              2
            </button>
            <button className="cursor-pointer rounded-[4px] border border-[#C9D3DD] px-3 py-1.5">
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
