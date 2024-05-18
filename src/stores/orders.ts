import { create } from "zustand";
import { db } from "../db";

export interface Order {
  id?: number;
  order_number: string;
  pipe_weight: number;
  order_weight: number;
  size_id: number;
  status: string;
  length?: number;
  thickness?: number;
  type?: string;
}

interface Orders {
  orders: {
    [key: number]: Order;
  };
  isLoading: boolean;
  isInsertingOrder: boolean;
  isAddFormOpen: boolean;
  addingSizeId?: number;
  onCancelAdd: () => void;
  onAdd: (size_id: number) => void;
  loadOrders: () => void;
  insertOrder: (order: Order) => void;
  getOrder: (size_id: number) => Order;
}

export const useOrders = create<Orders>((set, get) => ({
  isLoading: false,
  orders: {},
  addingSizeId: undefined,
  isAddFormOpen: false,
  onCancelAdd: () => set({ isAddFormOpen: false, addingSizeId: undefined }),
  onAdd: (size_id) => set({ isAddFormOpen: true, addingSizeId: size_id }),
  isInsertingOrder: false,
  insertOrder: async (order) => {
    set({ isInsertingOrder: true });
    await db.execute(
      "INSERT INTO orders (order_number, pipe_weight, order_weight, size_id, status) VALUES (?, ?, ?, ?, ?)",
      [
        order.order_number,
        order.pipe_weight,
        order.order_weight,
        order.size_id,
        "new",
      ]
    );
    const orders = await db.select<Order[]>(
      "SELECT o.*, s.length, s.thickness, s.type FROM orders o JOIN sizes s ON o.size_id = s.id WHERE status = 'new'"
    );
    set({
      isInsertingOrder: false,
      isAddFormOpen: false,
      orders,
      addingSizeId: undefined,
    });
  },
  loadOrders: async () => {
    set({ isLoading: true });
    const orders = await db.select<Order[]>(
      "SELECT o.*, s.length, s.thickness, s.type FROM orders o JOIN sizes s ON o.size_id = s.id WHERE status = 'new'"
    );

    let res: { [key: number]: Order } = {};
    orders.forEach((order) => {
      res[order.size_id] = order;
    });
    set({ orders: res, isLoading: false });
  },
  getOrder: (size_id) => get().orders[size_id],
}));
