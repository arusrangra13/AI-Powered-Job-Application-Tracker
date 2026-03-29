import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Remove stale token
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('jobtracker-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
