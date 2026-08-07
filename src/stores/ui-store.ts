import { create } from 'zustand';

interface UiStore {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarCollapsed: false,
  theme: 'light',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
}));
