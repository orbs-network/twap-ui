import { BigNumber } from "@defi.org/web3-candies";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { useAnalyticsInit } from "./analytics";
import { useWeb3 } from "./store/store";
import { TokenInfo as Token, Translations } from "./types";

const TwapContext = createContext<ContextProps>({} as ContextProps);

export interface ContextProps {
  provider: any;
  dappIntegration: string;
  integrationChainId: number;
  connect?: () => void;
  TokenSelectModal?: any;
  getUsdPrice: (address: string, decimals: number) => Promise<BigNumber>;
  tokensList: Token[];
  translations: Translations;
  analyticsID: string;
  getTokenImage?: (value: any) => string;
  srcToken?: Token;
  dstToken?: Token;
  onSrcTokenSelected?: (token: Token) => void;
  onDstTokenSelected?: (token: Token) => void;
}

export interface TwapProviderProps extends ContextProps {
  children: ReactNode;
}

const TwapProvider = (props: TwapProviderProps) => {
  const { init } = useWeb3();
  useAnalyticsInit(props.analyticsID);

  // init web3 every time the provider changes
  useEffect(() => {
    init(props.dappIntegration, props.provider, props.integrationChainId);
  }, [props.provider, props.dappIntegration, props.integrationChainId]);

  return <TwapContext.Provider value={props}>{props.children}</TwapContext.Provider>;
};

export const useTwapTranslations = () => {
  const { translations } = useContext(TwapContext);
  return translations;
};

export { TwapContext, TwapProvider };
