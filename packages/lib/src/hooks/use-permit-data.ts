import { useMemo } from "react";
import { useTwapContext } from "../context";
import BN from "bignumber.js";
import { useSrcAmount } from "./use-src-amount";
import { useDeadline } from "./use-deadline";
import { useSrcChunkAmount } from "./use-src-chunk-amount";
import { useDstMinAmountPerChunk } from "./use-dst-min-amount-out-per-chunk";
import { useFillDelay } from "./use-fill-delay";
import { ensureWrappedToken } from "../utils";
import moment from "moment";
import { EXCLUSIVITY_OVERRIDE_BPS, EXECUTOR_ADDRESS, REACTOR_ADDRESS, REPERMIT_ADDRESS } from "@orbs-network/twap-sdk";
import { maxUint256 } from "viem";
import { useTriggerAmountPerChunk } from "./use-trigger-amount-per-chunk";

export const usePermitData = () => {
  const { srcToken, dstToken, chainId, account, slippage: _slippage } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;
  const srcChunkAmount = useSrcChunkAmount().amountWei;
  const deadlineMillis = useDeadline();
  const { amountWei: triggerAmountPerChunk } = useTriggerAmountPerChunk();
  const dstMinAmountPerChunk = useDstMinAmountPerChunk().amountWei;
  const fillDelay = useFillDelay().fillDelay;
  const fillDelayMillis = fillDelay.unit * fillDelay.value;
  const epoch = fillDelayMillis / 1000;
  const slippage = _slippage * 100;

  return useMemo(() => {
    if (!srcToken || !dstToken || !chainId || !account || !deadlineMillis || !srcAmountWei) return;
    const deadline = BN(deadlineMillis).div(1000).toFixed(0);
    const stcTokenAddress = ensureWrappedToken(srcToken, chainId).address;
    const nonce = moment().valueOf();
    return {
      domain: {
        name: "RePermit",
        version: "1",
        chainId: chainId,
        verifyingContract: REPERMIT_ADDRESS,
      },
      primaryType: "RePermitWitnessTransferFrom",
      types: {
        RePermitWitnessTransferFrom: [
          {
            name: "permitted",
            type: "TokenPermissions",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
          {
            name: "witness",
            type: "Order",
          },
        ],
        Input: [
          {
            name: "token",
            type: "address",
          },
          {
            name: "amount",
            type: "uint256",
          },
          {
            name: "maxAmount",
            type: "uint256",
          },
        ],
        Order: [
          {
            name: "info",
            type: "OrderInfo",
          },
          {
            name: "exclusiveFiller",
            type: "address",
          },
          {
            name: "exclusivityOverrideBps",
            type: "uint256",
          },
          {
            name: "epoch",
            type: "uint256",
          },
          {
            name: "slippage",
            type: "uint256",
          },
          {
            name: "input",
            type: "Input",
          },
          {
            name: "output",
            type: "Output",
          },
        ],
        OrderInfo: [
          {
            name: "reactor",
            type: "address",
          },
          {
            name: "swapper",
            type: "address",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
          {
            name: "additionalValidationContract",
            type: "address",
          },
          {
            name: "additionalValidationData",
            type: "bytes",
          },
        ],
        Output: [
          {
            name: "token",
            type: "address",
          },
          {
            name: "amount",
            type: "uint256",
          },
          {
            name: "maxAmount",
            type: "uint256",
          },
          {
            name: "recipient",
            type: "address",
          },
        ],
        TokenPermissions: [
          {
            name: "token",
            type: "address",
          },
          {
            name: "amount",
            type: "uint256",
          },
        ],
      },
      message: {
        permitted: {
          token: stcTokenAddress,
          amount: srcAmountWei,
        },
        spender: REACTOR_ADDRESS,
        nonce,
        deadline,
        witness: {
          info: {
            reactor: REACTOR_ADDRESS,
            swapper: account,
            nonce,
            deadline,
            additionalValidationContract: EXECUTOR_ADDRESS,
            additionalValidationData: "0x",
          },
          exclusiveFiller: EXECUTOR_ADDRESS,
          exclusivityOverrideBps: EXCLUSIVITY_OVERRIDE_BPS,
          epoch,
          slippage,
          input: {
            token: stcTokenAddress,
            amount: srcChunkAmount,
            maxAmount: srcAmountWei,
          },
          output: {
            token: dstToken.address,
            amount: dstMinAmountPerChunk,
            maxAmount: triggerAmountPerChunk || maxUint256.toString(),
            recipient: account,
          },
        },
      },
    };
  }, [srcToken, dstToken, chainId, account, srcAmountWei, deadlineMillis, srcChunkAmount, triggerAmountPerChunk, slippage, dstMinAmountPerChunk, epoch]);
};
