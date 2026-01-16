// src/components/Shared/Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Common button styles
  const baseButtonStyles = "relative inline-flex items-center justify-center min-w-[40px] h-10 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500";
  const numberButtonStyles = "hover:bg-green-50 mx-1 rounded-lg";
  const activeButtonStyles = "bg-green-600 text-white hover:bg-green-700 shadow-md";
  const inactiveButtonStyles = "text-gray-700 hover:bg-green-50";
  const disabledButtonStyles = "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100";
  const arrowButtonStyles = "hover:bg-green-50 rounded-lg";

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      {/* Mobile pagination */}
      <div className="flex items-center justify-center gap-4 sm:hidden w-full">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${baseButtonStyles} ${arrowButtonStyles} px-4 
            ${currentPage === 1 ? disabledButtonStyles : inactiveButtonStyles}`}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="ml-1">Previous</span>
        </button>
        <span className="text-sm font-medium text-gray-700">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${baseButtonStyles} ${arrowButtonStyles} px-4
            ${currentPage === totalPages ? disabledButtonStyles : inactiveButtonStyles}`}
        >
          <span className="mr-1">Next</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex sm:flex-col items-center space-y-4">
        <p className="text-sm text-gray-700">
          Menampilkan Halaman <span className="font-medium text-green-600">{currentPage}</span> dari{' '}
          <span className="font-medium text-green-600">{totalPages}</span>
        </p>
        
        <nav className="flex items-center" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${baseButtonStyles} ${arrowButtonStyles} mr-2
              ${currentPage === 1 ? disabledButtonStyles : inactiveButtonStyles}`}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* First page */}
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className={`${baseButtonStyles} ${numberButtonStyles} ${inactiveButtonStyles}`}
              >
                1
              </button>
              {startPage > 2 && (
                <span className="mx-2 text-gray-500">•••</span>
              )}
            </>
          )}

          {/* Page numbers */}
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`${baseButtonStyles} ${numberButtonStyles} 
                ${currentPage === page ? activeButtonStyles : inactiveButtonStyles}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          {/* Last page */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="mx-2 text-gray-500">•••</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className={`${baseButtonStyles} ${numberButtonStyles} ${inactiveButtonStyles}`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${baseButtonStyles} ${arrowButtonStyles} ml-2
              ${currentPage === totalPages ? disabledButtonStyles : inactiveButtonStyles}`}
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;