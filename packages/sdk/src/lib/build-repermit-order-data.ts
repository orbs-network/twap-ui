import { getSpotConfig } from "./lib";
import { Address, BuildRePermitOrderDataProps, OrderData } from "./types";
import { safeBNString } from "./utils";

export const buildRePermitOrderData = ({
  chainId,
  srcToken,
  dstToken,
  srcAmount,
  deadlineMilliseconds,
  fillDelayMillis,
  slippage,
  account,
  srcAmountPerChunk,
  dstMinAmountPerChunk,
  triggerAmountPerChunk,
}: BuildRePermitOrderDataProps) => {
  const nonce = safeBNString(Date.now() * 1000);
  const epoch = parseInt((fillDelayMillis / 1000).toFixed(0));
  const deadline = safeBNString(deadlineMilliseconds / 1000);
  const spotConfig = getSpotConfig(chainId);

  if (!spotConfig) return;

  const orderData: OrderData = {
    permitted: {
      token: srcToken as Address,
      amount: srcAmount,
    },
    spender: spotConfig.reactor,
    nonce,
    deadline,
    witness: {
      reactor: spotConfig.reactor,
      executor: spotConfig.executor,
      exchange: {
        adapter: spotConfig.dex.thena.adapter,
        ref: spotConfig.dex.thena.fee,
        share: 0,
        data: "0x",
      },
      swapper: account as Address,
      nonce,
      deadline,
      chainid: chainId,
      exclusivity: 0,
      epoch,
      slippage,
      freshness: 30,
      input: {
        token: srcToken as Address,
        amount: srcAmountPerChunk,
        maxAmount: srcAmount,
      },
      output: {
        token: dstToken as Address,
        amount: dstMinAmountPerChunk || "0",
        recipient: account as Address,
        maxAmount: triggerAmountPerChunk || "",
      },
    },
  };

  const domain = {
    name: "RePermit",
    version: "1",
    chainId,
    verifyingContract: spotConfig.repermit,
  };

  return {
    domain,
    orderData,
  };
};
