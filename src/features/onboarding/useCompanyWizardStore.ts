import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompanyWizardFormData {
  orgType: 'company' | 'freelance' | null;
  orgDetails: { companyName: string; teamSize: string; description: string } | null;
  contactInfo: { address: string; email: string; phone: string } | null;
}

export interface CompanyWizardStore {
  /** 0-based active step index (0=org-type, 1=org-details, 2=contact-info, 3=company-settings) */
  activeStep: number;
  /** Whether a transition animation is in progress */
  isTransitioning: boolean;
  /** Form data preserved across step navigation */
  formData: CompanyWizardFormData;
  setActiveStep: (step: number) => void;
  setTransitioning: (v: boolean) => void;
  setOrgType: (type: 'company' | 'freelance') => void;
  setOrgDetails: (data: { companyName: string; teamSize: string; description: string }) => void;
  setContactInfo: (data: { address: string; email: string; phone: string }) => void;
  reset: () => void;
}

const STORAGE_KEY = 'flowlee-company-wizard';

const defaultState = {
  activeStep: 0,
  isTransitioning: false,
  formData: {
    orgType: null as CompanyWizardFormData['orgType'],
    orgDetails: null as CompanyWizardFormData['orgDetails'],
    contactInfo: null as CompanyWizardFormData['contactInfo'],
  },
};

type PersistedCompanyWizardState = Pick<CompanyWizardStore, 'activeStep' | 'formData'>;

export const useCompanyWizardStore = create<CompanyWizardStore>()(
  persist<CompanyWizardStore, [], [], PersistedCompanyWizardState>(
    (set) => ({
      ...defaultState,
      setActiveStep: (step) => set({ activeStep: step }),
      setTransitioning: (v) => set({ isTransitioning: v }),
      setOrgType: (type) =>
        set((state) => ({
          formData: { ...state.formData, orgType: type },
        })),
      setOrgDetails: (data) =>
        set((state) => ({
          formData: { ...state.formData, orgDetails: data },
        })),
      setContactInfo: (data) =>
        set((state) => ({
          formData: { ...state.formData, contactInfo: data },
        })),
      reset: () => set({ ...defaultState }),
    }),
    {
      name: STORAGE_KEY,
      storage: {
        getItem: (name) => {
          try {
            const value = sessionStorage.getItem(name);
            if (!value) return null;
            return JSON.parse(value);
          } catch {
            // Handle sessionStorage corruption by removing bad data and falling back to defaults
            sessionStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            sessionStorage.setItem(name, JSON.stringify(value));
          } catch {
            // Silently fail if sessionStorage is full or unavailable
          }
        },
        removeItem: (name) => {
          try {
            sessionStorage.removeItem(name);
          } catch {
            // Silently fail if sessionStorage is unavailable
          }
        },
      },
      partialize: (state): Pick<CompanyWizardStore, 'activeStep' | 'formData'> => ({
        activeStep: state.activeStep,
        formData: state.formData,
      }),
    }
  )
);
