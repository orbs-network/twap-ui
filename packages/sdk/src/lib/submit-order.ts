import { API_ENDPOINT } from "./consts";
import { buildV2Order } from "./orders/v2-orders";
import { Order, RePermitOrder, Signature } from "./types";

export const submitOrder = async (order: RePermitOrder, signature: Signature): Promise<Order | undefined> => {
  const body = {
    signature,
    order,
    status: "pending",
  };

  console.log("body", body);

  const response = await fetch(`${API_ENDPOINT}/orders`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!data.signedOrder) {
    return undefined;
  }

  return buildV2Order(data.signedOrder);
};
