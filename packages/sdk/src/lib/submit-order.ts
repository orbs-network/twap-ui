import { API_ENDPOINT } from "./consts";

export const submitOrder = async (signedOrder: string) => {
  const response = await fetch(`${API_ENDPOINT}/orders`, {
    method: "POST",
    body: signedOrder,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
};
