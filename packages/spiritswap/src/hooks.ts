import { TokenData } from "@orbs-network/twap";
import { hooks } from "@orbs-network/twap-ui";
import { useEffect, useMemo } from "react";

export const useGetProvider = (getProvider?: () => any, account?: string, connectedChainId?: number) => {
  return useMemo(() => {
    if (getProvider) {
      return getProvider();
    }
    return undefined;
  }, [account, connectedChainId]);
};

export const useTokensFromDapp = (srcTokenSymbol?: string, dstTokenSymbol?: string, tokenList?: TokenData[], getTokenImage?: (token: any) => string) => {
  const setTokens = hooks.useSetTokens();

  const findToken = (symbol?: string) => {
    const token = tokenList?.find((t: TokenData) => t.symbol.toUpperCase() === symbol?.toUpperCase());
    return !token ? undefined : { ...token, logoUrl: token.logoUrl || getTokenImage?.(token) };
  };

  useEffect(() => {
    if (!tokenList?.length) return;

    const srcToken = findToken(srcTokenSymbol);
    const dstToken = findToken(dstTokenSymbol);
    setTokens(srcToken, dstToken);
  }, [srcTokenSymbol, dstTokenSymbol, tokenList]);
};
