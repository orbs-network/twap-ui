import { useEffect } from "react";
import { useTwapContext } from "../context";
import { Token } from "../types";

export const useListeners = (srcToken?: Token, dstToken?: Token, marketPrice?: string, oneSrcTokenUsd?: number) => {
  const { actionHandlers } = useTwapContext();
  useEffect(() => {
    actionHandlers.setMarketPrice(marketPrice || "");
  }, [marketPrice]);

  useEffect(() => {
    actionHandlers.setSrcToken(srcToken);
  }, [srcToken]);

  useEffect(() => {
    actionHandlers.setDstToken(dstToken);
  }, [dstToken]);

  useEffect(() => {
    actionHandlers.setOneSrcTokenUsd(oneSrcTokenUsd ? Number(oneSrcTokenUsd) : 0);
  }, [oneSrcTokenUsd]);
};
