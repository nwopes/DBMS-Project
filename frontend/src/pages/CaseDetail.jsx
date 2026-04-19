import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, FolderOpen, Package, Shield, Gavel, FileText, Download, Sparkles, Loader2 } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ── PDF colours ────────────────────────────────────────────────
const C = {
  navyBg:   [10,  15,  30],
  navyMid:  [13,  20,  37],
  blue:     [59,  130, 246],
  blueDark: [37,  99,  235],
  white:    [255, 255, 255],
  offWhite: [226, 232, 240],
  grey:     [100, 116, 139],
  lightRow: [15,  23,  42],
  darkRow:  [10,  15,  30],
  green:    [16,  185, 129],
  amber:    [245, 158, 11],
  red:      [239, 68,  68],
}

function statusRgb(s) {
  if (s === 'Open')               return C.amber
  if (s === 'Closed')             return C.green
  if (s === 'Under Investigation') return C.blue
  if (s === 'Guilty')             return C.red
  if (s === 'Acquitted')          return C.green
  if (s === 'Pending')            return C.amber
  return C.grey
}

async function generatePDF(caseData, aiSummary) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, M = 14
  let y = 0

  // ── Header bar ─────────────────────────────────────────────
  doc.setFillColor(...C.navyBg)
  doc.rect(0, 0, W, 42, 'F')

  // Shield icon (drawn as polygons)
  doc.setFillColor(...C.blue)
  doc.roundedRect(M, 8, 20, 24, 3, 3, 'F')
  doc.setFillColor(...C.white)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('CMS', M + 3.5, 23)

  // Title
  doc.setTextColor(...C.white)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('CRIME MANAGEMENT SYSTEM', M + 26, 18)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.grey)
  doc.text('Official Case Investigation Report  —  CONFIDENTIAL', M + 26, 25)

  // Case ID badge
  doc.setFillColor(...C.blueDark)
  doc.roundedRect(W - 52, 10, 38, 12, 2, 2, 'F')
  doc.setTextColor(...C.white)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(`CASE #${caseData.case_id}`, W - 44, 17, { align: 'center' })

  // Generated timestamp
  doc.setFontSize(7)
  doc.setTextColor(...C.grey)
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, W - M, 37, { align: 'right' })

  y = 48

  // ── Section helper ──────────────────────────────────────────
  const section = (title, icon = '▸') => {
    doc.setFillColor(...C.navyMid)
    doc.rect(M, y, W - 2 * M, 8, 'F')
    doc.setDrawColor(...C.blue)
    doc.setLineWidth(0.5)
    doc.line(M, y, M, y + 8)
    doc.setTextColor(...C.blue)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(`${icon}  ${title.toUpperCase()}`, M + 3, y + 5.5)
    y += 12
  }

  const field = (label, value, xOffset = 0, maxWidth = W - 2 * M - 10) => {
    doc.setTextColor(...C.grey)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text(label, M + xOffset, y)
    doc.setTextColor(...C.offWhite)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    const lines = doc.splitTextToSize(String(value || '—'), maxWidth)
    doc.text(lines, M + xOffset, y + 4.5)
    return lines.length * 4.5 + 6
  }

  const grid2 = (pairs) => {
    const colW = (W - 2 * M) / 2
    let maxH = 0
    pairs.forEach(([label, val], i) => {
      const x = i % 2 === 0 ? 0 : colW + 2
      if (i % 2 === 0 && i > 0) y += maxH + 2, maxH = 0
      const h = field(label, val, x, colW - 4)
      maxH = Math.max(maxH, h)
    })
    y += maxH + 4
  }

  const addPage = () => { doc.addPage(); y = 16 }
  const checkPage = (need = 30) => { if (y + need > 280) addPage() }

  // ── 1. Case Overview ────────────────────────────────────────
  section('Case Overview', '1')
  grid2([
    ['Case ID',     `#${caseData.case_id}`],
    ['Case Status', caseData.case_status],
    ['Opened',      caseData.start_date?.slice(0, 10) || '—'],
    ['Closed',      caseData.end_date?.slice(0, 10) || 'Ongoing'],
    ['Lead Officer', caseData.lead_officer_name || '—'],
    ['Crime Type',  caseData.crime_type],
  ])

  // ── 2. Crime Details ─────────────────────────────────────────
  checkPage(40)
  section('Crime Details', '2')
  grid2([
    ['Crime Date', caseData.crime_date?.slice(0, 10) || '—'],
    ['Crime Status', caseData.crime_status || '—'],
    ['City',        caseData.city || '—'],
    ['State',       caseData.state || '—'],
    ['Address',     caseData.address || '—'],
    ['Location ID', String(caseData.location_id || '—')],
  ])
  if (caseData.crime_description) {
    doc.setTextColor(...C.grey)
    doc.setFontSize(7.5)
    doc.text('Incident Description', M, y)
    doc.setTextColor(...C.offWhite)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(caseData.crime_description, W - 2 * M)
    doc.text(lines, M, y + 4.5)
    y += lines.length * 4 + 10
  }

  // ── 3. FIRs ──────────────────────────────────────────────────
  if (caseData.firs?.length > 0) {
    checkPage(40)
    section('First Information Reports', '3')
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['FIR #', 'Filing Date', 'Filed By', 'Phone', 'Description']],
      body: caseData.firs.map(f => [
        `#${f.fir_id}`,
        f.filing_date?.slice(0, 10) || '—',
        f.filed_by_name || '—',
        f.filed_by_phone || '—',
        f.description?.substring(0, 80) + (f.description?.length > 80 ? '...' : '') || '—',
      ]),
      styles:     { fontSize: 7.5, textColor: C.offWhite, fillColor: C.darkRow, cellPadding: 2.5 },
      headStyles: { fillColor: C.navyMid, textColor: C.blue, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: C.lightRow },
      tableLineColor: [30, 40, 70],
      tableLineWidth: 0.2,
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ── 4. Assigned Officers ─────────────────────────────────────
  if (caseData.officers?.length > 0) {
    checkPage(40)
    section('Assigned Officers', '4')
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['Name', 'Designation', 'Badge No.', 'Phone']],
      body: caseData.officers.map(o => [
        o.name, o.designation, o.badge_number, o.phone_number || '—',
      ]),
      styles:     { fontSize: 7.5, textColor: C.offWhite, fillColor: C.darkRow, cellPadding: 2.5 },
      headStyles: { fillColor: C.navyMid, textColor: C.blue, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: C.lightRow },
      tableLineColor: [30, 40, 70],
      tableLineWidth: 0.2,
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ── 5. Evidence ───────────────────────────────────────────────
  if (caseData.evidence?.length > 0) {
    checkPage(40)
    section(`Evidence Collected (${caseData.evidence.length} items)`, '5')
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['#', 'Type', 'Collected Date', 'Description']],
      body: caseData.evidence.map(e => [
        `#${e.evidence_id}`,
        e.evidence_type,
        e.collected_date?.slice(0, 10) || '—',
        e.description?.substring(0, 100) + (e.description?.length > 100 ? '...' : '') || '—',
      ]),
      styles:     { fontSize: 7.5, textColor: C.offWhite, fillColor: C.darkRow, cellPadding: 2.5 },
      headStyles: { fillColor: C.navyMid, textColor: C.blue, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: C.lightRow },
      columnStyles: { 3: { cellWidth: 80 } },
      tableLineColor: [30, 40, 70],
      tableLineWidth: 0.2,
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ── 6. Court Proceedings ─────────────────────────────────────
  if (caseData.courtCases?.length > 0) {
    checkPage(40)
    section('Court Proceedings', '6')
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['Court Case #', 'Court Name', 'Hearing Date', 'Verdict']],
      body: caseData.courtCases.map(cc => [
        `#${cc.court_case_id}`,
        cc.court_name,
        cc.hearing_date?.slice(0, 10) || '—',
        cc.verdict || 'Pending',
      ]),
      styles:     { fontSize: 7.5, textColor: C.offWhite, fillColor: C.darkRow, cellPadding: 2.5 },
      headStyles: { fillColor: C.navyMid, textColor: C.blue, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: C.lightRow },
      tableLineColor: [30, 40, 70],
      tableLineWidth: 0.2,
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ── 7. AI Case Summary ────────────────────────────────────────
  if (aiSummary) {
    checkPage(50)
    section('AI Case Analysis', '7')
    doc.setFillColor(10, 20, 50)
    doc.roundedRect(M, y, W - 2 * M, 6, 1, 1, 'F')
    doc.setFontSize(7)
    doc.setTextColor(96, 165, 250)
    doc.text('Generated by GPT-4o-mini  •  For reference only — not a substitute for official investigation conclusions', M + 2, y + 4)
    y += 9
    doc.setTextColor(...C.offWhite)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const summaryLines = doc.splitTextToSize(aiSummary, W - 2 * M)
    summaryLines.forEach(line => {
      if (y > 278) { addPage() }
      doc.text(line, M, y)
      y += 4.5
    })
    y += 6
  }

  // ── Footer on each page ──────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...C.navyMid)
    doc.rect(0, 287, W, 10, 'F')
    doc.setFontSize(7)
    doc.setTextColor(...C.grey)
    doc.text('CONFIDENTIAL — Crime Management System  |  DBMS Course Project', M, 293)
    doc.text(`Page ${i} of ${pageCount}`, W - M, 293, { align: 'right' })
  }

  doc.save(`Case_Report_${caseData.case_id}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ── Component ─────────────────────────────────────────────────
export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [c, setC]               = useState(null)
  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    axios.get(`/api/cases/${id}`).then(r => setC(r.data))
  }, [id])

  const fetchAISummary = async (caseData) => {
    setAiLoading(true)
    try {
      const r = await axios.post('/api/ai/case-summary', { caseData })
      setAiSummary(r.data.summary)
      return r.data.summary
    } catch (err) {
      const msg = err.response?.data?.error || 'AI summary unavailable'
      toast.error(msg)
      return null
    } finally {
      setAiLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    setPdfLoading(true)
    toast.loading('Generating PDF report...', { id: 'pdf' })
    try {
      let summary = aiSummary
      if (!summary) {
        summary = await fetchAISummary(c)
      }
      await generatePDF(c, summary)
      toast.success('PDF downloaded', { id: 'pdf' })
    } catch (err) {
      toast.error('Failed to generate PDF', { id: 'pdf' })
    } finally {
      setPdfLoading(false)
    }
  }

  if (!c) return <div className="text-center py-20 text-slate-400">Loading...</div>

  return (
    <div className="fade-in max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={16} /> Back to Cases
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="btn-primary"
        >
          {pdfLoading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {pdfLoading ? 'Generating...' : 'Download PDF Report'}
        </button>
      </div>

      {/* Case header */}
      <div className="glass-card p-6 mb-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <FolderOpen size={22} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Case File #{c.case_id}</h1>
              <p className="text-sm text-slate-400">{c.crime_type}</p>
            </div>
          </div>
          <StatusBadge status={c.case_status} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Lead Officer',  c.lead_officer_name || '—'],
            ['Start Date',    c.start_date?.slice(0, 10) || '—'],
            ['End Date',      c.end_date?.slice(0, 10) || 'Ongoing'],
            ['Crime Date',    c.crime_date?.slice(0, 10) || '—'],
            ['Location',      c.city || '—'],
            ['Crime Status',  c.crime_status || '—'],
          ].map(([k, v]) => (
            <div key={k} className="p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
              <p className="text-xs text-slate-500 mb-1">{k}</p>
              <p className="text-sm text-slate-200 font-medium">{v}</p>
            </div>
          ))}
          {c.crime_description && (
            <div className="col-span-3 p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
              <p className="text-xs text-slate-500 mb-1">Crime Description</p>
              <p className="text-sm text-slate-200">{c.crime_description}</p>
            </div>
          )}
        </div>
      </div>

      {/* FIRs */}
      {c.firs?.length > 0 && (
        <div className="glass-card p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <FileText size={15} style={{ color: '#60a5fa' }} /> First Information Reports ({c.firs.length})
          </h2>
          <div className="space-y-2">
            {c.firs.map(f => (
              <div key={f.fir_id} className="p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-200">FIR #{f.fir_id}</span>
                  <span className="text-xs text-slate-500">{f.filing_date?.slice(0, 10)}</span>
                </div>
                <p className="text-xs text-slate-400">Filed by: {f.filed_by_name || '—'}{f.filed_by_phone ? ` · ${f.filed_by_phone}` : ''}</p>
                {f.description && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Officers */}
      {c.officers?.length > 0 && (
        <div className="glass-card p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Shield size={15} style={{ color: '#60a5fa' }} /> Assigned Officers
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {c.officers.map(o => (
              <div key={o.officer_id} className="p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <p className="text-sm font-medium text-slate-200">{o.name}</p>
                <p className="text-xs text-slate-500">{o.designation} · {o.badge_number}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence */}
      {c.evidence?.length > 0 && (
        <div className="glass-card p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Package size={15} style={{ color: '#60a5fa' }} /> Evidence ({c.evidence.length})
          </h2>
          <div className="space-y-2">
            {c.evidence.map(e => (
              <div key={e.evidence_id} className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{e.evidence_type}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{e.description}</p>
                </div>
                <p className="text-xs text-slate-500 whitespace-nowrap">{e.collected_date?.slice(0, 10)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Court Cases */}
      {c.courtCases?.length > 0 && (
        <div className="glass-card p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Gavel size={15} style={{ color: '#60a5fa' }} /> Court Proceedings
          </h2>
          {c.courtCases.map(cc => (
            <div key={cc.court_case_id} className="p-4 rounded-lg" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-200">{cc.court_name}</p>
                <StatusBadge status={cc.verdict} />
              </div>
              <p className="text-xs text-slate-500 mt-1">Hearing: {cc.hearing_date?.slice(0, 10)}</p>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Sparkles size={15} style={{ color: '#60a5fa' }} /> AI Case Analysis
          </h2>
          {!aiSummary && (
            <button
              onClick={() => fetchAISummary(c)}
              disabled={aiLoading}
              className="btn-secondary text-xs"
            >
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {aiLoading ? 'Analysing...' : 'Generate Analysis'}
            </button>
          )}
        </div>
        {aiLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <Loader2 size={16} className="animate-spin" style={{ color: '#3b82f6' }} />
            GPT-4o-mini is analysing the case...
          </div>
        )}
        {aiSummary && !aiLoading && (
          <div>
            <p className="text-xs text-slate-500 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
              Generated by GPT-4o-mini · For reference only
            </p>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
            <button
              onClick={() => { setAiSummary(''); fetchAISummary(c) }}
              className="btn-secondary text-xs mt-3"
            >
              Regenerate
            </button>
          </div>
        )}
        {!aiSummary && !aiLoading && (
          <p className="text-sm text-slate-500 py-2">
            Click "Generate Analysis" to get an AI-written case summary. The summary will also be embedded in the PDF report.
          </p>
        )}
      </div>
    </div>
  )
}
