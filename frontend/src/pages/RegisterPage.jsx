import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Sparkles, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    const result = await registerUser(form.name, form.email, form.password)
    if (!result.success) toast.error(result.error)
    else toast.success('Account created! Welcome 🎉')
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(-45deg, #090b14, #0f1120, #161929, #1a1c2e)',
      backgroundSize: '400% 400%',
      animation: 'gradient-shift 15s ease infinite',
      padding: '1rem',
    }}>
      <div style={{ position: 'fixed', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,120,249,0.08) 0%, transparent 70%)', top: '-100px', left: '-100px', pointerEvents: 'none' }} />

      <div className="glass" style={{ width: '100%', maxWidth: '420px', borderRadius: '1.5rem', padding: '2.5rem', border: '1px solid rgba(100,120,249,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6478f9, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 40px rgba(100,120,249,0.4)',
          }}>
            <Sparkles size={26} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0' }}>Get started</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Create your AI job tracker account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
            <input id="register-name" type="text" className="input-base" placeholder="John Doe"
              value={form.name} onChange={e => set('name', e.target.value)} required autoFocus />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Email</label>
            <input id="register-email" type="email" className="input-base" placeholder="john@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input id="register-password" type={showPass ? 'text' : 'password'} className="input-base"
                placeholder="Min 8 characters" value={form.password}
                onChange={e => set('password', e.target.value)} required style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div style={{ marginTop: '0.375rem' }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${Math.min(100, (form.password.length / 12) * 100)}%`,
                    background: form.password.length < 8 ? '#f87171' : form.password.length < 10 ? '#fbbf24' : '#4ade80',
                  }} />
                </div>
                <div style={{ fontSize: '0.65rem', color: form.password.length < 8 ? '#f87171' : '#4ade80', marginTop: '0.2rem' }}>
                  {form.password.length < 8 ? 'Too short' : form.password.length < 10 ? 'OK' : 'Strong'}
                </div>
              </div>
            )}
          </div>
          <button id="register-submit" type="submit" className="btn-primary" disabled={isLoading}
            style={{ marginTop: '0.5rem', justifyContent: 'center', padding: '0.875rem' }}>
            {isLoading ? <><div className="spinner" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6478f9', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
        </div>
      </div>
    </div>
  )
}
