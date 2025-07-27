import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";

export const useGetTransactionReceipt = () => {
  const { publicClient } = useTwapContext();

  return useMutation(async (txHash: `0x${string}`) => {
    if (!publicClient) throw new Error("publicClient is not defined");

    const maxRetries = 10;
    let attempt = 0;
    let delay = 1000;

    while (attempt < maxRetries) {
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 2,
          retryDelay: delay,
        });
        return receipt;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error(`Failed after ${maxRetries} attempts: ${error}`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }).mutateAsync;
};
