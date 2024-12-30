'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  token: string | null;
  user: { username: string } | null;
  hasHydrated: boolean; // Add this field
  setAuth: (token: string, user: { username: string }) => void;
  logout: () => void;
  setHydrated: () => void; // Method to set hydration
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHydrated: () => set({ hasHydrated: true }), // Set hydration status
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(); // Trigger hydration completion
      },
    }
  )
);