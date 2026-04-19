import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, AlertTriangle, FolderOpen, FileText,
  Package, Users, Shield, Building2, Gavel, MapPin, ShieldCheck,
  ClipboardList, Map
} from 'lucide-react'

const navGroups = [
  {
    label: 'Core',
    items: [
      { path: '/',           icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/crimes',     icon: AlertTriangle,   label: 'Crimes' },
      { path: '/cases',      icon: FolderOpen,      label: 'Case Files' },
      { path: '/firs',       icon: FileText,        label: 'FIRs' },
      { path: '/evidence',   icon: Package,         label: 'Evidence' },
      { path: '/court-cases',icon: Gavel,           label: 'Court Cases' },
    ],
  },
  {
    label: 'Directory',
    items: [
      { path: '/officers',   icon: Shield,          label: 'Police Officers' },
      { path: '/stations',   icon: Building2,       label: 'Police Stations' },
      { path: '/persons',    icon: Users,           label: 'Persons' },
      { path: '/locations',  icon: MapPin,          label: 'Locations' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { path: '/crime-map',  icon: Map,             label: 'Crime Heatmap' },
      { path: '/audit-log',  icon: ClipboardList,   label: 'Audit Log' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50"
      style={{
        background: 'linear-gradient(180deg, #0d1425 0%, #0a0f1e 100%)',
        borderRight: '1px solid rgba(59,130,246,0.15)',
      }}>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(59,130,246,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center pulse-glow"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Crime Management</p>
            <p className="text-xs" style={{ color: '#60a5fa' }}>System v2.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-1.5"
              style={{ color: '#334155' }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                  style={({ isActive }) => isActive ? {
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.1))',
                    border: '1px solid rgba(59,130,246,0.3)',
                    color: '#60a5fa',
                  } : {}}
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t text-xs text-slate-500" style={{ borderColor: 'rgba(59,130,246,0.15)' }}>
        <p>DBMS Course Project</p>
        <p style={{ color: '#3b82f6' }}>© 2024 Group 5</p>
      </div>
    </aside>
  )
}
