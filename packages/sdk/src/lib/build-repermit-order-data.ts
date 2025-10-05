import { maxUint256 } from "./consts";
import { getSpotConfig } from "./lib";
import { Address, RePermitOrder } from "./types";
import { safeBNString } from "./utils";
import BN from "bignumber.js";

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
}) => {
  const nonce = safeBNString(Date.now() * 1000);
  const epoch = parseInt((fillDelayMillis / 1000).toFixed(0));
  const deadline = safeBNString(deadlineMillis / 1000);
  const spotConfig = getSpotConfig(chainId);

  if (!spotConfig) return;

  const orderData: RePermitOrder = {
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
      freshness: 60,
      input: {
        token: srcToken as Address,
        amount: srcAmountPerTrade,
        maxAmount: srcAmount,
      },
      output: {
        token: dstToken as Address,
        limit: dstMinAmountPerTrade || "0",
        stop: !triggerAmountPerTrade || BN(triggerAmountPerTrade || 0).isZero() ? maxUint256 : triggerAmountPerTrade,
        recipient: account as Address,
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
    order: orderData,
  };
};
