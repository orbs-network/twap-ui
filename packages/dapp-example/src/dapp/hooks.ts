import { Config, eqIgnoreCase, Module } from "@orbs-network/twap-sdk";
import { useTokenList } from "../hooks";
import { useCallback } from "react";
import { StringParam, useQueryParam } from "use-query-params";

export const useAppParams = () => {
  const [partner, setPartner] = useQueryParam("partner", StringParam);
  const [module, setModule] = useQueryParam("module", StringParam);

  const partnerSelect = useCallback(
    (config: Config) => {
      setPartner(`${config.name.toLowerCase()}_${config.chainName.toLowerCase()}`);
    },
    [setPartner],
  );

  const onModuleSelect = useCallback(
    (module: Module) => {
      setModule(module);
    },
    [setPartner],
  );

  return {
    partner,
    module: (module || Module.TWAP) as Module,
    onModuleSelect,
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
