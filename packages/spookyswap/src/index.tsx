import TWAP_Spookyswap from "./Twap";
import Orders from "./Orders";
import { TwapProps, TwapProvider } from "@orbs-network/twap-ui";
import { ReactNode, useMemo } from "react";
import translations from "./i18n/en.json";
import { Configs } from "@orbs-network/twap";

interface ProviderWrapperProps extends TwapProps {
  children: ReactNode;
}

const useGetProvider = (getProvider?: () => any, account?: string, connectedChainId?: number) => {
  return useMemo(() => {
    if (getProvider) {
      return getProvider();
    }
    return undefined;
  }, [account, connectedChainId]);
};

export const ProviderWrapper = (props: ProviderWrapperProps) => {
  const provider = useGetProvider(props.getProvider, props.account, props.connectedChainId);

  return (
    <TwapProvider
      gasPrice={props.gasPrice}
      translations={translations}
      tokensList={props.tokensList}
      config={Configs.SpookySwap}
      connectedChainId={props.connectedChainId}
      account={props.account}
      provider={provider}
      connect={props.connect}
      TokenSelectModal={props.TokenSelectModal}
      getTokenImage={props.getTokenImage}
      onSrcTokenSelected={props.onSrcTokenSelected}
      onDstTokenSelected={props.onDstTokenSelected}
    >
      {props.children}
    </TwapProvider>
  );
};

export { TWAP_Spookyswap, Orders, useGetProvider };
