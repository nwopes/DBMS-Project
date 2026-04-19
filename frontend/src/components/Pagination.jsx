import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
  if (totalPages <= 1) return null

  const from = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
  const to   = Math.min(currentPage * itemsPerPage, totalItems)

  // Build page window (max 5 visible)
  let pages = []
  if (totalPages <= 5) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  } else if (currentPage <= 3) {
    pages = [1, 2, 3, 4, 5]
  } else if (currentPage >= totalPages - 2) {
    pages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  } else {
    pages = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
  }

  const btn = (disabled, onClick, children) => (
    <button
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-center w-8 h-8 rounded text-xs font-medium transition-all"
      style={disabled
        ? { color: '#334155', cursor: 'not-allowed', background: 'transparent' }
        : { color: '#94a3b8', cursor: 'pointer', background: 'transparent' }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(59,130,246,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <span className="text-xs text-slate-500">
        Showing {from}–{to} of {totalItems}
      </span>
      <div className="flex items-center gap-1">
        {btn(currentPage === 1, () => onPageChange(currentPage - 1), <ChevronLeft size={14} />)}
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="w-8 h-8 rounded text-xs font-medium transition-all"
            style={p === currentPage
              ? { background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(37,99,235,0.2))',
                  border: '1px solid rgba(59,130,246,0.4)', color: '#60a5fa' }
              : { color: '#64748b', background: 'transparent', border: '1px solid transparent' }}
          >
            {p}
          </button>
        ))}
        {btn(currentPage === totalPages, () => onPageChange(currentPage + 1), <ChevronRight size={14} />)}
      </div>
    </div>
  )
}
