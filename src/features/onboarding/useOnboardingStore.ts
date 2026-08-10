import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingPhase =
  | 'registration'
  | 'org-type'
  | 'org-details'
  | 'contact-info'
  | 'done';

interface OnboardingStore {
  phase: OnboardingPhase;
  activeStep: number;
  selectedRole: string | null;
  setPhase: (phase: OnboardingPhase) => void;
  setActiveStep: (step: number) => void;
  setSelectedRole: (role: string | null) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      phase: 'registration',
      activeStep: 0,
      selectedRole: null,
      setPhase: (phase) => set({ phase }),
      setActiveStep: (step) => set({ activeStep: step }),
      setSelectedRole: (role) => set({ selectedRole: role }),
      reset: () => set({ phase: 'registration', activeStep: 0, selectedRole: null }),
    }),
    {
      name: 'flowlee-onboarding',
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
