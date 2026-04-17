import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart
} from 'recharts'
import {
  AlertTriangle, FolderOpen, Shield, Building2, Users,
  FileText, Package, Gavel, CheckCircle, Clock
} from 'lucide-react'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'

const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#f97316']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0d1425', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, padding: '8px 14px' }}>
        <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#60a5fa', fontWeight: 600, fontSize: 14 }}>{p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [byType, setByType] = useState([])
  const [byCity, setByCity] = useState([])
  const [byMonth, setByMonth] = useState([])
  const [recentCrimes, setRecentCrimes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t, c, m, r] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/crimes-by-type'),
          axios.get('/api/dashboard/crimes-by-city'),
          axios.get('/api/dashboard/crimes-by-month'),
          axios.get('/api/dashboard/recent-crimes'),
        ])
        setStats(s.data)
        setByType(t.data)
        setByCity(c.data)
        setByMonth(m.data)
        setRecentCrimes(r.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)' }} />
          <h1 className="text-2xl font-bold text-white">Command Dashboard</h1>
        </div>
        <p className="text-slate-400 text-sm ml-5">Real-time overview of the Crime Management System</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Crimes" value={stats?.totalCrimes} icon={AlertTriangle} color="red" subtitle="All recorded incidents" />
        <StatCard title="Open Cases" value={stats?.openCases} icon={FolderOpen} color="blue" subtitle="Awaiting resolution" />
        <StatCard title="Closed Cases" value={stats?.closedCases} icon={CheckCircle} color="green" subtitle="Successfully closed" />
        <StatCard title="Under Investigation" value={stats?.underInvestigation} icon={Clock} color="yellow" subtitle="Active investigations" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Police Officers" value={stats?.officers} icon={Shield} color="purple" />
        <StatCard title="Police Stations" value={stats?.stations} icon={Building2} color="cyan" />
        <StatCard title="FIRs Filed" value={stats?.firs} icon={FileText} color="orange" />
        <StatCard title="Evidence Items" value={stats?.evidence} icon={Package} color="pink" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Crimes by Type - Pie */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Crimes by Type
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byType} dataKey="count" nameKey="crime_type" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Crimes by City - Bar */}
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Crimes by City
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCity} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="city" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total_crimes" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {byCity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Monthly Trend */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Monthly Crime Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={byMonth} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Crimes Table */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Recent Incidents
          </h3>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 200 }}>
            {recentCrimes.map((c) => (
              <div key={c.crime_id} className="flex items-center justify-between py-2 table-row">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{c.crime_type}</p>
                  <p className="text-xs text-slate-500">{c.city}, {c.state} · {c.date?.slice(0, 10)}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
