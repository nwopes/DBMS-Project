export default function PageHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.1))', border: '1px solid rgba(59,130,246,0.3)' }}>
            <Icon size={22} style={{ color: '#60a5fa' }} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
