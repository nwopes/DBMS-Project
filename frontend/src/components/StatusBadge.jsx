export default function StatusBadge({ status }) {
  if (!status) return <span className="text-slate-500 text-xs">—</span>

  const s = status.toLowerCase()
  let cls = ''
  if (s === 'open') cls = 'status-open'
  else if (s === 'closed') cls = 'status-closed'
  else if (s.includes('investigation') || s === 'pending') cls = 'status-investigation'
  else if (s === 'guilty') cls = 'status-closed'
  else if (s === 'acquitted') cls = 'status-open'
  else cls = 'status-investigation'

  return (
    <span className={`${cls} px-2 py-0.5 rounded-full text-xs font-medium`}>
      {status}
    </span>
  )
}
