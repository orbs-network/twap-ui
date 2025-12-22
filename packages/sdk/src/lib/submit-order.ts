import { analytics } from "./analytics";
import { getApiEndpoint } from "./consts";
import { buildV2Order } from "./orders/v2-orders";
import { Order, RePermitOrder, Signature } from "./types";

export const submitOrder = async (order: RePermitOrder, signature: Signature): Promise<Order> => {
  try {
    const body = {
      signature,
      order,
      status: "pending",
    };

    console.log("body", body);
    analytics.onCreateOrderRequest();

    const response = await fetch(`${getApiEndpoint()}/orders/new`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(`error:${data.message}, code:${data.code}`);
    }
    const newOrder = buildV2Order(data.signedOrder);
    analytics.onCreateOrderSuccess(newOrder.id);
    return newOrder;
  } catch (error) {
    analytics.onCreateOrderError(error);
    console.error(error);
    throw error;
  }
};
