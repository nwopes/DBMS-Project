import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Users, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

const emptyForm = { name: '', age: '', gender: '', phone_number: '', address: '' }

export default function Persons() {
  const [persons, setPersons] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = () => axios.get('/api/persons').then(r => setPersons(r.data))
  useEffect(() => { load() }, [])

  const filtered = persons.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone_number?.includes(search) ||
    p.address?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (p) => {
    setEditing(p.person_id)
    setForm({ name: p.name, age: p.age || '', gender: p.gender || '', phone_number: p.phone_number || '', address: p.address || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) { await axios.put(`/api/persons/${editing}`, form); toast.success('Person updated') }
      else { await axios.post('/api/persons', form); toast.success('Person added') }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this person?')) return
    try { await axios.delete(`/api/persons/${id}`); toast.success('Person deleted'); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Error') }
  }

  const genderColor = (g) => g === 'Male' ? '#3b82f6' : g === 'Female' ? '#ec4899' : '#94a3b8'

  return (
    <div className="fade-in">
      <PageHeader
        title="Persons Registry"
        subtitle={`${persons.length} individuals on record`}
        icon={Users}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={15} /> Add Person</button>}
      />
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="form-input pl-9" placeholder="Search persons..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.05)' }}>
              {['ID','Name','Age','Gender','Phone','Address','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.person_id} className="table-row">
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">#{p.person_id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: `${genderColor(p.gender)}20`, color: genderColor(p.gender) }}>
                      {p.name?.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-200">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">{p.age || '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${genderColor(p.gender)}15`, color: genderColor(p.gender) }}>
                    {p.gender || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">{p.phone_number || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">{p.address || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={() => openEdit(p)}><Pencil size={13} /></button>
                    <button className="btn-danger" onClick={() => handleDelete(p.person_id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-slate-500">No persons found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Person' : 'Add Person'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Age</label>
              <input type="number" className="form-input" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="Age" min={1} max={120} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Gender</label>
              <select className="form-input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Phone</label>
              <input className="form-input" value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} placeholder="Phone number" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Address</label>
              <input className="form-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Residential address" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">{editing ? 'Update' : 'Add Person'}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
