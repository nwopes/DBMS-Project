import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Crimes from './pages/Crimes'
import CrimeDetail from './pages/CrimeDetail'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import FIRs from './pages/FIRs'
import Evidence from './pages/Evidence'
import Officers from './pages/Officers'
import Stations from './pages/Stations'
import Persons from './pages/Persons'
import CourtCases from './pages/CourtCases'
import Locations from './pages/Locations'
import AuditLog from './pages/AuditLog'
import CrimeMap from './pages/CrimeMap'

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a2235',
            color: '#e2e8f0',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '8px',
          },
        }}
      />
      <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
        <Sidebar />
        <main className="flex-1 ml-64 p-6 overflow-auto">
          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/crimes"       element={<Crimes />} />
            <Route path="/crimes/:id"   element={<CrimeDetail />} />
            <Route path="/cases"        element={<Cases />} />
            <Route path="/cases/:id"    element={<CaseDetail />} />
            <Route path="/firs"         element={<FIRs />} />
            <Route path="/evidence"     element={<Evidence />} />
            <Route path="/officers"     element={<Officers />} />
            <Route path="/stations"     element={<Stations />} />
            <Route path="/persons"      element={<Persons />} />
            <Route path="/court-cases"  element={<CourtCases />} />
            <Route path="/locations"    element={<Locations />} />
            <Route path="/audit-log"    element={<AuditLog />} />
            <Route path="/crime-map"    element={<CrimeMap />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
