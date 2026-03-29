import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import { Briefcase, TrendingUp, MessageSquare, Award, XCircle, Bell, ArrowRight, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  APPLIED: '#60a5fa', INTERVIEW: '#fbbf24', OFFER: '#4ade80', REJECTED: '#f87171'
}

function StatCard({ label, value, icon, color, sub }) {
  const Icon = icon
  return (
    <div className="stat-card glass card-hover" style={{ border: `1px solid ${color}25` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={20} style={{ color }} />
        </div>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0' }}>{value}</span>
      </div>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    )
  }

  const s = stats?.stats || {}
  const reminders = stats?.upcomingReminders || []
  const recent = stats?.recentApplications || []

  const ringOffset = s.responseRate ? 251 - (s.responseRate / 100) * 251 : 251

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '0.25rem' }}>
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Here's your job search overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Applied" value={s.total || 0} icon={Briefcase} color="#6478f9" />
        <StatCard label="Interviewing" value={s.interview || 0} icon={MessageSquare} color="#fbbf24" />
        <StatCard label="Offers" value={s.offer || 0} icon={Award} color="#4ade80" />
        <StatCard label="Rejected" value={s.rejected || 0} icon={XCircle} color="#f87171" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Response Rate */}
        <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(100,120,249,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>Response Rate</h2>
            <TrendingUp size={18} color="#6478f9" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="score-ring">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(100,120,249,0.1)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#grad)" strokeWidth="8"
                  strokeDasharray="251" strokeDashoffset={ringOffset}
                  strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6478f9" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>{s.responseRate || 0}%</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Status breakdown</div>
              {[['Applied', s.applied, '#60a5fa'], ['Interview', s.interview, '#fbbf24'], ['Offer', s.offer, '#4ade80'], ['Rejected', s.rejected, '#f87171']].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{l}: <strong style={{ color: '#e2e8f0' }}>{v || 0}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(100,120,249,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>Upcoming Reminders</h2>
            <Link to="/reminders" style={{ color: '#6478f9', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {reminders.length === 0 ? (
            <div style={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
              <Bell size={32} style={{ color: '#1e2236', marginBottom: '0.5rem' }} />
              <div>No upcoming reminders</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {reminders.map(r => (
                <div key={r.id} className="glass-light" style={{ borderRadius: '0.75rem', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{r.title}</div>
                  {r.application?.job && (
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{r.application.job.company}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
                    <Calendar size={11} color="#6478f9" />
                    <span style={{ fontSize: '0.7rem', color: '#6478f9' }}>{format(parseISO(r.dueDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(100,120,249,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>Recent Applications</h2>
          <Link to="/kanban" style={{ color: '#6478f9', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
            View Kanban <ArrowRight size={12} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div style={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
            No applications yet. <Link to="/jobs" style={{ color: '#6478f9' }}>Add your first job →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recent.map(app => (
              <div key={app.id} className="glass-light card-hover" style={{ borderRadius: '0.75rem', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0' }}>{app.job.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.job.company} {app.job.location ? `• ${app.job.location}` : ''}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{format(parseISO(app.appliedDate), 'MMM d')}</span>
                  <span className={`status-${app.status.toLowerCase()}`} style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600 }}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
