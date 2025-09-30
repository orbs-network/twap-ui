import { Config } from "../types";
import { Order } from "../types";
import { getOrders as getV1Orders } from "./v1-orders";
import { getOrders as getV2Orders } from "./v2-orders";

export const getAccountOrders = async ({
  signal,
  page,
  limit,
  config,
  account,
}: {
  signal?: AbortSignal;
  page?: number;
  limit?: number;
  config: Config;
  account: string;
}): Promise<Order[]> => {
  const allOrders = await Promise.all([
    getV1Orders({ chainId: config.chainId, signal, page, limit, filters: { accounts: [account] } }),
    getV2Orders({ chainId: config.chainId, signal, account }),
  ]).then(([graphOrders, apiOrders]) => {
    return [...graphOrders, ...apiOrders];
  });
  const sortedOrders = allOrders.sort((a, b) => b.createdAt - a.createdAt);
  return sortedOrders;
};
