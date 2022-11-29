import Twap from "./Twap";
import Orders from "./Orders";
import { AdapterProps, TwapAdapter } from "@orbs-network/twap-ui";
import { useMemo } from "react";
import translations from "./i18n/en.json";
import { Configs } from "@orbs-network/twap";

const useGetProvider = (getProvider?: () => any, account?: string, connectedChainId?: number) => {
  return useMemo(() => {
    if (getProvider) {
      return getProvider();
    }
    return undefined;
  }, [account, connectedChainId]);
};

export const SpiritSwapAdapter = (props: AdapterProps) => {
  const { children, twapProps } = props;
  const provider = useGetProvider(twapProps.getProvider, twapProps.account, twapProps.connectedChainId);

  return (
    <TwapAdapter twapProps={{ ...twapProps, provider }} translations={translations} config={Configs.SpiritSwap}>
      {children}
    </TwapAdapter>
  );
};

export { Twap, Orders, useGetProvider };
