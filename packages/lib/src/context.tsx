import { BigNumber } from "@defi.org/web3-candies";
import { createContext, ReactElement, ReactNode, useEffect } from "react";
import { useWeb3 } from "./store/store";
import { TokenInfo } from "./types";

export interface IState {
  provider: any;
  dappIntegration: string;
  integrationChainId: number;
  connect: () => void;
  TokenSelectModal: ReactElement;
  getUsdPrice: (address: string, decimals: number) => Promise<BigNumber>;
  tokensList: TokenInfo[];
}

const TwapContext = createContext<IState>({} as IState);

export interface TwapProviderProps extends IState {
  children: ReactNode;
}

const TwapProvider = ({ children, provider, dappIntegration, integrationChainId, connect, TokenSelectModal, getUsdPrice, tokensList }: TwapProviderProps) => {
  const value = { provider, dappIntegration, integrationChainId, connect, TokenSelectModal, getUsdPrice, tokensList };
  const { init } = useWeb3();

  // init web3 every time the provider changes
  useEffect(() => {
    init(dappIntegration, provider, integrationChainId);
  }, [provider, dappIntegration, integrationChainId]);

  return <TwapContext.Provider value={value}>{children}</TwapContext.Provider>;
};

export { TwapContext, TwapProvider };
