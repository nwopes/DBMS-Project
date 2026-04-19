import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Package, Plus, Search, Pencil, Trash2, Upload, Paperclip, X, FileText, Image, File } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'

const EVIDENCE_TYPES = [
  'CCTV Footage','Weapon','Documents','Fingerprints','DNA Sample',
  'Phone Records','Digital Evidence','Contraband','Forensic Report',
  'Autopsy Report','Medical Report','Audio Recording','Photograph',
  'Witness Statement','Seized Goods',
]

const TYPE_COLOR = {
  'CCTV Footage':    '#3b82f6',
  'Weapon':          '#ef4444',
  'DNA Sample':      '#8b5cf6',
  'Digital Evidence':'#06b6d4',
  'Forensic Report': '#f59e0b',
  'Fingerprints':    '#10b981',
  'Audio Recording': '#f97316',
  'Photograph':      '#ec4899',
}
const defaultColor = '#94a3b8'

const emptyForm = { case_id: '', evidence_type: '', collected_date: '', description: '' }

const ITEMS_PER_PAGE = 10

function fileIcon(mimetype = '') {
  if (mimetype.startsWith('image/')) return <Image size={13} />
  if (mimetype === 'application/pdf') return <FileText size={13} />
  return <File size={13} />
}

function FileSection({ evidenceId }) {
  const [files, setFiles]       = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef()

  const loadFiles = async () => {
    const r = await axios.get(`/api/evidence/${evidenceId}/files`)
    setFiles(r.data)
  }

  useEffect(() => { loadFiles() }, [evidenceId])

  const handleUpload = async (e) => {
    const selected = Array.from(e.target.files)
    if (!selected.length) return
    const fd = new FormData()
    selected.forEach(f => fd.append('files', f))
    setUploading(true)
    try {
      await axios.post(`/api/evidence/${evidenceId}/files`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(`${selected.length} file(s) uploaded`)
      loadFiles()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemove = async (fileId) => {
    if (!confirm('Remove this file record?')) return
    await axios.delete(`/api/evidence/files/${fileId}`)
    toast.success('File removed')
    loadFiles()
  }

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(59,130,246,0.1)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <Paperclip size={11} /> {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
        <button
          className="btn-secondary"
          style={{ padding: '3px 8px', fontSize: 11 }}
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          <Upload size={11} /> {uploading ? 'Uploading...' : 'Attach Files'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.xlsx,.xls,.mp3,.mp4,.wav,.csv"
          onChange={handleUpload}
        />
      </div>
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map(f => (
            <div key={f.file_id} className="flex items-center gap-2 rounded px-2 py-1.5"
              style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)' }}>
              <span className="text-slate-400">{fileIcon(f.mimetype)}</span>
              <a
                href={`http://localhost:5000/uploads/evidence/${f.filename}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-xs text-blue-400 hover:text-blue-300 truncate transition-colors"
                title={f.original_name}
              >
                {f.original_name}
              </a>
              <span className="text-xs text-slate-600 whitespace-nowrap">
                {(f.file_size / 1024).toFixed(1)} KB
              </span>
              <button
                onClick={() => handleRemove(f.file_id)}
                className="text-slate-600 hover:text-red-400 transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Evidence() {
  const [evidence, setEvidence] = useState([])
  const [cases, setCases]       = useState([])
  const [search, setSearch]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(emptyForm)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)

  const load = async () => {
    const [e, c] = await Promise.all([axios.get('/api/evidence'), axios.get('/api/cases')])
    setEvidence(e.data)
    setCases(c.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = evidence.filter(e =>
    e.evidence_type?.toLowerCase().includes(search.toLowerCase()) ||
    e.crime_type?.toLowerCase().includes(search.toLowerCase()) ||
    e.description?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleSearchChange = (v) => { setSearch(v); setPage(1) }

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit   = (e) => {
    setEditing(e.evidence_id)
    setForm({
      case_id: e.case_id, evidence_type: e.evidence_type,
      collected_date: e.collected_date?.slice(0, 10) || '',
      description: e.description || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    try {
      if (editing) {
        await axios.put(`/api/evidence/${editing}`, form)
        toast.success('Evidence updated')
      } else {
        await axios.post('/api/evidence', form)
        toast.success('Evidence logged')
      }
      setShowModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving evidence')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this evidence record?')) return
    try { await axios.delete(`/api/evidence/${id}`); toast.success('Evidence deleted'); load() }
    catch (err) { toast.error('Error deleting') }
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Evidence Locker"
        subtitle={`${evidence.length} items catalogued`}
        icon={Package}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={15} /> Add Evidence</button>}
      />

      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="form-input pl-9"
            placeholder="Search by type, crime, or description..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No evidence found</div>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map(e => {
              const color = TYPE_COLOR[e.evidence_type] || defaultColor
              return (
                <div key={e.evidence_id} className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1 rounded-full self-stretch flex-shrink-0"
                      style={{ background: color, minHeight: 40 }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-200">{e.evidence_type}</span>
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                            style={{ background: `${color}20`, color }}>
                            #{e.evidence_id}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                            Case #{e.case_id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-500">
                            {e.collected_date?.slice(0, 10) || '—'}
                          </span>
                          <button className="btn-secondary" onClick={() => openEdit(e)}>
                            <Pencil size={12} />
                          </button>
                          <button className="btn-danger" onClick={() => handleDelete(e.evidence_id)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      {e.description && (
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{e.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-500">
                          Crime: <span className="text-slate-400">{e.crime_type}</span>
                        </span>
                        <span className="text-xs text-slate-500">
                          Status: <span className="text-slate-400">{e.case_status}</span>
                        </span>
                      </div>
                      <FileSection evidenceId={e.evidence_id} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Evidence' : 'Log New Evidence'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Case *</label>
            <select className="form-input" value={form.case_id} onChange={e => setForm({ ...form, case_id: e.target.value })} required>
              <option value="">Select case</option>
              {cases.map(c => <option key={c.case_id} value={c.case_id}>#{c.case_id} — {c.crime_type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Evidence Type</label>
            <select className="form-input" value={form.evidence_type} onChange={e => setForm({ ...form, evidence_type: e.target.value })}>
              <option value="">Select type</option>
              {EVIDENCE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Collected Date</label>
            <input type="date" className="form-input" value={form.collected_date} onChange={e => setForm({ ...form, collected_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the evidence..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editing ? 'Update Evidence' : 'Log Evidence'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
