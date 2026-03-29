import { useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { FileSearch, Sparkles, CheckCircle, XCircle, Lightbulb, Upload, BarChart2 } from 'lucide-react'

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.error('Please enter both resume text and job description')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/analyze/resume', { resumeText, jobDescription })
      setResult(res.data)
      toast.success('Analysis complete!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const score = result?.score || 0
  const scoreColor = score >= 75 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171'
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSearch size={28} style={{ color: '#6478f9' }} />
          Resume AI Analyzer
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Paste your resume and job description to get an AI-powered compatibility score and improvement suggestions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Resume Input */}
        <div>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            <Upload size={14} color="#6478f9" /> Your Resume
          </label>
          <textarea
            className="input-base"
            style={{ height: '320px', resize: 'vertical', lineHeight: 1.6 }}
            placeholder="Paste your resume content here...&#10;&#10;Include your skills, experience, education, and any relevant projects."
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
          />
          <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.375rem' }}>
            {resumeText.length} characters
          </div>
        </div>

        {/* Job Description Input */}
        <div>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            <FileSearch size={14} color="#6478f9" /> Job Description
          </label>
          <textarea
            className="input-base"
            style={{ height: '320px', resize: 'vertical', lineHeight: 1.6 }}
            placeholder="Paste the job description here...&#10;&#10;Include requirements, responsibilities, and preferred qualifications."
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
          />
          <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.375rem' }}>
            {jobDescription.length} characters
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          className="btn-primary"
          onClick={handleAnalyze}
          disabled={loading}
          style={{ padding: '0.875rem 2.5rem', fontSize: '1rem' }}
        >
          {loading ? (
            <>
              <div className="spinner" /> Analyzing with AI...
            </>
          ) : (
            <>
              <Sparkles size={18} /> Analyze Resume
            </>
          )}
        </button>
        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.5rem' }}>
          Powered by spaCy + HuggingFace sentence transformers
        </div>
      </div>

      {result && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Score + Skills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Score Ring */}
            <div className="glass" style={{ borderRadius: '1.25rem', padding: '2rem 1.5rem', textAlign: 'center', border: '1px solid rgba(100,120,249,0.12)' }}>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Match Score
              </div>
              <div className="score-ring">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(100,120,249,0.1)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="45" fill="none" stroke={scoreColor} strokeWidth="10"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${scoreColor}88)` }} />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: scoreColor }}>{score}%</div>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                {score >= 75 ? '🎉 Excellent match!' : score >= 50 ? '✅ Good match' : '⚠️ Needs work'}
              </div>
              {result.method && (
                <div style={{ fontSize: '0.65rem', color: '#334155', marginTop: '0.5rem', padding: '0.2rem 0.5rem', background: 'rgba(100,120,249,0.05)', borderRadius: '9999px' }}>
                  via {result.method === 'nlp' ? 'Sentence Transformers' : result.method === 'tfidf' ? 'TF-IDF' : 'Keyword matching'}
                </div>
              )}
            </div>

            {/* Matched Skills */}
            <div className="glass" style={{ borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid rgba(34,197,94,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle size={18} color="#4ade80" />
                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>
                  Matched Skills ({result.matched_skills?.length || 0})
                </span>
              </div>
              {(result.matched_skills?.length || 0) === 0 ? (
                <div style={{ color: '#475569', fontSize: '0.8rem' }}>No common skills found</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {result.matched_skills.map(skill => (
                    <span key={skill} className="chip chip-green">{skill}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills */}
            <div className="glass" style={{ borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid rgba(239,68,68,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <XCircle size={18} color="#f87171" />
                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>
                  Missing Skills ({result.missing_skills?.length || 0})
                </span>
              </div>
              {(result.missing_skills?.length || 0) === 0 ? (
                <div style={{ color: '#4ade80', fontSize: '0.8rem' }}>✅ All required skills matched!</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {result.missing_skills.map(skill => (
                    <span key={skill} className="chip chip-red">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="glass" style={{ borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid rgba(167,139,250,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Lightbulb size={18} color="#a78bfa" />
                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>AI Improvement Suggestions</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.suggestions.map((s, i) => (
                  <div key={i} className="glass-light" style={{ borderRadius: '0.75rem', padding: '0.875rem 1rem', display: 'flex', gap: '0.75rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #6478f9, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.65rem', fontWeight: 700, color: 'white' }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
