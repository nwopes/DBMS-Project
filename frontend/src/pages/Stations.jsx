import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Building2, Plus, Search, Pencil, Trash2, Users } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

const emptyForm = { station_name: '', location_id: '', jurisdiction_area: '' }

export default function Stations() {
  const [stations, setStations] = useState([])
  const [locations, setLocations] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    const [s, l] = await Promise.all([axios.get('/api/stations'), axios.get('/api/locations')])
    setStations(s.data); setLocations(l.data)
  }
  useEffect(() => { load() }, [])

  const filtered = stations.filter(s =>
    s.station_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (s) => {
    setEditing(s.station_id)
    setForm({ station_name: s.station_name, location_id: s.location_id || '', jurisdiction_area: s.jurisdiction_area || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) { await axios.put(`/api/stations/${editing}`, form); toast.success('Station updated') }
      else { await axios.post('/api/stations', form); toast.success('Station added') }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this station?')) return
    try { await axios.delete(`/api/stations/${id}`); toast.success('Station removed'); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Police Stations"
        subtitle={`${stations.length} stations in the system`}
        icon={Building2}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={15} /> Add Station</button>}
      />
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="form-input pl-9" placeholder="Search stations..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(s => (
          <div key={s.station_id} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
                  <Building2 size={18} style={{ color: '#60a5fa' }} />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{s.station_name}</p>
                  <p className="text-xs text-slate-500">{s.city}, {s.state}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => openEdit(s)}><Pencil size={13} /></button>
                <button className="btn-danger" onClick={() => handleDelete(s.station_id)}><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <p className="text-xs text-slate-500">Jurisdiction</p>
                <p className="text-xs text-slate-300 font-medium truncate">{s.jurisdiction_area || '—'}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <p className="text-xs text-slate-500">Officers</p>
                <div className="flex items-center gap-1">
                  <Users size={11} style={{ color: '#60a5fa' }} />
                  <p className="text-xs text-slate-300 font-medium">{s.officer_count}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-16 text-slate-500 col-span-2">No stations found</div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Station' : 'Add Police Station'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Station Name *</label>
            <input className="form-input" value={form.station_name} onChange={e => setForm({...form, station_name: e.target.value})} required placeholder="Station name" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Location</label>
            <select className="form-input" value={form.location_id} onChange={e => setForm({...form, location_id: e.target.value})}>
              <option value="">Select location</option>
              {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.city} — {l.address}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Jurisdiction Area</label>
            <input className="form-input" value={form.jurisdiction_area} onChange={e => setForm({...form, jurisdiction_area: e.target.value})} placeholder="e.g. Central Delhi" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">{editing ? 'Update' : 'Add Station'}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
