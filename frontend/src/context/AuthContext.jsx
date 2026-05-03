import { useState, useEffect } from 'react'
import { getMe } from '../api/auth'
import { AuthContext } from './authContext.js'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const data = await getMe(token)
          setUser(data)
        } catch {
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}