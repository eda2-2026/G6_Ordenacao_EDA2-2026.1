"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GroupInfo {
  id: string;
  name: string;
  role: string;
}

interface GrupoStore {
  activeGroup: GroupInfo | null;
  setActiveGroup: (group: GroupInfo | null) => void;
  clearGroup: () => void;
}

export const useGrupoStore = create<GrupoStore>()(
  persist(
    (set) => ({
      activeGroup: null,
      setActiveGroup: (group) => set({ activeGroup: group }),
      clearGroup: () => set({ activeGroup: null }),
    }),
    {
      name: "konta-grupo",
    }
  )
);
