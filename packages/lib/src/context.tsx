import { createContext, ReactNode, useEffect } from "react";
import { Translations } from "./types";
import { Config, TokenData } from "@orbs-network/twap";
import { useInitLib } from "./hooks";

const TwapContext = createContext<ContextProps>({} as ContextProps);

export interface ContextProps {
  account?: any;
  config: Config;
  provider: any;
  connect?: () => void;
  TokenSelectModal?: any;
  tokensList: TokenData[];
  translations: Translations;
  getTokenImage?: (value: any) => string;
  srcToken?: TokenData;
  dstToken?: TokenData;
  onSrcTokenSelected?: (token: TokenData) => void;
  onDstTokenSelected?: (token: TokenData) => void;
  connectedChainId?: number;
  gasPrice?: {
    priorityFeePerGas?: string;
    maxFeePerGas?: string;
  };
}

export interface TwapProviderProps extends ContextProps {
  children: ReactNode;
}

const TwapProvider = (props: TwapProviderProps) => {
  const initLib = useInitLib();

  // init web3 every time the provider changes
  useEffect(() => {
    initLib(props.config, props.provider, props.account, props.tokensList);
  }, [props.provider, props.config, props.account, props.tokensList]);

  return <TwapContext.Provider value={props}>{props.children}</TwapContext.Provider>;
};

export { TwapContext, TwapProvider };
