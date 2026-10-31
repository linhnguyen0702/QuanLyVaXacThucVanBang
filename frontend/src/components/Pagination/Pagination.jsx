import React, { useEffect } from 'react';
import './Pagination.css';

const Pagination = ({ page, total, limit, onPageChange }) => {
  const pageCount = Math.ceil(total / limit);
  const lastPage = Math.max(1, pageCount);

  useEffect(() => {
    if (page > lastPage) onPageChange(lastPage);
  }, [page, lastPage, onPageChange]);

  if (pageCount <= 1) return null;

  const firstItem = (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, total);
  const visiblePages = Array.from(
    { length: Math.min(5, pageCount) },
    (_, index) => {
      const start = Math.max(1, Math.min(page - 2, pageCount - 4));
      return start + index;
    }
  );

  return (
    <nav className="pagination" aria-label="Phân trang">
      <span className="pagination-info">
        Hiển thị {firstItem}-{lastItem} trong tổng số {total}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Trang trước"
        >
          ‹
        </button>
        {visiblePages.map((visiblePage) => (
          <button
            type="button"
            key={visiblePage}
            className={`pagination-button${visiblePage === page ? ' active' : ''}`}
            onClick={() => onPageChange(visiblePage)}
            aria-current={visiblePage === page ? 'page' : undefined}
          >
            {visiblePage}
          </button>
        ))}
        <button
          type="button"
          className="pagination-button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Trang sau"
        >
          ›
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
