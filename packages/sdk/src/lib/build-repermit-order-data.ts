import { EXCLUSIVITY_OVERRIDE_BPS } from "./consts";
import { getSpotConfig } from "./lib";
import { zeroAddress } from "./networks";
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
  limitAmountPerChunk,
}: BuildRePermitOrderDataProps) => {
  const nonce = (Date.now() * 1000).toString();
  const epoch = safeBNString(fillDelayMillis / 1000);
  const deadline = safeBNString(deadlineMilliseconds / 1000);
  const spotConfig = getSpotConfig(chainId);

  if (!spotConfig) return;

  const orderData: OrderData = {
    permitted: {
      token: srcToken as Address,
      amount: srcAmount,
    },
    spender: spotConfig.reactor,
    nonce: nonce,
    deadline: deadline,
    witness: {
      info: {
        reactor: spotConfig.reactor,
        swapper: account as Address,
        nonce: nonce,
        deadline: deadline,
        additionalValidationContract: zeroAddress,
        additionalValidationData: "0x",
      },
      exclusiveFiller: zeroAddress,
      exclusivityOverrideBps: EXCLUSIVITY_OVERRIDE_BPS,
      input: {
        token: srcToken as Address,
        amount: srcAmountPerChunk,
        maxAmount: srcAmount,
      },
      output: {
        token: dstToken as Address,
        amount: dstMinAmountPerChunk || "0",
        recipient: account as Address,
        maxAmount: limitAmountPerChunk || "",
      },
      epoch,
      slippage: slippage.toString(),
      trigger: triggerAmountPerChunk || "",
      chainId: chainId.toString(),
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
