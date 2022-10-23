import { BigNumber } from "@defi.org/web3-candies";
import { createContext, ReactElement, ReactNode, useEffect } from "react";
import { useWeb3 } from "./store/store";

export interface IState {
  provider: any;
  dappIntegration: string;
  integrationChainId: number;
  connect: () => void;
  TokenSelectModal: ReactElement;
  getUsdPrice: (address: string, decimals: number) => Promise<BigNumber>;
}

const TwapContext = createContext<IState>({} as IState);

export interface TwapProviderProps extends IState {
  children: ReactNode;
}

const TwapProvider = ({ children, provider, dappIntegration, integrationChainId, connect, TokenSelectModal, getUsdPrice }: TwapProviderProps) => {
  const value = { provider, dappIntegration, integrationChainId, connect, TokenSelectModal, getUsdPrice };
  const { init } = useWeb3();

  // init web3 every time the provider changes
  useEffect(() => {
    init(dappIntegration, provider, integrationChainId);
  }, [provider, dappIntegration, integrationChainId]);

  return <TwapContext.Provider value={value}>{children}</TwapContext.Provider>;
};

export interface OrderHistoryState {
  tokensList: any[];
}

const OrderHistoryContext = createContext<OrderHistoryState>({} as OrderHistoryState);

export interface OrderHistoryStateProps extends OrderHistoryState {
  children: ReactNode;
}

const OrderHistoryProvider = ({ children, tokensList }: OrderHistoryStateProps) => {
  const value = { tokensList };

  return <OrderHistoryContext.Provider value={value}>{children}</OrderHistoryContext.Provider>;
};

export { TwapContext, TwapProvider, OrderHistoryProvider, OrderHistoryContext };
