import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Briefcase, Plus, Search, Trash2, ExternalLink, X, MapPin, DollarSign, Link } from 'lucide-react'

function JobModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { title: '', company: '', location: '', description: '', url: '', salary: '' })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title || !form.company) { toast.error('Title and company are required'); return }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>{initial ? 'Edit Job' : 'Add New Job'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            { key: 'title', label: 'Job Title *', placeholder: 'Software Engineer' },
            { key: 'company', label: 'Company *', placeholder: 'Google' },
            { key: 'location', label: 'Location', placeholder: 'San Francisco, CA (Remote)' },
            { key: 'url', label: 'Job URL', placeholder: 'https://...' },
            { key: 'salary', label: 'Salary Range', placeholder: '$120k - $160k' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>{label}</label>
              <input className="input-base" placeholder={placeholder} value={form[key]}
                onChange={e => set(key, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Job Description</label>
            <textarea className="input-base" rows={4} placeholder="Paste job description here for AI resume matching..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <div className="spinner" /> : <Plus size={16} />}
              {initial ? 'Save Changes' : 'Add Job'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editJob, setEditJob] = useState(null)

  const load = useCallback(() => {
    api.get(`/jobs?search=${search}`)
      .then(res => setJobs(res.data.jobs))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => { load() }, [load])

  const handleCreate = async (form) => {
    const res = await api.post('/jobs', form)
    setJobs(prev => [res.data.job, ...prev])
    toast.success('Job added!')
  }

  const handleUpdate = async (form) => {
    const res = await api.put(`/jobs/${editJob.id}`, form)
    setJobs(prev => prev.map(j => j.id === editJob.id ? res.data.job : j))
    toast.success('Job updated!')
    setEditJob(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this job?')) return
    await api.delete(`/jobs/${id}`)
    setJobs(prev => prev.filter(j => j.id !== id))
    toast.success('Job deleted')
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={28} style={{ color: 'var(--accent-strong)' }} />
            Jobs
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage your job listings</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Job
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input-base" style={{ paddingLeft: '2.5rem' }} placeholder="Search jobs..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Job Grid */}
      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Briefcase size={48} style={{ color: 'var(--surface-border)', marginBottom: '1rem' }} />
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>No jobs yet. Add your first job!</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {jobs.map(job => (
            <div key={job.id} className="glass card-hover" style={{ borderRadius: '1rem', padding: '1.25rem', border: '1px solid rgba(148,163,184,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '0.2rem' }}>{job.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{job.company}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer"
                      style={{ padding: '0.3rem', borderRadius: '0.375rem', color: 'var(--accent-strong)', background: 'rgba(148,163,184,0.15)', display: 'flex' }}>
                      <ExternalLink size={13} />
                    </a>
                  )}
                  <button onClick={() => { setEditJob(job); setShowModal(true) }}
                    style={{ padding: '0.3rem', borderRadius: '0.375rem', color: '#94a3b8', background: 'rgba(100,120,249,0.05)', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(job.id)}
                    style={{ padding: '0.3rem', borderRadius: '0.375rem', color: '#f87171', background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {job.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <MapPin size={12} /> {job.location}
                  </div>
                )}
                {job.salary && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#4ade80' }}>
                    <DollarSign size={12} /> {job.salary}
                  </div>
                )}
              </div>

              {job.description && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {(showModal || editJob) && (
        <JobModal
          initial={editJob}
          onClose={() => { setShowModal(false); setEditJob(null) }}
          onSave={editJob ? handleUpdate : handleCreate}
        />
      )}
    </div>
  )
}
