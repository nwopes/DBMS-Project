import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Gavel, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'

const VERDICTS = ['Pending','Guilty','Acquitted','Dismissed','Under Appeal']
const emptyForm = { case_id: '', court_name: '', verdict: 'Pending', hearing_date: '' }

const COURTS = ['Supreme Court of India','Delhi High Court','Mumbai High Court','Bombay High Court','Madras High Court','Calcutta High Court','Karnataka High Court','Allahabad High Court','Delhi Sessions Court','Mumbai Sessions Court','Lucknow District Court','Chennai District Court']

export default function CourtCases() {
  const [courtCases, setCourtCases] = useState([])
  const [cases, setCases] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    const [cc, c] = await Promise.all([axios.get('/api/court-cases'), axios.get('/api/cases')])
    setCourtCases(cc.data); setCases(c.data)
  }
  useEffect(() => { load() }, [])

  const filtered = courtCases.filter(c =>
    c.court_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.crime_type?.toLowerCase().includes(search.toLowerCase()) ||
    c.verdict?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (c) => {
    setEditing(c.court_case_id)
    setForm({ case_id: c.case_id, court_name: c.court_name || '', verdict: c.verdict || 'Pending', hearing_date: c.hearing_date?.slice(0,10) || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) { await axios.put(`/api/court-cases/${editing}`, form); toast.success('Court case updated') }
      else { await axios.post('/api/court-cases', form); toast.success('Court case filed') }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this court case?')) return
    try { await axios.delete(`/api/court-cases/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Error') }
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Court Cases"
        subtitle={`${courtCases.length} cases in proceedings`}
        icon={Gavel}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={15} /> File Court Case</button>}
      />
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="form-input pl-9" placeholder="Search court cases..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.05)' }}>
              {['Court Case ID','Crime Type','Court Name','Hearing Date','Case Status','Verdict','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.court_case_id} className="table-row">
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">#{c.court_case_id}</td>
                <td className="px-4 py-3 font-medium text-slate-200 text-sm">{c.crime_type}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{c.court_name || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{c.hearing_date?.slice(0,10) || '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={c.case_status} /></td>
                <td className="px-4 py-3"><StatusBadge status={c.verdict} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={() => openEdit(c)}><Pencil size={13} /></button>
                    <button className="btn-danger" onClick={() => handleDelete(c.court_case_id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-slate-500">No court cases found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Court Case' : 'File Court Case'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Case File *</label>
            <select className="form-input" value={form.case_id} onChange={e => setForm({...form, case_id: e.target.value})} required>
              <option value="">Select case</option>
              {cases.map(c => <option key={c.case_id} value={c.case_id}>Case #{c.case_id} — {c.crime_type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Court Name</label>
            <select className="form-input" value={form.court_name} onChange={e => setForm({...form, court_name: e.target.value})}>
              <option value="">Select court</option>
              {COURTS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Verdict</label>
              <select className="form-input" value={form.verdict} onChange={e => setForm({...form, verdict: e.target.value})}>
                {VERDICTS.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Hearing Date</label>
              <input type="date" className="form-input" value={form.hearing_date} onChange={e => setForm({...form, hearing_date: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">{editing ? 'Update' : 'File Court Case'}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
