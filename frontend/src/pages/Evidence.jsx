import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Package, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'

const EVIDENCE_TYPES = ['CCTV Footage','Weapon','Documents','Fingerprints','DNA Sample','Phone Records','Digital Evidence','Contraband','Forensic Report','Autopsy Report','Medical Report','Audio Recording','Photograph','Witness Statement','Seized Goods']
const emptyForm = { case_id: '', evidence_type: '', description: '', collected_date: '' }

export default function Evidence() {
  const [evidence, setEvidence] = useState([])
  const [cases, setCases] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    const [e, c] = await Promise.all([axios.get('/api/evidence'), axios.get('/api/cases')])
    setEvidence(e.data); setCases(c.data)
  }
  useEffect(() => { load() }, [])

  const filtered = evidence.filter(e =>
    e.evidence_type?.toLowerCase().includes(search.toLowerCase()) ||
    e.crime_type?.toLowerCase().includes(search.toLowerCase()) ||
    e.description?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (e) => {
    setEditing(e.evidence_id)
    setForm({ case_id: e.case_id, evidence_type: e.evidence_type || '', description: e.description || '', collected_date: e.collected_date?.slice(0,10) || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) { await axios.put(`/api/evidence/${editing}`, form); toast.success('Evidence updated') }
      else { await axios.post('/api/evidence', form); toast.success('Evidence logged') }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this evidence record?')) return
    try { await axios.delete(`/api/evidence/${id}`); toast.success('Evidence deleted'); load() }
    catch { toast.error('Error') }
  }

  const typeColor = (type) => {
    const map = { 'CCTV Footage': '#3b82f6', 'Weapon': '#ef4444', 'DNA Sample': '#8b5cf6', 'Digital Evidence': '#06b6d4', 'Forensic Report': '#f59e0b', 'Fingerprints': '#10b981' }
    return map[type] || '#94a3b8'
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Evidence Locker"
        subtitle={`${evidence.length} evidence items catalogued`}
        icon={Package}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={15} /> Add Evidence</button>}
      />
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="form-input pl-9" placeholder="Search evidence..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(e => (
          <div key={e.evidence_id} className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${typeColor(e.evidence_type)}20`, border: `1px solid ${typeColor(e.evidence_type)}40` }}>
              <Package size={18} style={{ color: typeColor(e.evidence_type) }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200 text-sm">{e.evidence_type}</span>
                <span className="text-xs text-slate-500 font-mono">#{e.evidence_id}</span>
              </div>
              <p className="text-xs text-slate-400 truncate">{e.description || '—'}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-500">Case #{e.case_id} · {e.crime_type}</span>
                <StatusBadge status={e.case_status} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-slate-500">{e.collected_date?.slice(0,10)}</p>
              <div className="flex gap-2 mt-2 justify-end">
                <button className="btn-secondary" onClick={() => openEdit(e)}><Pencil size={12} /></button>
                <button className="btn-danger" onClick={() => handleDelete(e.evidence_id)}><Trash2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-16 text-slate-500">No evidence found</div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Evidence' : 'Log New Evidence'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Case *</label>
            <select className="form-input" value={form.case_id} onChange={e => setForm({...form, case_id: e.target.value})} required>
              <option value="">Select case</option>
              {cases.map(c => <option key={c.case_id} value={c.case_id}>Case #{c.case_id} — {c.crime_type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Evidence Type</label>
            <select className="form-input" value={form.evidence_type} onChange={e => setForm({...form, evidence_type: e.target.value})}>
              <option value="">Select type</option>
              {EVIDENCE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Collected Date</label>
            <input type="date" className="form-input" value={form.collected_date} onChange={e => setForm({...form, collected_date: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the evidence..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">{editing ? 'Update' : 'Log Evidence'}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
