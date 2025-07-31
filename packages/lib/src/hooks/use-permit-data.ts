import { useMemo } from "react";
import { useTwapContext } from "../context";
import BN from "bignumber.js";
import { useSrcAmount } from "./use-src-amount";
import { useDeadline } from "./use-deadline";
import { useTriggerPrice } from "./use-trigger-price";
import { useSrcChunkAmount } from "./use-src-chunk-amount";
import { useDstMinAmount } from "./use-dst-min-amount-out";
import { useFillDelay } from "./use-fill-delay";
import { getEstimatedDelayBetweenChunksMillis } from "@orbs-network/twap-sdk";
import { useNonce } from "./use-nonce";
import { ensureWrappedToken } from "../utils";

export const usePermitData = () => {
  const { srcToken, dstToken, chainId, account: recipient, twapSDK, slippage: _slippage, config } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;
  const srcChunksAmount = useSrcChunkAmount().amountWei;
  const deadlineMillis = useDeadline();
  const { amountWei: triggerPrice } = useTriggerPrice();
  const dstMinAmount = useDstMinAmount().amountWei;
  const fillDelay = useFillDelay().fillDelay;
  const fillDelayMillis = fillDelay.unit * fillDelay.value;
  const fillDelaySeconds = (fillDelayMillis - getEstimatedDelayBetweenChunksMillis(config)) / 1000;
  const { data: _nonce } = useNonce();
  const slippage = _slippage * 100;
  const nonce = _nonce?.toString();

  return useMemo(() => {
    if (!srcToken || !dstToken || !chainId || !recipient || !deadlineMillis || !srcAmountWei) return;
    const deadline = BN(deadlineMillis).div(1000).toFixed(0);
    const stcTokenAddress = ensureWrappedToken(srcToken, chainId).address;

    return {
      domain: {
        name: "RePermit",
        version: "1",
        chainId: chainId,
        verifyingContract: "0xbBa2344A886D66f43AC0E9ed980Cc14c82715aEC",
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
        spender: twapSDK.config.twapAddress,
        nonce,
        deadline,
        witness: {
          info: {
            reactor: "0xc19E284C8f5ccef721a761d0CA18dc8E9a612aFd",
            swapper: recipient,
            nonce,
            deadline,
            additionalValidationContract: "0xbBa2344A886D66f43AC0E9ed980Cc14c82715aEC",
            additionalValidationData: "0x",
          },
          exclusiveFiller: "0xc19E284C8f5ccef721a761d0CA18dc8E9a612aFd",
          exclusivityOverrideBps: "100",
          epoch: fillDelaySeconds,
          slippage: slippage,
          trigger: triggerPrice,
          input: {
            token: stcTokenAddress,
            amount: srcChunksAmount,
            maxAmount: srcAmountWei,
          },
          output: {
            token: dstToken.address,
            amount: dstMinAmount,
            recipient: recipient,
          },
        },
      },
    };
  }, [srcToken, dstToken, chainId, recipient, srcAmountWei, deadlineMillis, srcChunksAmount, triggerPrice, slippage, dstMinAmount, fillDelaySeconds, nonce]);
};
