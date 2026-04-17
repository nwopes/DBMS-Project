import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, FolderOpen, Package, Shield, Gavel } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [c, setC] = useState(null)

  useEffect(() => {
    axios.get(`/api/cases/${id}`).then(r => setC(r.data))
  }, [id])

  if (!c) return <div className="text-center py-20 text-slate-400">Loading...</div>

  return (
    <div className="fade-in max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Cases
      </button>

      <div className="glass-card p-6 mb-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <FolderOpen size={22} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Case File #{c.case_id}</h1>
              <p className="text-sm text-slate-400">{c.crime_type}</p>
            </div>
          </div>
          <StatusBadge status={c.case_status} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Lead Officer', c.lead_officer_name || '—'],
            ['Start Date', c.start_date?.slice(0,10) || '—'],
            ['End Date', c.end_date?.slice(0,10) || 'Ongoing'],
            ['Crime Date', c.crime_date?.slice(0,10) || '—'],
            ['Location', c.city || '—'],
            ['Crime Status', c.crime_status || '—'],
          ].map(([k,v]) => (
            <div key={k} className="p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
              <p className="text-xs text-slate-500 mb-1">{k}</p>
              <p className="text-sm text-slate-200 font-medium">{v}</p>
            </div>
          ))}
          {c.crime_description && (
            <div className="col-span-3 p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
              <p className="text-xs text-slate-500 mb-1">Crime Description</p>
              <p className="text-sm text-slate-200">{c.crime_description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Assigned Officers */}
      {c.officers?.length > 0 && (
        <div className="glass-card p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Shield size={15} style={{ color: '#60a5fa' }} /> Assigned Officers
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {c.officers.map(o => (
              <div key={o.officer_id} className="p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <p className="text-sm font-medium text-slate-200">{o.name}</p>
                <p className="text-xs text-slate-500">{o.designation} · {o.badge_number}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence */}
      {c.evidence?.length > 0 && (
        <div className="glass-card p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Package size={15} style={{ color: '#60a5fa' }} /> Evidence ({c.evidence.length})
          </h2>
          <div className="space-y-2">
            {c.evidence.map(e => (
              <div key={e.evidence_id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{e.evidence_type}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{e.description}</p>
                </div>
                <p className="text-xs text-slate-500 whitespace-nowrap">{e.collected_date?.slice(0,10)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Court Cases */}
      {c.courtCases?.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Gavel size={15} style={{ color: '#60a5fa' }} /> Court Proceedings
          </h2>
          {c.courtCases.map(cc => (
            <div key={cc.court_case_id} className="p-4 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-200">{cc.court_name}</p>
                <StatusBadge status={cc.verdict} />
              </div>
              <p className="text-xs text-slate-500 mt-1">Hearing: {cc.hearing_date?.slice(0,10)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
