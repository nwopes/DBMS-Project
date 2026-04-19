import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { MapPin, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { MapContainer, TileLayer, useMap, CircleMarker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'

const CRIME_COLORS = {
  'Murder':          '#ef4444',
  'Kidnapping':      '#f97316',
  'Robbery':         '#f59e0b',
  'Assault':         '#eab308',
  'Arson':           '#f97316',
  'Drug Trafficking':'#8b5cf6',
  'Fraud':           '#3b82f6',
  'Cybercrime':      '#06b6d4',
  'Theft':           '#10b981',
  'Burglary':        '#10b981',
}
const defaultColor = '#64748b'

function HeatLayer({ points }) {
  const map = useMap()
  const layerRef = useRef(null)

  useEffect(() => {
    if (!points.length || !map) return
    if (layerRef.current) {
      try { map.removeLayer(layerRef.current) } catch {}
    }
    const heatPoints = points.map(p => [parseFloat(p.latitude), parseFloat(p.longitude), 1])
    layerRef.current = L.heatLayer(heatPoints, {
      radius: 45,
      blur: 25,
      maxZoom: 10,
      gradient: { 0.2: '#3b82f6', 0.5: '#f59e0b', 0.8: '#ef4444', 1.0: '#7c3aed' },
    })
    layerRef.current.addTo(map)
    return () => {
      if (layerRef.current) {
        try { map.removeLayer(layerRef.current) } catch {}
      }
    }
  }, [map, points])

  return null
}

export default function CrimeMap() {
  const [crimes, setCrimes]     = useState([])
  const [stats, setStats]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [showHeat, setShowHeat] = useState(true)
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    setError('')
    Promise.all([
      axios.get('/api/map/crimes'),
      axios.get('/api/map/stats'),
    ]).then(([cr, st]) => {
      setCrimes(cr.data)
      setStats(st.data)
    }).catch((err) => {
      setError(err.response?.data?.error || err.message || 'Failed to load map data')
      setCrimes([])
      setStats([])
    }).finally(() => setLoading(false))
  }, [])

  const filtered = filterType ? crimes.filter(c => c.crime_type === filterType) : crimes
  const crimeTypes = [...new Set(crimes.map(c => c.crime_type))].sort()

  const statusColor = (status) => {
    if (status === 'Open') return '#f59e0b'
    if (status === 'Closed') return '#10b981'
    return '#3b82f6'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      Loading map data...
    </div>
  )

  if (crimes.length === 0) return (
    <div className="fade-in">
      <PageHeader title="Crime Heatmap" subtitle="Geographic crime distribution" icon={MapPin} />
      <div className="glass-card p-12 text-center">
        <MapPin size={40} className="mx-auto mb-3" style={{ color: '#3b82f6' }} />
        <p className="text-slate-400 mb-2">{error ? 'Map data could not be loaded' : 'No location data available'}</p>
        <p className="text-sm text-slate-500">
          {error
            ? `${error}. Check that the backend is running and MySQL credentials in backend/.env are correct.`
            : <>Add latitude/longitude coordinates to Locations, then run <code className="text-blue-400">migration.sql</code> to populate them.</>}
        </p>
      </div>
    </div>
  )

  return (
    <div className="fade-in">
      <PageHeader
        title="Crime Heatmap"
        subtitle={`${crimes.length} crimes mapped across ${stats.length} locations`}
        icon={MapPin}
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={15} style={{ color: '#ef4444' }} />
            <span className="text-xs text-slate-500 uppercase tracking-wider">Total Crimes</span>
          </div>
          <p className="text-2xl font-bold text-white">{crimes.length}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={15} style={{ color: '#f59e0b' }} />
            <span className="text-xs text-slate-500 uppercase tracking-wider">Hottest City</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats[0]?.city || '—'}</p>
          <p className="text-xs text-slate-500">{stats[0]?.total_crimes} incidents</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={15} style={{ color: '#3b82f6' }} />
            <span className="text-xs text-slate-500 uppercase tracking-wider">Locations</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.length}</p>
          <p className="text-xs text-slate-500">with coordinates</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <select
          className="form-input"
          style={{ width: 200 }}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="">All Crime Types</option>
          {crimeTypes.map(t => <option key={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
          <div
            onClick={() => setShowHeat(!showHeat)}
            className="w-10 h-5 rounded-full transition-all relative"
            style={{ background: showHeat ? '#3b82f6' : '#334155' }}
          >
            <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all"
              style={{ left: showHeat ? '22px' : '2px' }} />
          </div>
          Heatmap overlay
        </label>
        <span className="text-xs text-slate-500 ml-auto">
          Showing {filtered.length} crime{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Map */}
      <div className="glass-card overflow-hidden" style={{ height: 520 }}>
        <MapContainer
          center={[22.5, 82.0]}
          zoom={5}
          style={{ height: '100%', width: '100%', background: '#0a0f1e' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {showHeat && filtered.length > 0 && <HeatLayer points={filtered} />}
          {filtered.map(crime => (
            <CircleMarker
              key={crime.crime_id}
              center={[crime.latitude, crime.longitude]}
              radius={6}
              pathOptions={{
                fillColor: CRIME_COLORS[crime.crime_type] || defaultColor,
                fillOpacity: 0.85,
                color: '#fff',
                weight: 1,
              }}
            >
              <Tooltip>
                <div className="text-xs">
                  <strong>#{crime.crime_id} — {crime.crime_type}</strong>
                  <br />{crime.city}, {new Date(crime.date).toLocaleDateString()}
                  <br />Status: {crime.status}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* City breakdown table */}
      {stats.length > 0 && (
        <div className="glass-card overflow-hidden mt-5">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.05)' }}>
            <h3 className="text-sm font-semibold text-slate-300">Crime Breakdown by City</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(59,130,246,0.1)', background: 'rgba(59,130,246,0.03)' }}>
                {['City', 'Total', 'Open', 'Under Investigation', 'Closed'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map(s => (
                <tr key={s.city} className="table-row">
                  <td className="px-4 py-2.5 font-medium text-slate-200 text-sm">{s.city}</td>
                  <td className="px-4 py-2.5 text-sm font-bold text-white">{s.total_crimes}</td>
                  <td className="px-4 py-2.5 text-sm" style={{ color: '#f59e0b' }}>{s.open_crimes}</td>
                  <td className="px-4 py-2.5 text-sm" style={{ color: '#3b82f6' }}>{s.investigating}</td>
                  <td className="px-4 py-2.5 text-sm" style={{ color: '#10b981' }}>{s.closed_crimes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
