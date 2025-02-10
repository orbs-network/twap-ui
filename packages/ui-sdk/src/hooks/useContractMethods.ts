import { erc20abi, network } from "@defi.org/web3-candies";
import { isNativeAddress, TwapSDK } from "@orbs-network/twap-sdk";
import React, { useMemo } from "react";
import { Token } from "../types";
import { TwapValues } from "./useDerivedValues";
import { TwapAbi } from "@orbs-network/twap-sdk";

export default function useCreateOrderTx(derivedState: TwapValues, sdk: TwapSDK, srcToken?: Token, destToken?: Token) {
  const srcTokenAddress = useMemo(() => {
    const wToken = network(sdk.config.chainId)?.wToken;

    return isNativeAddress(srcToken?.address) ? wToken?.address || "" : srcToken?.address || "";
  }, [srcToken, sdk.config.chainId]);

  return useMemo(() => {
    const params = sdk.prepareOrderArgs({
      destTokenMinAmount: derivedState.destTokenMinAmount,
      srcChunkAmount: derivedState.srcChunkAmount,
      deadline: derivedState.deadline,
      fillDelay: derivedState.fillDelay,
      srcAmount: derivedState.srcAmount,
      srcTokenAddress,
      destTokenAddress: destToken?.address || "",
    });

    return {
      method: "ask",
      params,
      contract: sdk.config.twapAddress,
      abi: TwapAbi,
    };
  }, [sdk, srcTokenAddress, derivedState, destToken]);
}
