import { create } from 'zustand';

export interface RegistrationData {
  name: string;
  surname: string;
  gender: 'male' | 'female' | 'other' | '';
  birthDate: string;
  jobTitle: string;
  selectedPhotoFile: File | null;
}

interface RegistrationStore extends RegistrationData {
  setField: <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => void;
  setPhoto: (file: File | null) => void;
  reset: () => void;
}

const defaultState: RegistrationData = {
  name: '',
  surname: '',
  gender: '',
  birthDate: '',
  jobTitle: '',
  selectedPhotoFile: null,
};

export const useRegistrationStore = create<RegistrationStore>()((set) => ({
  ...defaultState,
  setField: (key, value) => set({ [key]: value }),
  setPhoto: (file) => set({ selectedPhotoFile: file }),
  reset: () => set({ ...defaultState }),
}));
