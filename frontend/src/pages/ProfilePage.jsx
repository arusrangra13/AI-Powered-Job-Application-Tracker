import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, setState } = useAuthStore(state => ({
    user: state.user,
    setState: state.setState,
  }))

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, password: '' })
    } else {
      api.get('/auth/me')
        .then(res => {
          const current = res.data.user || {}
          setForm({ name: current.name || '', email: current.email || '', password: '' })
          setState({ user: current })
        })
        .catch(err => {
          console.error(err)
          toast.error('Unable to load profile')
        })
    }
  }, [user, setState])

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = { name: form.name, email: form.email }
      if (form.password) payload.password = form.password

      const res = await api.put('/auth/me', payload)
      setState({ user: res.data.user })
      toast.success('Profile updated successfully')
      setForm(prev => ({ ...prev, password: '' }))
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update profile'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-color)' }}>Profile</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Update your account details.</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.85rem', maxWidth: '420px' }}>
        <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Name
          <input
            type="text"
            className="input-base"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </label>

        <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Email
          <input
            type="email"
            className="input-base"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </label>

        <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          New Password (leave blank to keep current)
          <input
            type="password"
            className="input-base"
            value={form.password}
            onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
          />
        </label>

        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
