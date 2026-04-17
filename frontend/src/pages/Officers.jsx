import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Shield, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

const DESIGNATIONS = ['DCP','DSP','Inspector','Sub-Inspector','Assistant Sub-Inspector','Head Constable','Constable']
const emptyForm = { name: '', designation: '', badge_number: '', phone_number: '', station_id: '' }

export default function Officers() {
  const [officers, setOfficers] = useState([])
  const [stations, setStations] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    const [o, s] = await Promise.all([axios.get('/api/officers'), axios.get('/api/stations')])
    setOfficers(o.data); setStations(s.data)
  }
  useEffect(() => { load() }, [])

  const filtered = officers.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.badge_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.designation?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (o) => {
    setEditing(o.officer_id)
    setForm({ name: o.name, designation: o.designation || '', badge_number: o.badge_number, phone_number: o.phone_number || '', station_id: o.station_id || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) { await axios.put(`/api/officers/${editing}`, form); toast.success('Officer updated') }
      else { await axios.post('/api/officers', form); toast.success('Officer added') }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this officer?')) return
    try { await axios.delete(`/api/officers/${id}`); toast.success('Officer removed'); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  const designationColor = (d) => {
    const map = { 'DCP': '#8b5cf6', 'DSP': '#6366f1', 'Inspector': '#3b82f6', 'Sub-Inspector': '#06b6d4', 'Constable': '#94a3b8' }
    return map[d] || '#60a5fa'
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Police Officers"
        subtitle={`${officers.length} officers registered`}
        icon={Shield}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={15} /> Add Officer</button>}
      />
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="form-input pl-9" placeholder="Search officers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(o => (
          <div key={o.officer_id} className="glass-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ background: `${designationColor(o.designation)}20`, border: `2px solid ${designationColor(o.designation)}40`, color: designationColor(o.designation) }}>
              {o.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-200">{o.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${designationColor(o.designation)}20`, color: designationColor(o.designation) }}>
                  {o.designation}
                </span>
                <span className="text-xs text-slate-500 font-mono">{o.badge_number}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{o.station_name || '—'} · {o.phone_number}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => openEdit(o)}><Pencil size={13} /></button>
              <button className="btn-danger" onClick={() => handleDelete(o.officer_id)}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-16 text-slate-500 col-span-2">No officers found</div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Officer' : 'Register New Officer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Officer name" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Designation</label>
              <select className="form-input" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})}>
                <option value="">Select</option>
                {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Badge Number *</label>
              <input className="form-input" value={form.badge_number} onChange={e => setForm({...form, badge_number: e.target.value})} required placeholder="e.g. B1011" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Phone</label>
              <input className="form-input" value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} placeholder="Phone number" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Police Station</label>
              <select className="form-input" value={form.station_id} onChange={e => setForm({...form, station_id: e.target.value})}>
                <option value="">Select station</option>
                {stations.map(s => <option key={s.station_id} value={s.station_id}>{s.station_name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">{editing ? 'Update' : 'Register Officer'}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
