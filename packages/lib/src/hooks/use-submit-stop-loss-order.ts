import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTwapContext } from "../context";
import { useOrderDeadline, useSrcAmount } from "./logic-hooks";
import BN from "bignumber.js";
const permit2Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

const usePermit = () => {
  const { srcToken, dstToken, chainId, account } = useTwapContext();
  const srcAmountWei = useSrcAmount().amountWei;
  const deadlineMillis = useOrderDeadline();

  return useMemo(() => {
    if (!srcToken || !dstToken || !chainId || !account || !deadlineMillis || !srcAmountWei) return;
    const deadline = BN(deadlineMillis).div(1000).toFixed(0);
    return {
      domain: {
        name: "Permit2",
        version: "1",
        chainId: chainId,
        verifyingContract: permit2Address,
      },
      types: {
        PermitWitnessTransferFrom: [
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
            type: "ExclusiveDutchOrder",
          },
        ],
        DutchOutput: [
          {
            name: "token",
            type: "address",
          },
          {
            name: "startAmount",
            type: "uint256",
          },
          {
            name: "endAmount",
            type: "uint256",
          },
          {
            name: "recipient",
            type: "address",
          },
        ],
        ExclusiveDutchOrder: [
          {
            name: "info",
            type: "OrderInfo",
          },
          {
            name: "decayStartTime",
            type: "uint256",
          },
          {
            name: "decayEndTime",
            type: "uint256",
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
            name: "inputToken",
            type: "address",
          },
          {
            name: "inputStartAmount",
            type: "uint256",
          },
          {
            name: "inputEndAmount",
            type: "uint256",
          },
          {
            name: "outputs",
            type: "DutchOutput[]",
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
      primaryType: "PermitWitnessTransferFrom",
      message: {
        permitted: {
          token: srcToken.address as `0x${string}`,
          amount: BigInt(BN(srcAmountWei).decimalPlaces(0).toFixed()),
        },
        spender: "<REACTOR>",
        nonce: "<NONCE>",
        deadline: deadline,
        witness: {
          info: {
            reactor: "<REACTOR>",
            swapper: "<SWAPPER>",
            nonce: "<NONCE>",
            deadline: deadline,
            additionalValidationContract: "<EXECUTOR>",
            additionalValidationData: "<REFDATA>",
          },
          decayStartTime: "<DEADLINE>",
          decayEndTime: "<DEADLINE>",
          exclusiveFiller: "<EXECUTOR>",
          exclusivityOverrideBps: "0",
          inputToken: srcToken.address as `0x${string}`,
          inputStartAmount: "0",
          inputEndAmount: "0",
          outputs: [
            {
              token: dstToken.address as `0x${string}`,
              startAmount: "0",
              endAmount: "0",
              recipient: account as `0x${string}`,
            },
          ],
        },
      },
    };
  }, [srcToken, dstToken, chainId, account, srcAmountWei, deadlineMillis]);
};

export const useSubmitStopLossOrder = () => {
  const { walletClient } = useTwapContext();
  const permit = usePermit();
  return useMutation({
    mutationFn: async () => {
      if (!permit) {
        throw new Error("permit is not defined");
      }
      const signature = await walletClient?.signTypedData(permit as any);
      return signature;
    },
  });
};
