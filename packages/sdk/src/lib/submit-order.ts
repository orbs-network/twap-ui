import { API_ENDPOINT } from "./consts";
import { OrderData } from "./types";

function parseViemSignature(signature: string) {
  // Remove 0x prefix
  const sig = signature.slice(2);

  // Split into components (Viem format: r(64) + s(64) + v(2))
  const r = "0x" + sig.slice(0, 64); // First 32 bytes (64 hex chars)
  const s = "0x" + sig.slice(64, 128); // Next 32 bytes (64 hex chars)
  const v = "0x" + sig.slice(128, 130); // Last 1 byte (2 hex chars)

  return { v, r, s };
}

export const submitOrder = async (order: OrderData, signature: string) => {
  const body = {
    signature: parseViemSignature(signature),
    order,
    status: "pending",
  };
  console.log("body", body);

  const response = await fetch(`${API_ENDPOINT}/orders`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return data;
};
