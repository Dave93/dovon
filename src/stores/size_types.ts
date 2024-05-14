import { create } from "zustand";
import { db } from "../db";

export interface SizeType {
  id?: number;
  code: string;
  name: string;
}

interface SizeTypesStore {
  items: SizeType[];
  isLoading: boolean;
  loadSizeTypes: () => void;
}

export const useSizeTypes = create<SizeTypesStore>((set) => ({
  isLoading: false,
  items: [],
  loadSizeTypes: async () => {
    set({ isLoading: true });
    const items = await db.select<SizeType[]>("SELECT * FROM size_types");
    set({ items, isLoading: false });
  },
}));
