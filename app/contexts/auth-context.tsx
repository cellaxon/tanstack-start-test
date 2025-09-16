import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

interface User {
  id: string
  username: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (username: string, password: string): boolean => {
      console.log("Logging in with {}, {}", username, password);
            
    if (username === 'abcd' && password === '1234') {
      const newUser = { id: '1', username }
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      navigate({ to: '/dashboard' })
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    navigate({ to: '/login' })
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}