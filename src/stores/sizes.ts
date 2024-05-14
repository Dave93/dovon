import { create } from "zustand";
import { db } from "../db";

export interface Size {
  id: number;
  length: number;
  thickness: number;
  type: string;
}

interface Sizes {
  items: Size[];
  isLoading: boolean;
  loadSizes: () => void;
}

export const useSizes = create<Sizes>((set) => ({
  isLoading: false,
  items: [],
  loadSizes: async () => {
    set({ isLoading: true });
    const items = await db.select<Size[]>("SELECT * FROM sizes");
    // set({ items, isLoading: false });
  },
}));
