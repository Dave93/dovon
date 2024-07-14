import { create } from "zustand";
import { database } from "../db";

export interface Pallet {
  id?: number;
  order_id: number;
  pallet_number: number;
}

interface PalletStore {
  palet?: Pallet;
  isLoading: boolean;
  isInsertingPallet: boolean;
  loadLastPallet: (order_id: number) => void;
  insertPallet: (pallet: Pallet) => void;
  getPallet: () => Pallet | undefined;
}

export const usePallets = create<PalletStore>((set, get) => ({
  isLoading: false,
  palet: undefined,
  isInsertingPallet: false,
  loadLastPallet: async (order_id) => {
    const db = await database();
    const palet = await db.select<Pallet[]>(
      `SELECT * FROM pallets WHERE order_id = ${order_id} ORDER BY id DESC LIMIT 1`
    );
    set({ palet: palet[0], isLoading: false });
  },
  insertPallet: async (pallet) => {
    set({ isInsertingPallet: true });
    const db = await database();
    await db.execute(
      "INSERT INTO pallets (order_id, pallet_number) VALUES (?, ?)",
      [pallet.order_id, pallet.pallet_number]
    );
    const lastPallet = await db.select<Pallet[]>(
      `SELECT * FROM pallets WHERE order_id = ${pallet.order_id} ORDER BY id DESC LIMIT 1`
    );
    set({ palet: lastPallet[0], isInsertingPallet: false });
  },
  getPallet: () => get().palet,
}));
