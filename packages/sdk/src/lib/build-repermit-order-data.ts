import { EXCLUSIVITY_OVERRIDE_BPS, EXECUTOR_ADDRESS, maxUint256, REACTOR_ADDRESS, REPERMIT_ADDRESS } from "./consts";
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
  const nonce = (Date.now() * 1000).toString();
  const epoch = safeBNString(fillDelayMillis / 1000);
  const deadline = safeBNString(deadlineMilliseconds / 1000);

  const orderData: OrderData = {
    permitted: {
      token: srcToken as Address,
      amount: srcAmount,
    },
    spender: REACTOR_ADDRESS,
    nonce: nonce,
    deadline: deadline,
    witness: {
      info: {
        reactor: REACTOR_ADDRESS,
        swapper: account as Address,
        nonce: nonce,
        deadline: deadline,
        additionalValidationContract: EXECUTOR_ADDRESS,
        additionalValidationData: "0x",
      },

      exclusiveFiller: EXECUTOR_ADDRESS,
      exclusivityOverrideBps: EXCLUSIVITY_OVERRIDE_BPS,
      input: {
        token: srcToken as Address,
        amount: srcAmountPerChunk,
        maxAmount: srcAmount,
      },
      output: {
        token: dstToken as Address,
        amount: dstMinAmountPerChunk || "0",
        maxAmount: triggerAmountPerChunk || maxUint256,
        recipient: account as Address,
      },

      epoch,
      slippage: slippage.toString(),
      trigger: triggerAmountPerChunk || maxUint256,
      chainId: chainId.toString(),
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
