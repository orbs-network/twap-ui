import { analytics } from "./analytics";
import { API_ENDPOINT } from "./consts";
import { buildV2Order } from "./orders/v2-orders";
import { Order, RePermitOrder, Signature } from "./types";

export const submitOrder = async (order: RePermitOrder, signature: Signature): Promise<Order | undefined> => {
  try {
    const body = {
      signature,
      order,
      status: "pending",
    };

    console.log("body", body);
    analytics.onCreateOrderRequest();

    const response = await fetch(`${API_ENDPOINT}/orders/new`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!data.signedOrder) {
      return undefined;
    }
    const newOrder = buildV2Order(data.signedOrder);
    analytics.onCreateOrderSuccess(newOrder.id);
    return newOrder;
  } catch (error) {
    analytics.onCreateOrderError(error);
    throw error;
  }
};
