// --- File: components/ui/Pagination.jsx ---
import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Always show at least one page
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.max(1, Math.min(currentPage, safeTotalPages));
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // how many pages to show around current
    const range = [];

    for (let i = Math.max(2, safeCurrentPage - delta); i <= Math.min(safeTotalPages - 1, safeCurrentPage + delta); i++) {
      range.push(i);
    }

    if (safeCurrentPage - delta > 2) {
      pages.push("...");
    }

    pages.push(...range);

    if (safeCurrentPage + delta < safeTotalPages - 1) {
      pages.push("...");
    }

    return [1, ...pages, safeTotalPages].filter(
      (v, i, a) => v === "..." || a.indexOf(v) === i
    );
  };

  // Always render pagination, even if only one page
  // if (safeTotalPages === 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
      <button
        onClick={() => onPageChange(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-2">
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 border rounded ${
              page === safeCurrentPage ? "bg-[#6842ff] text-white" : ""
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(safeCurrentPage + 1)}
        disabled={safeCurrentPage === safeTotalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
