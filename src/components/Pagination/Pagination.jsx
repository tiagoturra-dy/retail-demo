import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './Pagination.module.css';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className={styles.paginationContainer}>
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={styles.paginationArrow}
        title="First Page"
      >
        <ChevronsLeft size={18} />
      </button>

      {/* Previous Page */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={styles.paginationArrow}
        title="Previous Page"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page Numbers */}
      <div className={styles.paginationNumbers}>
        {startPage > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className={styles.paginationNumber}>1</button>
            {startPage > 2 && <span className={styles.paginationEllipsis}>...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className={styles.paginationEllipsis}>...</span>}
            <button onClick={() => onPageChange(totalPages)} className={styles.paginationNumber}>{totalPages}</button>
          </>
        )}
      </div>

      {/* Next Page */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={styles.paginationArrow}
        title="Next Page"
      >
        <ChevronRight size={18} />
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={styles.paginationArrow}
        title="Last Page"
      >
        <ChevronsRight size={18} />
      </button>
    </div>
  );
};
