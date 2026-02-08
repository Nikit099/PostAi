import { create } from 'zustand'
import { AppState, User, ConnectedAccount } from '@/types'

interface AppStore extends AppState {
  setUser: (user: User | null) => void
  setAccounts: (accounts: ConnectedAccount[]) => void
  addAccount: (account: ConnectedAccount) => void
  removeAccount: (accountId: string) => void
  setCurrentPost: (post: AppState['currentPost']) => void
  setLoading: (isLoading: boolean) => void
  clearCurrentPost: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  accounts: [],
  currentPost: null,
  isLoading: false,

  setUser: (user) => set({ user }),
  
  setAccounts: (accounts) => set({ accounts }),
  
  addAccount: (account) => 
    set((state) => ({ 
      accounts: [...state.accounts, account] 
    })),
  
  removeAccount: (accountId) =>
    set((state) => ({
      accounts: state.accounts.filter(acc => acc.id !== accountId)
    })),

  setCurrentPost: (post) => set({ currentPost: post }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  clearCurrentPost: () => set({ currentPost: null }),
}))