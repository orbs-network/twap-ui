import { Status } from "./types";

interface HistoryOrder {
  id: number;
  // Add other properties as needed
}

interface OrdersState {
  orders: { [key: string]: HistoryOrder[] };
  addOrder: (chainId: number, order: HistoryOrder) => void;
  deleteOrder: (chainId: number, orderId: number) => void;
}

class OrdersStore implements OrdersState {
  orders: { [key: string]: HistoryOrder[] } = {};

  addOrder(chainId: number, order: HistoryOrder): void {
    // console.log("Adding order to localstorage", order, "to chain", chainId);
    const chainOrders = this.orders[chainId.toString()] || [];
    this.orders[chainId.toString()] = [order, ...chainOrders];
    this.saveOrders();
  }

  deleteOrder(chainId: number, orderId: number): void {
    // console.log("Got order from api, Deleting order from localstorage", orderId, "from chain", chainId);
    const chainOrders = this.orders[chainId.toString()] || [];
    this.orders[chainId.toString()] = chainOrders.filter((order) => order.id !== orderId);
    this.saveOrders();
  }

  private saveOrders(): void {
    localStorage.setItem("twap-orders", JSON.stringify(this.orders));
  }
  cancelOrder(chainId: number, orderId: number): void {
    console.log("Cancelling order", orderId);

    const chainOrders = this.orders[chainId.toString()] || [];
    this.orders[chainId.toString()] = chainOrders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          status: Status.Canceled,
        };
      }
      return order;
    });
  }

  private loadOrders(): void {
    const storedOrders = localStorage.getItem("twap-orders");
    if (storedOrders) {
      this.orders = JSON.parse(storedOrders);
    }
  }

  constructor() {
    this.loadOrders();
  }
}

export const ordersStore = new OrdersStore();
