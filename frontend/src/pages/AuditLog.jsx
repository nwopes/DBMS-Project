import { useEffect, useState } from 'react'
import axios from 'axios'
import { ClipboardList, Search, ChevronDown, ChevronUp, Filter } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'

const TABLES  = ['Crime', 'Case_File', 'Evidence', 'FIR', 'Court_Case']
const ACTIONS = ['INSERT', 'UPDATE', 'DELETE']
const LIMIT   = 20

const actionStyle = {
  INSERT: { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
  UPDATE: { background: 'rgba(245,158,11,0.15)',  color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
  DELETE: { background: 'rgba(239,68,68,0.15)',   color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
}

function JsonView({ label, data }) {
  if (!data) return <p className="text-xs text-slate-500 italic">—</p>
  let obj
  try { obj = typeof data === 'string' ? JSON.parse(data) : data }
  catch { return <p className="text-xs text-slate-400 font-mono break-all">{String(data)}</p> }
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <pre className="text-xs text-slate-300 rounded p-2 overflow-x-auto"
        style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', maxHeight: 200 }}>
        {JSON.stringify(obj, null, 2)}
      </pre>
    </div>
  )
}

export default function AuditLog() {
  const [logs, setLogs]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [filterTable, setFilterTable]   = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterFrom, setFilterFrom]     = useState('')
  const [filterTo, setFilterTo]         = useState('')
  const [loading, setLoading]   = useState(true)
  const [viewLog, setViewLog]   = useState(null)
  const [expanded, setExpanded] = useState(null)

  const load = async (p = page) => {
    setLoading(true)
    try {
      const params = { page: p, limit: LIMIT }
      if (filterTable)  params.table_name = filterTable
      if (filterAction) params.action     = filterAction
      if (filterFrom)   params.from       = filterFrom
      if (filterTo)     params.to         = filterTo
      const r = await axios.get('/api/audit-logs', { params })
      setLogs(r.data.logs)
      setTotal(r.data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1); setPage(1) }, [filterTable, filterAction, filterFrom, filterTo])
  useEffect(() => { load(page) }, [page])

  const handlePageChange = (p) => { setPage(p); load(p) }

  const clearFilters = () => {
    setFilterTable(''); setFilterAction(''); setFilterFrom(''); setFilterTo('')
  }

  const hasFilters = filterTable || filterAction || filterFrom || filterTo

  return (
    <div className="fade-in">
      <PageHeader
        title="Audit Log"
        subtitle={`${total} change records`}
        icon={ClipboardList}
      />

      {/* Filters */}
      <div className="glass-card p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} style={{ color: '#60a5fa' }} />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filters</span>
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Table</label>
            <select className="form-input text-sm" value={filterTable} onChange={e => setFilterTable(e.target.value)}>
              <option value="">All Tables</option>
              {TABLES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Action</label>
            <select className="form-input text-sm" value={filterAction} onChange={e => setFilterAction(e.target.value)}>
              <option value="">All Actions</option>
              {ACTIONS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">From Date</label>
            <input type="date" className="form-input text-sm" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">To Date</label>
            <input type="date" className="form-input text-sm" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.05)' }}>
              {['Log ID', 'Table', 'Record ID', 'Action', 'Changed By', 'Timestamp', 'Details'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-500">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-500">No audit records found</td></tr>
            ) : logs.map(log => (
              <tr key={log.log_id} className="table-row">
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">#{log.log_id}</td>
                <td className="px-4 py-3 text-sm text-slate-300 font-medium">{log.table_name}</td>
                <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                  {log.record_id ? `#${log.record_id}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2 py-1 rounded"
                    style={actionStyle[log.action] || {}}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">{log.changed_by}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                  {new Date(log.changed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="px-4 py-3">
                  <button
                    className="btn-secondary text-xs"
                    onClick={() => setViewLog(log)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / LIMIT)}
        onPageChange={handlePageChange}
        totalItems={total}
        itemsPerPage={LIMIT}
      />

      {/* Detail Modal */}
      <Modal isOpen={!!viewLog} onClose={() => setViewLog(null)} title={`Audit Log #${viewLog?.log_id}`}>
        {viewLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Table', viewLog.table_name],
                ['Record ID', viewLog.record_id ? `#${viewLog.record_id}` : '—'],
                ['Action', viewLog.action],
                ['Changed By', viewLog.changed_by],
                ['Timestamp', new Date(viewLog.changed_at).toLocaleString('en-IN')],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                  <p className="text-xs text-slate-500 mb-1">{k}</p>
                  <p className="text-sm text-slate-200">{v}</p>
                </div>
              ))}
            </div>
            <JsonView label="Before (Old Values)" data={viewLog.old_values} />
            <JsonView label="After (New Values)"  data={viewLog.new_values} />
          </div>
        )}
      </Modal>
    </div>
  )
}
