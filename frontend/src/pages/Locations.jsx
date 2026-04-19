import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MapPin, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

const emptyForm = { address: '', city: '', state: '', pincode: '', latitude: '', longitude: '' }

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry']

export default function Locations() {
  const [locations, setLocations] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = () => axios.get('/api/locations').then(r => setLocations(r.data))
  useEffect(() => { load() }, [])

  const filtered = locations.filter(l =>
    l.city?.toLowerCase().includes(search.toLowerCase()) ||
    l.state?.toLowerCase().includes(search.toLowerCase()) ||
    l.address?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (l) => {
    setEditing(l.location_id)
    setForm({
      address: l.address || '', city: l.city || '', state: l.state || '', pincode: l.pincode || '',
      latitude: l.latitude ?? '', longitude: l.longitude ?? '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) { await axios.put(`/api/locations/${editing}`, form); toast.success('Location updated') }
      else { await axios.post('/api/locations', form); toast.success('Location added') }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this location?')) return
    try { await axios.delete(`/api/locations/${id}`); toast.success('Location deleted'); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  const stateColor = (state) => {
    const colors = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#f97316']
    const idx = state ? state.charCodeAt(0) % colors.length : 0
    return colors[idx]
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Locations"
        subtitle={`${locations.length} locations in the database`}
        icon={MapPin}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={15} /> Add Location</button>}
      />
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="form-input pl-9" placeholder="Search by city or state..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {filtered.map(l => (
          <div key={l.location_id} className="glass-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${stateColor(l.state)}20`, border: `1px solid ${stateColor(l.state)}40` }}>
                  <MapPin size={15} style={{ color: stateColor(l.state) }} />
                </div>
                <div>
                  <p className="font-semibold text-slate-200 text-sm">{l.city}</p>
                  <p className="text-xs text-slate-500">{l.state}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono">#{l.location_id}</span>
            </div>
            <p className="text-xs text-slate-400 mb-2 truncate">{l.address || '—'}</p>
            {(l.latitude && l.longitude) && (
              <p className="text-xs text-slate-500 mb-2 font-mono">
                {parseFloat(l.latitude).toFixed(4)}, {parseFloat(l.longitude).toFixed(4)}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                {l.pincode || 'No PIN'}
              </span>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => openEdit(l)}><Pencil size={12} /></button>
                <button className="btn-danger" onClick={() => handleDelete(l.location_id)}><Trash2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-16 text-slate-500 col-span-3">No locations found</div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Location' : 'Add Location'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Address</label>
            <input className="form-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street address" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">City</label>
              <input className="form-input" value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Pincode</label>
              <input className="form-input" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} placeholder="Pincode" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">State</label>
              <select className="form-input" value={form.state} onChange={e => setForm({...form, state: e.target.value})}>
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Latitude (for map)</label>
              <input type="number" step="any" className="form-input" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} placeholder="e.g. 28.6139" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Longitude (for map)</label>
              <input type="number" step="any" className="form-input" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} placeholder="e.g. 77.2090" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">{editing ? 'Update' : 'Add Location'}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
