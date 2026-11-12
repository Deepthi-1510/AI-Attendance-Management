import { createContext, useContext, useState } from 'react'
import { authAPI } from '../api/axios'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('intelliattend_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('intelliattend_token') || null)

  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('intelliattend_user', JSON.stringify(userData))
    localStorage.setItem('intelliattend_token', jwtToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('intelliattend_user')
    localStorage.removeItem('intelliattend_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}
