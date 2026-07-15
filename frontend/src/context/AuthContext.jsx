import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, getCurrentUser } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      getCurrentUser(token)
        .then((userData) => {
          setUser(userData)
          setLoading(false)
        })
        .catch(() => {
          setToken(null)
          localStorage.removeItem('token')
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [token])

  async function login(username, password) {
    const data = await loginUser(username, password)
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}