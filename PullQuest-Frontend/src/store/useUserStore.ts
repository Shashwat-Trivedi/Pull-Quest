// src/store/useUserStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  // ...any other fields you need
}

interface UserState {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'pullquest-user', // the key in localStorage
      // no storage field needed—defaults to window.localStorage
    }
  )
)
