import { create } from "zustand";
import { database } from "../db";

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
    const db = await database();
    set({ isLoading: true });
    const items = await db.select<SizeType[]>("SELECT * FROM size_types");
    set({ items, isLoading: false });
  },
}));
