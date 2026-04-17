import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, AlertTriangle, MapPin, Users, FolderOpen } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'

export default function CrimeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [crime, setCrime] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/crimes/${id}`).then(r => { setCrime(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>
  if (!crime) return <div className="text-center py-20 text-slate-400">Crime not found</div>

  return (
    <div className="fade-in max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-card p-6 mb-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={22} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{crime.crime_type}</h1>
              <p className="text-sm text-slate-400">Crime ID #{crime.crime_id}</p>
            </div>
          </div>
          <StatusBadge status={crime.status} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[
            ['Date', crime.date?.slice(0,10)],
            ['Time', crime.time || '—'],
            ['City', crime.city || '—'],
            ['State', crime.state || '—'],
            ['Address', crime.address || '—'],
            ['Pincode', crime.pincode || '—'],
          ].map(([k, v]) => (
            <div key={k} className="p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
              <p className="text-xs text-slate-500 mb-1">{k}</p>
              <p className="text-sm text-slate-200 font-medium">{v}</p>
            </div>
          ))}
          {crime.description && (
            <div className="col-span-2 p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
              <p className="text-xs text-slate-500 mb-1">Description</p>
              <p className="text-sm text-slate-200">{crime.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Persons Involved */}
      {crime.persons?.length > 0 && (
        <div className="glass-card p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Users size={15} style={{ color: '#60a5fa' }} /> Persons Involved ({crime.persons.length})
          </h2>
          <div className="space-y-2">
            {crime.persons.map(p => (
              <div key={p.person_id} className="flex items-center justify-between py-2 table-row">
                <div>
                  <p className="text-sm font-medium text-slate-200">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.gender} · Age {p.age} · {p.phone_number}</p>
                </div>
                <StatusBadge status={p.role} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cases */}
      {crime.cases?.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <FolderOpen size={15} style={{ color: '#60a5fa' }} /> Case Files ({crime.cases.length})
          </h2>
          <div className="space-y-2">
            {crime.cases.map(c => (
              <div key={c.case_id} className="flex items-center justify-between py-2 table-row cursor-pointer" onClick={() => navigate(`/cases/${c.case_id}`)}>
                <div>
                  <p className="text-sm font-medium text-slate-200">Case #{c.case_id}</p>
                  <p className="text-xs text-slate-500">Lead: {c.lead_officer_name || '—'} · Started {c.start_date?.slice(0,10)}</p>
                </div>
                <StatusBadge status={c.case_status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
