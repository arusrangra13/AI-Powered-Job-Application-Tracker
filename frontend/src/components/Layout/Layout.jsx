import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, Kanban, Briefcase, FileSearch,
  Bell, LogOut, Sparkles, User
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/kanban', icon: Kanban, label: 'Kanban Board' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/resume', icon: FileSearch, label: 'Resume AI' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      {/* Sidebar */}
      <aside className="sidebar glass" style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0', borderRight: '1px solid rgba(100,120,249,0.1)' }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem', padding: '0 0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6478f9, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(100,120,249,0.4)'
            }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>JobTracker</div>
              <div style={{ fontSize: '0.65rem', color: '#6478f9', fontWeight: 600, letterSpacing: '0.05em' }}>AI POWERED</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {navItems.map(({ to, icon, label, end }) => {
            const Icon = icon
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* User section */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(100,120,249,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', marginBottom: '0.25rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6478f9, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <User size={14} color="white" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-item" style={{ color: '#f87171', width: '100%' }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content bg-animated">
        <Outlet />
      </main>
    </div>
  )
}
