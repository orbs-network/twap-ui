import { Address, RePermitOrder, SpotConfig } from "./types";
import BN from "bignumber.js";
import { safeBNNumber, safeBNString } from "./utils";

export const buildRePermitOrderData = ({
  chainId,
  srcToken,
  dstToken,
  srcAmount,
  deadlineMillis,
  fillDelayMillis,
  slippage,
  account,
  srcAmountPerTrade,
  dstMinAmountPerTrade,
  triggerAmountPerTrade,
  config,
}: {
  chainId: number;
  srcToken: string;
  dstToken: string;
  srcAmount: string;
  deadlineMillis: number;
  fillDelayMillis: number;
  slippage: number;
  account: string;
  srcAmountPerTrade: string;
  dstMinAmountPerTrade?: string;
  triggerAmountPerTrade?: string;
  limitAmountPerTrade?: string;
  config: SpotConfig;
}) => {
  const nonce = Date.now().toString();
  const epoch = parseInt((fillDelayMillis / 1000).toFixed(0));
  const deadline = safeBNString(deadlineMillis / 1000);

  const orderData: RePermitOrder = {
    permitted: {
      token: srcToken as Address,
      amount: srcAmount,
    },
    spender: config.reactor,
    nonce,
    deadline,
    witness: {
      reactor: config.reactor,
      executor: config.executor,
      exchange: {
        adapter: config.adapter,
        ref: config.fee,
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
      freshness: 600,
      input: {
        token: srcToken as Address,
        amount: srcAmountPerTrade,
        maxAmount: srcAmount,
      },
      output: {
        token: dstToken as Address,
        limit: dstMinAmountPerTrade || "0",
        stop: !triggerAmountPerTrade || BN(triggerAmountPerTrade || 0).isZero() ? "0" : triggerAmountPerTrade,
        recipient: account as Address,
      },
    },
  };

  const domain = {
    name: "RePermit",
    version: "1",
    chainId,
    verifyingContract: config.repermit,
  };

  return {
    domain,
    order: orderData,
  };
};
