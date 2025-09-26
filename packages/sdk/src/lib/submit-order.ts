import { API_ENDPOINT } from "./consts";
import { buildSinkOrder, Order } from "./orders";
import { OrderData, Signature } from "./types";

export const submitOrder = async (order: OrderData, signature: Signature): Promise<Order> => {
  const body = {
    signature,
    order,
    status: "pending",
  };

  console.log({ signature });

  console.log("order", order);
  console.log("signature", signature);
  console.log("parsed signature", signature);

  const response = await fetch(`${API_ENDPOINT}/orders`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return buildSinkOrder(data);
};
