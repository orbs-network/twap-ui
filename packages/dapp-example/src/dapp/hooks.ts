import { eqIgnoreCase, Module, Partners } from "@orbs-network/twap-sdk";
import { useTokenList } from "../hooks";
import { useCallback } from "react";
import { NumberParam, StringParam, useQueryParam } from "use-query-params";
import { polygon } from "viem/chains";
import { useSwitchChain } from "wagmi";

export const useAppParams = () => {
  const [partner, setPartner] = useQueryParam("partner", StringParam);
  const [module, setModule] = useQueryParam("module", StringParam);
  const [chainId, setChainId] = useQueryParam("chainId", NumberParam);
  const { switchChain } = useSwitchChain();

  const partnerSelect = useCallback(
    (partner: Partners, chainId: number) => {
      setPartner(partner);
      setChainId(chainId);
      switchChain({ chainId });
    },
    [setPartner, setChainId, switchChain],
  );

  const onModuleSelect = useCallback(
    (module: Module) => {
      setModule(module);
    },
    [setPartner],
  );

  return {
    partner: (partner || Partners.QUICKSWAP) as Partners,
    chainId: chainId || polygon.id,
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
