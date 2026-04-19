import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FolderOpen, Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'

const STATUSES = ['Open','Closed','Under Investigation']
const ITEMS_PER_PAGE = 10
const emptyForm = { crime_id: '', lead_officer_id: '', case_status: 'Open', start_date: '', end_date: '' }

export default function Cases() {
  const [cases, setCases] = useState([])
  const [crimes, setCrimes] = useState([])
  const [officers, setOfficers] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const load = async () => {
    const [c, cr, o] = await Promise.all([
      axios.get('/api/cases'), axios.get('/api/crimes'), axios.get('/api/officers')
    ])
    setCases(c.data); setCrimes(cr.data); setOfficers(o.data)
  }
  useEffect(() => { load() }, [])

  const filtered = cases.filter(c =>
    (c.crime_type?.toLowerCase().includes(search.toLowerCase()) ||
     String(c.case_id).includes(search) || c.city?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || c.case_status === filterStatus)
  )
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (c) => {
    setEditing(c.case_id)
    setForm({ crime_id: c.crime_id, lead_officer_id: c.lead_officer_id || '', case_status: c.case_status, start_date: c.start_date?.slice(0,10) || '', end_date: c.end_date?.slice(0,10) || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) { await axios.put(`/api/cases/${editing}`, form); toast.success('Case updated') }
      else { await axios.post('/api/cases', form); toast.success('Case created') }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this case? Evidence and court records will also be removed.')) return
    try { await axios.delete(`/api/cases/${id}`); toast.success('Case deleted'); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Case Files"
        subtitle={`${cases.length} total cases`}
        icon={FolderOpen}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={15} /> New Case</button>}
      />

      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="form-input pl-9" placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.05)' }}>
              {['Case ID','Crime Type','City','Lead Officer','Start Date','Status','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-500">No cases found</td></tr>
            ) : paginated.map(c => (
              <tr key={c.case_id} className="table-row">
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">#{c.case_id}</td>
                <td className="px-4 py-3 font-medium text-slate-200 text-sm">{c.crime_type}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{c.city || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{c.lead_officer_name || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{c.start_date?.slice(0,10)}</td>
                <td className="px-4 py-3"><StatusBadge status={c.case_status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={() => navigate(`/cases/${c.case_id}`)}><Eye size={13} /> View</button>
                    <button className="btn-secondary" onClick={() => openEdit(c)}><Pencil size={13} /></button>
                    <button className="btn-danger" onClick={() => handleDelete(c.case_id)}><Trash2 size={13} /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Case' : 'New Case File'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Crime *</label>
              <select className="form-input" value={form.crime_id} onChange={e => setForm({...form, crime_id: e.target.value})} required>
                <option value="">Select crime</option>
                {crimes.map(c => <option key={c.crime_id} value={c.crime_id}>#{c.crime_id} — {c.crime_type} ({c.date?.slice(0,10)})</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Lead Officer</label>
              <select className="form-input" value={form.lead_officer_id} onChange={e => setForm({...form, lead_officer_id: e.target.value})}>
                <option value="">Select officer</option>
                {officers.map(o => <option key={o.officer_id} value={o.officer_id}>{o.name} ({o.designation})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Status</label>
              <select className="form-input" value={form.case_status} onChange={e => setForm({...form, case_status: e.target.value})}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Start Date</label>
              <input type="date" className="form-input" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">End Date</label>
              <input type="date" className="form-input" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">{editing ? 'Update' : 'Create Case'}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
