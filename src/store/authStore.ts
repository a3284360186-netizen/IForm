import { create } from 'zustand'
import api from '@/api'

interface User {
  id: number
  email: string
  nickname: string
  avatar: string
  bio?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, nickname: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.auth.login(email, password)
      const { user, token } = response.data
      localStorage.setItem('token', token)
      set({ user, token, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  register: async (email: string, password: string, nickname: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.auth.register(email, password, nickname)
      const { user, token } = response.data
      localStorage.setItem('token', token)
      set({ user, token, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ user: null, token: null })
      return
    }
    
    set({ isLoading: true })
    try {
      const response = await api.auth.getMe()
      set({ user: response.data, token, isLoading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
