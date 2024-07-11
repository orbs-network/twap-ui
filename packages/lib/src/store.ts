import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HistoryOrder } from "./types";

interface OrdersState {
  orders: { [key: string]: HistoryOrder[] };
  addOrder: (chainId: number, order: HistoryOrder) => void;
  deleteOrder: (chainId: number, orderId: number) => void;
}
export const useOrdersStore = create(
  persist<OrdersState>(
    (set, get) => ({
      orders: {},
      addOrder: (chainId: number, order: HistoryOrder) => {
        let chainOdrers = get().orders[chainId.toString()] || [];
        chainOdrers = [order, ...chainOdrers];
        set({
          orders: {
            ...get().orders,
            [chainId.toString()]: chainOdrers,
          },
        });
      },
      deleteOrder: (chainId: number, orderId: number) => {
        const chainOdrers = get().orders[chainId.toString()] || [];
        const newOrders = chainOdrers.filter((order) => order.id !== orderId);
        set({
          orders: {
            ...get().orders,
            [chainId.toString()]: newOrders,
          },
        });
      },
    }),
    {
      name: "twap-orders",
    }
  )
);
