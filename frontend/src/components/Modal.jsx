import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sizeMap = { sm: '400px', md: '560px', lg: '720px', xl: '900px' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full fade-in" style={{
        maxWidth: sizeMap[size],
        background: '#0d1425',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '16px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{
          borderBottom: '1px solid rgba(59,130,246,0.15)',
          background: 'rgba(59,130,246,0.05)'
        }}>
          <h2 className="font-semibold text-white text-base">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
