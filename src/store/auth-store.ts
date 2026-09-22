import { create } from "zustand"
import { createJSONStorage, persist, StateStorage } from "zustand/middleware"

import { logoutAction, revalidateTokensAction } from "@/features/auth/actions"
import { User } from "@/features/auth/types"

const STORE_KEY = "temp_auth"

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

type AuthState = {
  user: User | null

  state: "loading" | "success" // TODO: Rethink about this

  accessToken: string | null
  refreshToken: string | null
}

type AuthActions = {
  setUser: (user: User) => void
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void
  setState: (state: AuthState["state"]) => void
  setTokensAndRevalidate: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>
  logout: () => Promise<void>
  logoutWithReload: () => Promise<void>
}

const initialState: AuthState = {
  user: null,
  state: "loading",
  accessToken: null,
  refreshToken: null,
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user, state: "success" }),

      setTokens: (tokens) =>
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),

      setState: (state) => set({ state }),

      setTokensAndRevalidate: async (tokens) => {
        get().setTokens(tokens)
        await revalidateTokensAction(tokens.accessToken, tokens.refreshToken)
      },

      logout: async () => {
        await logoutAction()
        set({ user: null, accessToken: null, refreshToken: null })
      },

      logoutWithReload: async () => {
        await get().logout()
        window.location.reload()
      },
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : noopStorage)),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)
