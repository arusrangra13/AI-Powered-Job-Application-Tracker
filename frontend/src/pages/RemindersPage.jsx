import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Bell, Plus, Check, Trash2, Calendar, Clock, X, AlertCircle } from 'lucide-react'
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns'

const TYPE_COLORS = {
  DEADLINE:  { color: '#f87171', bg: 'rgba(239,68,68,0.1)',   label: 'Deadline' },
  INTERVIEW: { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', label: 'Interview' },
  FOLLOWUP:  { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', label: 'Follow Up' },
  OTHER:     { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'Other' },
}

function getDueBadge(dateStr) {
  const d = parseISO(dateStr)
  if (isPast(d) && !isToday(d)) return { label: 'Overdue', color: '#f87171' }
  if (isToday(d)) return { label: 'Today', color: '#fbbf24' }
  if (isTomorrow(d)) return { label: 'Tomorrow', color: '#60a5fa' }
  return null
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('active') // active | completed | all
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', type: 'DEADLINE' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    api.get('/reminders').then(res => setReminders(res.data.reminders))
      .catch(() => toast.error('Failed to load reminders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = reminders.filter(r => {
    if (filter === 'active') return !r.completed
    if (filter === 'completed') return r.completed
    return true
  })

  const handleCreate = async () => {
    if (!form.title || !form.dueDate) { toast.error('Title and due date are required'); return }
    setSaving(true)
    try {
      const res = await api.post('/reminders', form)
      setReminders(prev => [...prev, res.data.reminder])
      setShowModal(false)
      setForm({ title: '', description: '', dueDate: '', type: 'DEADLINE' })
      toast.success('Reminder created!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create reminder')
    } finally { setSaving(false) }
  }

  const handleComplete = async (id) => {
    await api.put(`/reminders/${id}/complete`)
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r))
    toast.success('Reminder marked complete ✓')
  }

  const handleDelete = async (id) => {
    await api.delete(`/reminders/${id}`)
    setReminders(prev => prev.filter(r => r.id !== id))
    toast.success('Reminder deleted')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={28} style={{ color: '#6478f9' }} />
            Reminders
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Track application deadlines and interview schedules
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Reminder
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[['active', 'Active'], ['completed', 'Completed'], ['all', 'All']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{
              padding: '0.375rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: filter === val ? 'linear-gradient(135deg, #6478f9, #a78bfa)' : 'rgba(37,41,67,0.7)',
              color: filter === val ? 'white' : '#64748b',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#475569' }}>
          <Bell size={48} style={{ color: '#1e2236', marginBottom: '1rem' }} />
          <div style={{ fontSize: '1rem', color: '#64748b' }}>No {filter === 'all' ? '' : filter} reminders</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(r => {
            const typeStyle = TYPE_COLORS[r.type] || TYPE_COLORS.OTHER
            const dueBadge = getDueBadge(r.dueDate)
            return (
              <div key={r.id} className={`glass card-hover ${r.completed ? '' : ''}`}
                style={{ borderRadius: '1rem', padding: '1.25rem', border: `1px solid ${typeStyle.color}22`, opacity: r.completed ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: r.completed ? '#475569' : '#e2e8f0', textDecoration: r.completed ? 'line-through' : 'none' }}>
                        {r.title}
                      </span>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 600, background: typeStyle.bg, color: typeStyle.color }}>
                        {typeStyle.label}
                      </span>
                      {dueBadge && !r.completed && (
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, background: `${dueBadge.color}20`, color: dueBadge.color, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <AlertCircle size={10} /> {dueBadge.label}
                        </span>
                      )}
                    </div>
                    {r.description && <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.375rem' }}>{r.description}</div>}
                    {r.application?.job && (
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                        📎 {r.application.job.title} at {r.application.job.company}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <Calendar size={12} />
                      {format(parseISO(r.dueDate), 'MMM d, yyyy')}
                    </div>
                    {!r.completed && (
                      <button onClick={() => handleComplete(r.id)}
                        style={{ padding: '0.375rem', borderRadius: '0.5rem', background: 'rgba(34,197,94,0.1)', border: 'none', cursor: 'pointer', color: '#4ade80', display: 'flex' }}
                        title="Mark complete">
                        <Check size={15} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(r.id)}
                      style={{ padding: '0.375rem', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>New Reminder</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Title *</label>
                <input className="input-base" placeholder="e.g. Interview at Google" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Due Date *</label>
                <input type="datetime-local" className="input-base" value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Type</label>
                <select className="input-base" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ background: 'rgba(22,25,41,0.8)' }}>
                  {Object.entries(TYPE_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Description</label>
                <textarea className="input-base" rows={2} placeholder="Additional notes..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleCreate} disabled={saving}>
                  {saving ? <div className="spinner" /> : <Bell size={16} />}
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
