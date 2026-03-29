import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Kanban, Plus, Briefcase, Calendar, GripVertical, ExternalLink, FileSearch, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const COLUMNS = [
  { id: 'APPLIED',   label: 'Applied',        color: '#60a5fa', accent: 'rgba(59,130,246,0.15)' },
  { id: 'INTERVIEW', label: 'Interview',       color: '#fbbf24', accent: 'rgba(245,158,11,0.15)' },
  { id: 'OFFER',     label: 'Offer',           color: '#4ade80', accent: 'rgba(34,197,94,0.15)' },
  { id: 'REJECTED',  label: 'Rejected',        color: '#f87171', accent: 'rgba(239,68,68,0.15)' },
]

function JobCard({ app, isDragging }) {
  return (
    <div className="glass card-hover" style={{
      borderRadius: '0.875rem', padding: '1rem',
      border: '1px solid rgba(100,120,249,0.1)',
      opacity: isDragging ? 0.5 : 1,
      cursor: 'grab',
      marginBottom: '0.625rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {app.job.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
            {app.job.company}{app.job.location ? ` • ${app.job.location}` : ''}
          </div>
        </div>
        <GripVertical size={14} color="#334155" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
      </div>
      {app.resumeAnalysis && (
        <div style={{ marginTop: '0.375rem', marginBottom: '0.5rem' }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${app.resumeAnalysis.compatibilityScore}%` }} />
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem' }}>
            {app.resumeAnalysis.compatibilityScore}% match
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={10} color="#475569" />
          <span style={{ fontSize: '0.65rem', color: '#475569' }}>
            {format(parseISO(app.appliedDate), 'MMM d')}
          </span>
        </div>
        {app.job.url && (
          <a href={app.job.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#6478f9' }}>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  )
}

function SortableCard({ app }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <JobCard app={app} isDragging={isDragging} />
    </div>
  )
}

function Column({ col, apps, onAdd }) {
  return (
    <div className="kanban-col" style={{ borderTop: `3px solid ${col.color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: col.color }}>{col.label}</span>
          <span style={{ background: col.accent, color: col.color, borderRadius: '9999px', padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>{apps.length}</span>
        </div>
        <button onClick={() => onAdd(col.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '0.25rem', borderRadius: '0.375rem', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = col.color}
          onMouseLeave={e => e.target.style.color = '#475569'}>
          <Plus size={16} />
        </button>
      </div>
      <SortableContext items={apps.map(a => a.id)} strategy={verticalListSortingStrategy}>
        {apps.map(app => <SortableCard key={app.id} app={app} />)}
      </SortableContext>
      {apps.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: '#334155', fontSize: '0.8rem' }}>
          Drop cards here
        </div>
      )}
    </div>
  )
}

export default function KanbanPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeApp, setActiveApp] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addStatus, setAddStatus] = useState('APPLIED')
  const [jobs, setJobs] = useState([])
  const [form, setForm] = useState({ jobId: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    Promise.all([
      api.get('/applications'),
      api.get('/jobs'),
    ]).then(([appRes, jobRes]) => {
      setApplications(appRes.data.applications)
      setJobs(jobRes.data.jobs)
    }).catch(() => toast.error('Failed to load Kanban'))
      .finally(() => setLoading(false))
  }, [])

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = applications.filter(a => a.status === col.id)
    return acc
  }, {})

  const handleDragStart = ({ active }) => {
    setActiveApp(applications.find(a => a.id === active.id))
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveApp(null)
    if (!over) return

    const activeApp = applications.find(a => a.id === active.id)
    if (!activeApp) return

    // Determine target column
    const targetCol = COLUMNS.find(c => c.id === over.id) ||
      COLUMNS.find(c => grouped[c.id].some(a => a.id === over.id))

    if (!targetCol || targetCol.id === activeApp.status) return

    // Optimistic update
    setApplications(prev => prev.map(a => a.id === activeApp.id ? { ...a, status: targetCol.id } : a))

    try {
      await api.put(`/applications/${activeApp.id}/status`, { status: targetCol.id })
      toast.success(`Moved to ${targetCol.label}`)
    } catch {
      setApplications(prev => prev.map(a => a.id === activeApp.id ? { ...a, status: activeApp.status } : a))
      toast.error('Failed to update status')
    }
  }

  const handleAdd = (status) => {
    setAddStatus(status)
    setForm({ jobId: '', notes: '' })
    setShowAddModal(true)
  }

  const handleSave = async () => {
    if (!form.jobId) { toast.error('Please select a job'); return }
    setSaving(true)
    try {
      const res = await api.post('/applications', { ...form, status: addStatus })
      const newApp = { ...res.data.application, status: addStatus }
      setApplications(prev => [...prev, newApp])
      setShowAddModal(false)
      toast.success('Application added!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add application')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Kanban size={28} style={{ color: '#6478f9' }} />
            Kanban Board
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Drag and drop applications to update their status
          </p>
        </div>
        <button onClick={() => handleAdd('APPLIED')} className="btn-primary">
          <Plus size={16} /> Add Application
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {COLUMNS.map(col => (
            <Column key={col.id} col={col} apps={grouped[col.id] || []} onAdd={handleAdd} />
          ))}
        </div>
        <DragOverlay>
          {activeApp && <JobCard app={activeApp} isDragging={false} />}
        </DragOverlay>
      </DndContext>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>Add Application</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Select Job</label>
                <select className="input-base" value={form.jobId} onChange={e => setForm(f => ({ ...f, jobId: e.target.value }))}
                  style={{ background: 'rgba(22,25,41,0.8)' }}>
                  <option value="">-- Select a job --</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.title} — {j.company}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Status</label>
                <select className="input-base" value={addStatus} onChange={e => setAddStatus(e.target.value)}
                  style={{ background: 'rgba(22,25,41,0.8)' }}>
                  {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Notes</label>
                <textarea className="input-base" rows={3} placeholder="Any notes..." value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <div className="spinner" /> : <Plus size={16} />}
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
