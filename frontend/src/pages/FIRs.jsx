import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FileText, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

const emptyForm = { crime_id: '', filed_by: '', filing_date: '', description: '' }

export default function FIRs() {
  const [firs, setFirs] = useState([])
  const [crimes, setCrimes] = useState([])
  const [persons, setPersons] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [viewFir, setViewFir] = useState(null)

  const load = async () => {
    const [f, c, p] = await Promise.all([axios.get('/api/firs'), axios.get('/api/crimes'), axios.get('/api/persons')])
    setFirs(f.data); setCrimes(c.data); setPersons(p.data)
  }
  useEffect(() => { load() }, [])

  const filtered = firs.filter(f =>
    f.crime_type?.toLowerCase().includes(search.toLowerCase()) ||
    f.filed_by_name?.toLowerCase().includes(search.toLowerCase()) ||
    String(f.fir_id).includes(search)
  )

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (f) => {
    setEditing(f.fir_id)
    setForm({ crime_id: f.crime_id, filed_by: f.filed_by || '', filing_date: f.filing_date?.slice(0,10), description: f.description || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) { await axios.put(`/api/firs/${editing}`, form); toast.success('FIR updated') }
      else { await axios.post('/api/firs', form); toast.success('FIR filed') }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this FIR?')) return
    try { await axios.delete(`/api/firs/${id}`); toast.success('FIR deleted'); load() }
    catch (err) { toast.error('Error deleting') }
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="First Information Reports"
        subtitle={`${firs.length} FIRs on record`}
        icon={FileText}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={15} /> File FIR</button>}
      />
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="form-input pl-9" placeholder="Search FIRs..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.05)' }}>
              {['FIR ID','Crime Type','Filed By','Filing Date','Description','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.fir_id} className="table-row cursor-pointer" onClick={() => setViewFir(f)}>
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">#{f.fir_id}</td>
                <td className="px-4 py-3 font-medium text-slate-200 text-sm">{f.crime_type}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{f.filed_by_name || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{f.filing_date?.slice(0,10)}</td>
                <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">{f.description || '—'}</td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={() => openEdit(f)}><Pencil size={13} /></button>
                    <button className="btn-danger" onClick={() => handleDelete(f.fir_id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit FIR' : 'File New FIR'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Crime *</label>
            <select className="form-input" value={form.crime_id} onChange={e => setForm({...form, crime_id: e.target.value})} required>
              <option value="">Select crime</option>
              {crimes.map(c => <option key={c.crime_id} value={c.crime_id}>#{c.crime_id} — {c.crime_type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Filed By</label>
            <select className="form-input" value={form.filed_by} onChange={e => setForm({...form, filed_by: e.target.value})}>
              <option value="">Select person</option>
              {persons.map(p => <option key={p.person_id} value={p.person_id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Filing Date *</label>
            <input type="date" className="form-input" value={form.filing_date} onChange={e => setForm({...form, filing_date: e.target.value})} required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Description</label>
            <textarea className="form-input" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="FIR content..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">{editing ? 'Update FIR' : 'File FIR'}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewFir} onClose={() => setViewFir(null)} title={`FIR #${viewFir?.fir_id}`}>
        {viewFir && (
          <div className="space-y-4">
            {[['Crime Type', viewFir.crime_type], ['Crime Date', viewFir.crime_date?.slice(0,10)], ['Filed By', viewFir.filed_by_name], ['Phone', viewFir.filed_by_phone], ['Filing Date', viewFir.filing_date?.slice(0,10)]].map(([k,v]) => (
              <div key={k} className="p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <p className="text-xs text-slate-500 mb-1">{k}</p>
                <p className="text-sm text-slate-200">{v || '—'}</p>
              </div>
            ))}
            {viewFir.description && (
              <div className="p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <p className="text-xs text-slate-500 mb-1">FIR Description</p>
                <p className="text-sm text-slate-200 leading-relaxed">{viewFir.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
