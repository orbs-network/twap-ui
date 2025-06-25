import { Config, eqIgnoreCase } from "@orbs-network/twap-sdk";
import { useTokenList } from "../hooks";
import { useCallback } from "react";
import { StringParam, useQueryParam } from "use-query-params";

export const useAppParams = () => {
  const [partner, setPartner] = useQueryParam("partner", StringParam);

  const partnerSelect = useCallback(
    (config: Config) => {
      setPartner(`${config.name.toLowerCase()}_${config.chainName.toLowerCase()}`);
    },
    [setPartner],
  );

  return {
    partner,
    partnerSelect,
  };
};

export const useGetToken = () => {
  const tokens = useTokenList();

  return useCallback(
    (addressOrSymbol?: string) => {
      return tokens?.find((it: any) => eqIgnoreCase(it.address || "", addressOrSymbol || "") || eqIgnoreCase(it.symbol || "", addressOrSymbol || ""));
    },
    [tokens],
  );
};
