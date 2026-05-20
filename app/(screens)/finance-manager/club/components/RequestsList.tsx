"use client";

import { Avatar } from "@/app/utils/Avatar";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { requestsData } from "../data";

export default function RequestsList({ currentFilter }: { currentFilter: string }) {
  const [searchInput, setSearchInput] = useState("");

  const requests = useMemo(() => {
    const filtered =
      currentFilter === "all"
        ? requestsData
        : requestsData.filter((request) => request.status === currentFilter);
    const search = searchInput.trim().toLowerCase();

    if (!search) return filtered;

    return filtered.filter((request) =>
      `${request.name} ${request.details}`.toLowerCase().includes(search),
    );
  }, [currentFilter, searchInput]);

  return (
    <div className="mt-8 flex min-h-[600px] flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3">
          {["all", "pending", "accepted"].map((filter) => (
            <Link
              key={filter}
              scroll={false}
              href={`?tab=requests&filter=${filter}`}
              className={`rounded-full px-6 py-2 text-sm font-semibold capitalize transition-all ${
                currentFilter === filter
                  ? "bg-[#16284F] text-white"
                  : "bg-[#E7E7E7] text-[#000000]"
              }`}
            >
              {filter}
            </Link>
          ))}
        </div>

        <div className="flex w-full max-w-sm items-center rounded-full bg-[#EAEAEA] px-4 py-2.5 transition-shadow focus-within:ring-2 focus-within:ring-[#98eabc]">
          <input
            type="text"
            placeholder="Search Club Member....."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="w-full bg-transparent text-sm text-[#282828] placeholder:text-gray-500 focus:outline-none"
          />
          <MagnifyingGlassIcon size={26} className="text-[#43C17A]" />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500">
          {requests.length}{" "}
          {currentFilter === "all"
            ? "Total"
            : currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}{" "}
          Requests
        </h3>
      </div>

      {requests.length > 0 ? (
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-lg border border-gray-50 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <Avatar src={request.avatar} alt={request.name} size={40} />
                <div>
                  <h4 className="font-bold text-gray-900">{request.name}</h4>
                  <p className="text-xs text-gray-500">{request.details}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {request.status === "pending" ? (
                  <>
                    <button className="rounded-md bg-[#FF2A2A] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600">
                      Reject
                    </button>
                    <button className="rounded-md bg-[#43C17A] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-500">
                      Accept
                    </button>
                  </>
                ) : (
                  <button className="rounded-md bg-[#16284F] px-5 py-2 text-sm font-semibold text-white hover:bg-opacity-90">
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500">
          No requests found {searchInput ? "matching your search" : "in this category"}.
        </div>
      )}
    </div>
  );
}
