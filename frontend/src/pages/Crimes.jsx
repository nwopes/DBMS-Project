import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AlertTriangle, Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'

const CRIME_TYPES = ['Theft','Robbery','Assault','Murder','Fraud','Burglary','Kidnapping','Cybercrime','Drug Trafficking','Arson','Vandalism','Extortion','Hit and Run','Forgery','Smuggling','Harassment','Rape','Domestic Violence']
const STATUSES = ['Open','Closed','Under Investigation']
const ITEMS_PER_PAGE = 10

const emptyForm = { crime_type: '', date: '', time: '', location_id: '', description: '', status: 'Open' }

export default function Crimes() {
  const [crimes, setCrimes] = useState([])
  const [locations, setLocations] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const load = async () => {
    const [c, l] = await Promise.all([axios.get('/api/crimes'), axios.get('/api/locations')])
    setCrimes(c.data)
    setLocations(l.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = crimes.filter(c =>
    (c.crime_type?.toLowerCase().includes(search.toLowerCase()) ||
     c.city?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || c.status === filterStatus)
  )
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleSearch = (v) => { setSearch(v); setPage(1) }
  const handleFilter = (v) => { setFilterStatus(v); setPage(1) }

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (c) => {
    setEditing(c.crime_id)
    setForm({ crime_type: c.crime_type, date: c.date?.slice(0,10), time: c.time || '', location_id: c.location_id || '', description: c.description || '', status: c.status || 'Open' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await axios.put(`/api/crimes/${editing}`, form)
        toast.success('Crime updated')
      } else {
        await axios.post('/api/crimes', form)
        toast.success('Crime recorded')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving crime')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this crime record? This will also remove related cases and FIRs.')) return
    try {
      await axios.delete(`/api/crimes/${id}`)
      toast.success('Crime deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error deleting')
    }
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Crime Records"
        subtitle={`${crimes.length} total incidents recorded`}
        icon={AlertTriangle}
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={15} /> Log Crime
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="form-input pl-9" placeholder="Search by type or city..." value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 180 }} value={filterStatus} onChange={e => handleFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.05)' }}>
              {['ID','Type','Date','Time','City','Status','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-500">Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-500">No crimes found</td></tr>
            ) : paginated.map(c => (
              <tr key={c.crime_id} className="table-row">
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">#{c.crime_id}</td>
                <td className="px-4 py-3 font-medium text-slate-200 text-sm">{c.crime_type}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{c.date?.slice(0,10)}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{c.time || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{c.city || '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={() => navigate(`/crimes/${c.crime_id}`)}><Eye size={13} /> View</button>
                    <button className="btn-secondary" onClick={() => openEdit(c)}><Pencil size={13} /></button>
                    <button className="btn-danger" onClick={() => handleDelete(c.crime_id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filtered.length}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Crime Record' : 'Log New Crime'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Crime Type *</label>
              <select className="form-input" value={form.crime_type} onChange={e => setForm({...form, crime_type: e.target.value})} required>
                <option value="">Select type</option>
                {CRIME_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Date *</label>
              <input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Time</label>
              <input type="time" className="form-input" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Location</label>
              <select className="form-input" value={form.location_id} onChange={e => setForm({...form, location_id: e.target.value})}>
                <option value="">Select location</option>
                {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.address}, {l.city}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Description</label>
              <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the incident..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editing ? 'Update Crime' : 'Log Crime'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
