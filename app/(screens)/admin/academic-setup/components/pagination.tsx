"use client";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  roundedBottom?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  roundedBottom
}: PaginationProps) {
  if (totalItems <= itemsPerPage) return null;

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
    <div className={`flex items-center justify-between px-2 py-4 sm:px-4 bg-white border-t border-gray-200 mt-auto ${roundedBottom || ""}`}>
      <div className="flex flex-col gap-4 w-full md:flex-row md:items-center md:justify-between">
        <div className="flex justify-center md:justify-start w-full md:w-auto shrink-0">
          <p className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
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
              disabled={currentPage === 1}
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
              disabled={currentPage === 1}
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
              disabled={currentPage === totalPages}
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
              disabled={currentPage === totalPages}
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
