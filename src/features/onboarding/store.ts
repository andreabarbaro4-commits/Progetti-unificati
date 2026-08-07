import { create } from 'zustand';

interface OnboardingStore {
  activeStep: number;
  selectedRole: string | null;
  setActiveStep: (step: number) => void;
  setSelectedRole: (role: string | null) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  activeStep: 0,
  selectedRole: null,
  setActiveStep: (step) => set({ activeStep: step }),
  setSelectedRole: (role) => set({ selectedRole: role }),
  reset: () => set({ activeStep: 0, selectedRole: null }),
}));
