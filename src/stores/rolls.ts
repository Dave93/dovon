import { database } from "@/db";
import { create } from "zustand";

interface Roll {
  id?: number;
  roll_number: string;
  brutto: number;
  netto: number;
  order_id: number;
}

interface Rolls {
  items: Roll[];
  isLoading: boolean;
  isInsertingRoll: boolean;
  loadRolls: (order_id: number) => void;
  insertRoll: (roll: Roll) => void;
  getRoll: (id: number) => Roll | undefined;
}

export const useRolls = create<Rolls>((set, get) => ({
  isLoading: false,
  items: [],
  isInsertingRoll: false,
  isAddFormOpen: false,
  loadRolls: async (order_id) => {
    set({ isLoading: true });
    const db = await database();
    db.execute("SELECT * FROM rolls WHERE order_id = ?", [order_id]);
    const items = await db.select<Roll[]>("SELECT * FROM rolls");
    set({ isLoading: false, items });
  },
  insertRoll: async (roll) => {
    set({ isInsertingRoll: true });
    const db = await database();
    await db.execute(
      "INSERT INTO rolls (roll_number, brutto, netto, order_id) VALUES (?, ?, ?, ?)",
      [roll.roll_number, roll.brutto, roll.netto, roll.order_id]
    );
    const items = await db.select<Roll[]>("SELECT * FROM rolls");
    set({ isInsertingRoll: false, items });
  },
  getRoll: (id) => get().items.find((item) => item.id === id),
}));
