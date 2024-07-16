import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HistoryOrder } from "./types";
import { logger } from "./utils";

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
        logger("Adding order to localstorage", order, "to chain", chainId);
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
        logger("Got order from api, Deleting order from localstorage", orderId, "from chain", chainId);
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
