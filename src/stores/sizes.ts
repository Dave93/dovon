import { create } from "zustand";
import { database } from "../db";

export interface Size {
  id?: number;
  length: number;
  thickness: number;
  type: string;
}

interface Sizes {
  items: Size[];
  isLoading: boolean;
  isInsertingSize: boolean;
  isAddFormOpen: boolean;
  onCancelAdd: () => void;
  onAdd: () => void;
  loadSizes: () => void;
  insertSize: (size: Size) => void;
  getSize: (id: number) => Size | undefined;
}

export const useSizes = create<Sizes>((set, get) => ({
  isLoading: false,
  items: [],
  isAddFormOpen: false,
  onCancelAdd: () => set({ isAddFormOpen: false }),
  onAdd: () => set({ isAddFormOpen: true }),
  isInsertingSize: false,
  insertSize: async (size) => {
    const db = await database();
    set({ isInsertingSize: true });
    await db.execute(
      "INSERT INTO sizes (length, thickness, type) VALUES (?, ?, ?)",
      [size.length, size.thickness, size.type]
    );
    const items = await db.select<Size[]>("SELECT * FROM sizes");
    set({ isInsertingSize: false, isAddFormOpen: false, items });
  },
  loadSizes: async () => {
    const db = await database();
    set({ isLoading: true });
    const items = await db.select<Size[]>("SELECT * FROM sizes");
    set({ items, isLoading: false });
  },
  getSize: (id) => get().items.find((item) => item.id === id),
}));
