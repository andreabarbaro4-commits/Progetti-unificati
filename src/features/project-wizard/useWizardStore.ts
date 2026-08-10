import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, MessageRole } from '../../mock/fixtures/types';

export interface WizardFormData {
  name: string;
  brief: string;
  owner: string;
  deadline: string;
  budget: string;
  type: string;
  thumbnail?: string;
}

export interface WizardAnalysis {
  milestones: Array<{ id: string; name: string; date: string; taskIds: string[] }>;
  tasks: Array<{
    id: string;
    milestoneId: string;
    name: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  risks: Array<{ id: string; description: string; severity: 'high' | 'medium' | 'low' }>;
  openQuestions: string[];
}

export interface WizardChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: string;
}

interface WizardStore {
  // Step 1 form data
  formData: WizardFormData;
  setFormData: (data: Partial<WizardFormData>) => void;

  // Analysis data (step 2)
  analysis: WizardAnalysis | null;
  setAnalysis: (analysis: WizardAnalysis | null) => void;

  // Chat messages (wizard chat panel)
  chatMessages: WizardChatMessage[];
  addChatMessage: (message: WizardChatMessage) => void;
  clearChatMessages: () => void;

  // Team selection (step 3)
  selectedMembers: string[];
  setSelectedMembers: (members: string[]) => void;
  toggleMember: (memberId: string) => void;

  // Mock document drag state
  usedMockDocument: boolean;
  setUsedMockDocument: (used: boolean) => void;

  // Reset
  reset: () => void;
}

const defaultFormData: WizardFormData = {
  name: '',
  brief: '',
  owner: '',
  deadline: '',
  budget: '',
  type: '',
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      setFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),

      analysis: null,
      setAnalysis: (analysis) => set({ analysis }),

      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => ({ chatMessages: [...state.chatMessages, message] })),
      clearChatMessages: () => set({ chatMessages: [] }),

      selectedMembers: [],
      setSelectedMembers: (members) => set({ selectedMembers: members }),
      toggleMember: (memberId) =>
        set((state) => ({
          selectedMembers: state.selectedMembers.includes(memberId)
            ? state.selectedMembers.filter((id) => id !== memberId)
            : [...state.selectedMembers, memberId],
        })),

      usedMockDocument: false,
      setUsedMockDocument: (used) => set({ usedMockDocument: used }),

      reset: () =>
        set({
          formData: defaultFormData,
          analysis: null,
          chatMessages: [],
          selectedMembers: [],
          usedMockDocument: false,
        }),
    }),
    {
      name: 'flowlee-wizard',
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
