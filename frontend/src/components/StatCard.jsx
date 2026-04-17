export default function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colorMap = {
    blue: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', icon: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
    red: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', icon: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
    green: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', icon: '#22c55e', glow: 'rgba(34,197,94,0.3)' },
    yellow: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
    purple: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', icon: '#8b5cf6', glow: 'rgba(139,92,246,0.3)' },
    cyan: { bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.25)', icon: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
    orange: { bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)', icon: '#f97316', glow: 'rgba(249,115,22,0.3)' },
    pink: { bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.25)', icon: '#ec4899', glow: 'rgba(236,72,153,0.3)' },
  }

  const c = colorMap[color] || colorMap.blue

  return (
    <div className="fade-in" style={{
      background: 'rgba(13,20,37,0.9)',
      border: `1px solid ${c.border}`,
      borderRadius: '14px',
      padding: '1.25rem',
      transition: 'all 0.2s'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = `0 8px 25px ${c.glow}`
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
    }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value ?? '—'}</p>
          {subtitle && <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{subtitle}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <Icon size={20} style={{ color: c.icon }} />
        </div>
      </div>
    </div>
  )
}
