import TWAP_Spiritswap from "./Twap";
import Orders from "./Orders";
import { TwapProvider } from "@orbs-network/twap-ui";
import { ReactNode, useMemo } from "react";
import translations from "./i18n/en.json";
import { Configs } from "@orbs-network/twap";

export interface TwapProps {
  connect?: () => void;
  TokenSelectModal?: any;
  tokensList: any[];
  account?: any;
  getProvider?: () => any;
  getTokenImage?: (value: any) => string;
  onSrcTokenSelected?: (token: any) => void;
  onDstTokenSelected?: (token: any) => void;
  connectedChainId?: number;
  gasPrice?: {
    priorityFeePerGas?: string;
    maxFeePerGas?: string;
  };
}

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
      config={Configs.SpiritSwap}
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

export { TWAP_Spiritswap, Orders, useGetProvider };
