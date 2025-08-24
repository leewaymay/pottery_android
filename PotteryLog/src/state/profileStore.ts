import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';

interface ProfileState {
  activeProfileId: number | null;
  setActiveProfileId: (id: number | null) => void;
}

export const useActiveProfileStore = create<ProfileState>((set, get) => ({
  activeProfileId: null,
  setActiveProfileId: (id) => {
    set({ activeProfileId: id });
    SecureStore.setItemAsync('activeProfileId', id != null ? String(id) : '');
  },
}));

// Auto-load on module import in app runtime
export function useHydrateActiveProfile() {
  const set = useActiveProfileStore(s => s.setActiveProfileId);
  useEffect(() => {
    (async () => {
      const v = await SecureStore.getItemAsync('activeProfileId');
      if (v) set(Number(v));
    })();
  }, [set]);
}

