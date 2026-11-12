// IntelliAttend API Client with dynamic host resolution

import axios from 'axios'

// Dynamically determine the backend base URL.
// When accessing via phone/LAN (e.g., http://192.168.1.4:5173), this connects
// directly to http://192.168.1.4:5000/api without requiring manual IP updates.
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // Relative '/api' leverages Vite's dev proxy, which routes to the backend seamlessly
  // over both HTTP and HTTPS without mixed-content or CORS issues.
  return '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('intelliattend_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Auth
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (data) =>
    api.post('/auth/register', data),
}

// Students
export const studentsAPI = {
  list: () => api.get('/students'),
  create: (data) => api.post('/students', data),
}

// Teachers
export const teachersAPI = {
  list: () => api.get('/teachers'),
  create: (data) => api.post('/teachers', data),
}

// Subjects
export const subjectsAPI = {
  list: () => api.get('/subjects'),
  create: (data) => api.post('/subjects', data),
}

// Attendance Sessions
export const sessionsAPI = {
  list: () => api.get('/attendance-sessions'),
  active: (teacherId) =>
    api.get('/attendance-sessions/active', { params: { teacherId } }),
  start: (data) => api.post('/attendance-sessions/start', data),
  end: (id) => api.post(`/attendance-sessions/end/${id}`),
  qr: (id) => api.get(`/attendance-sessions/qr/${id}`),
  aiVerify: (id) => api.post(`/attendance-sessions/ai-verify/${id}`),
  finalize: (id) => api.post(`/attendance-sessions/finalize/${id}`),
}

// Attendance Records
export const attendanceAPI = {
  list: () => api.get('/attendance-records'),
  mark: (data) => api.post('/attendance-records/mark', data),
  verificationCandidates: (sessionId) =>
    api.get(`/attendance-records/verification/${sessionId}`),
  verify: (attendanceRecordId, status) =>
    api.post(`/attendance-records/verify/${attendanceRecordId}`, { status }),
  randomSelect: (sessionId) =>
    api.post(`/attendance-records/random-select/${sessionId}`),
  selfVerify: (data) =>
    api.post('/attendance-records/self-verify', data),
}

// Penalties
export const penaltiesAPI = {
  list: () => api.get('/penalties'),
  revoke: (id) => api.post(`/penalties/revoke/${id}`),
}

// AI Risk Profiles
export const riskAPI = {
  profile: (studentId) => api.get(`/ai-risk-profile/${studentId}`),
}

// Departments
export const departmentsAPI = {
  list: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
}

// Sections
export const sectionsAPI = {
  list: () => api.get('/sections'),
  create: (data) => api.post('/sections', data),
}

// AI & RAG Chatbot
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  documents: () => api.get('/ai/documents'),
  addDocument: (data) => api.post('/ai/documents', data),
}

export default api