import { EXCLUSIVITY_OVERRIDE_BPS, EXECUTOR_ADDRESS, REACTOR_ADDRESS, REPERMIT_ADDRESS } from "./consts";
import { Address, BuildRePermitOrderDataProps, RePermitWitnessTransferFrom } from "./types";
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
  exchangeAddress,
}: BuildRePermitOrderDataProps) => {
  const nonce = (Date.now() * 1000).toString();
  const epoch = safeBNString(fillDelayMillis / 1000);
  const deadline = safeBNString(deadlineMilliseconds / 1000);

  const orderData: RePermitWitnessTransferFrom = {
    permitted: {
      token: srcToken as Address,
      amount: srcAmount,
    },
    spender: REACTOR_ADDRESS,
    nonce: nonce,
    deadline: deadline,
    witness: {
      reactor: REACTOR_ADDRESS,
      executor: EXECUTOR_ADDRESS,
      exchange: {
        adapter: exchangeAddress as Address,
        ref: "0xfeE0000a55d378afbcbBAEAEf29b58F8872b7F02",
        share: "5000",
        data: "0x",
      },
      swapper: account as Address,
      nonce: nonce,
      deadline: deadline,
      exclusivity: EXCLUSIVITY_OVERRIDE_BPS,
      epoch,
      slippage: slippage.toString(),
      freshness: "10",
      input: {
        token: srcToken as Address,
        amount: srcAmountPerChunk,
        maxAmount: srcAmount,
      },
      output: {
        token: dstToken as Address,
        amount: dstMinAmountPerChunk || "0",
        maxAmount: triggerAmountPerChunk || "",
        recipient: account as Address,
      },
    },
  };

  const domain = {
    name: "RePermit",
    version: "1",
    chainId: chainId,
    verifyingContract: REPERMIT_ADDRESS as Address,
  };

  return {
    domain,
    orderData,
  };
};
