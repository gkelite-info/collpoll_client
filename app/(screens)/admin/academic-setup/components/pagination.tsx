"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CaretDown, Check } from "@phosphor-icons/react";
interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  roundedBottom?: string;
  itemsPerPageOptions?: number[];
  onItemsPerPageChange?: (items: number) => void;
  disabled?: boolean;
  alwaysShow?: boolean;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  roundedBottom,
  itemsPerPageOptions,
  onItemsPerPageChange,
  disabled,
  alwaysShow
}: PaginationProps) {
  if (totalItems <= itemsPerPage && !alwaysShow) return null;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const visiblePages = getPageNumbers();

  return (
    <div className={`flex items-center justify-between px-2 py-4 sm:px-4 bg-white border-t border-gray-200 mt-auto w-full ${roundedBottom || ""} ${disabled ? "opacity-50 pointer-events-none" : "transition-opacity duration-200"}`}>
      <div className="flex flex-col gap-4 w-full md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 md:gap-6 w-full md:w-auto shrink-0">
          {itemsPerPageOptions && onItemsPerPageChange && (
            <div className="flex items-center gap-2 relative z-50">
              <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">Items per page:</span>
              <div className="relative w-20">
                <Listbox value={itemsPerPage} onChange={onItemsPerPageChange} disabled={disabled}>
                  {({ open }) => (
                    <>
                      <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-1.5 pl-3 pr-8 text-left border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm">
                        <span className="block truncate text-gray-700 font-medium">{itemsPerPage}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                          <CaretDown
                            size={14}
                            weight="bold"
                            className={`transition-transform duration-200 ${open ? "rotate-180 text-green-500" : ""}`}
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute bottom-full mb-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-[100]">
                          {itemsPerPageOptions.map((option) => (
                            <Listbox.Option
                              key={option}
                              className={({ active, selected }) =>
                                `relative cursor-pointer select-none py-2 px-3 ${
                                  selected
                                    ? "bg-green-100 text-green-800 font-bold"
                                    : active
                                    ? "bg-green-50 text-green-900"
                                    : "text-gray-900"
                                }`
                              }
                              value={option}
                            >
                              {({ selected }) => (
                                <span
                                  className={`block truncate ${
                                    selected ? "font-bold text-green-700" : "font-normal"
                                  }`}
                                >
                                  {option}
                                </span>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </>
                  )}
                </Listbox>
              </div>
            </div>
          )}
          <p className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
            Showing <span className="font-medium">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="font-medium">{endIndex}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div className="flex justify-center w-full md:w-auto overflow-x-auto max-w-full pb-1 lg:pb-0">
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm min-w-max"
            aria-label="Pagination"
          >
            {/* First Page */}
            <button
              onClick={() => onPageChange(1)}
              disabled={disabled || currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-1.5 sm:px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="sr-only">First</span>
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M15.79 14.77a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L11.832 10l3.938 3.71a.75.75 0 01.02 1.06zm-6 0a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L5.832 10l3.938 3.71a.75.75 0 01.02 1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Previous Page */}
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={disabled || currentPage === 1}
              className="relative inline-flex items-center px-1.5 sm:px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Pages */}
            {visiblePages.map((page, index) => {
              const isCurrent = currentPage === page;
              const isEllipsis = page === "...";

              if (isEllipsis) {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-1.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  disabled={disabled}
                  className={`relative inline-flex items-center px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold focus:z-20 cursor-pointer ${
                    isCurrent
                      ? "z-10 bg-[#16284F] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43C17A]"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={disabled || currentPage === totalPages}
              className="relative inline-flex items-center px-1.5 sm:px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="sr-only">Next</span>
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Last Page */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={disabled || currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-1.5 sm:px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="sr-only">Last</span>
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.21 5.23a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08L8.168 10 4.23 6.29a.75.75 0 01-.02-1.06zm6 0a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08L14.168 10 10.23 6.29a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
