import { eqIgnoreCase } from "@defi.org/web3-candies";
import { useCallback } from "react";
import { useWidgetContext } from "..";

const isEqual = (tokenA?: any, tokenB?: any) => {
  if (!tokenA || !tokenB) return false;
  return eqIgnoreCase(tokenA?.address || "", tokenB?.address || "") || eqIgnoreCase(tokenA?.symbol || "", tokenB?.symbol || "");
};

export const useTokenSelect = () => {
  const { onSrcTokenSelected, onDstTokenSelected, onSwitchTokens } = useWidgetContext();
  const { srcToken, dstToken } = useWidgetContext();
  return useCallback(
    ({ isSrc, token }: { isSrc: boolean; token: any }) => {
      if (isSrc && isEqual(token, dstToken)) {
        onSwitchTokens?.();
        return;
      }

      if (!isSrc && isEqual(token, srcToken)) {
        onSwitchTokens?.();
        return;
      }

      if (isSrc) {
        onSrcTokenSelected?.(token);
      } else {
        onDstTokenSelected?.(token);
      }
    },
    [onDstTokenSelected, onSrcTokenSelected, srcToken, dstToken, onSwitchTokens],
  );
};
