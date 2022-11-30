import { createContext, ReactNode, useContext, useEffect, useMemo } from "react";
import { Translations, TWAPProps } from "./types";
import { Config, TokenData } from "@orbs-network/twap";
import { useInitLib, useSetTokensList } from "./hooks";
import defaultTranlations from "./i18n/en.json";

const TwapContext = createContext<ContextProps>({} as ContextProps);

export interface ContextProps {
  account?: any;
  config: Config;
  provider: any;
  connect?: () => void;
  tokensList: TokenData[];
  translations: Translations;
  getTokenImage?: (value: any) => string;
  srcToken?: TokenData;
  dstToken?: TokenData;
  onSrcTokenSelected?: (token: TokenData) => void;
  onDstTokenSelected?: (token: TokenData) => void;
  TokenSelectModal?: any;
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
  const setTokensList = useSetTokensList();

  // init web3 every time the provider changes
  useEffect(() => {
    initLib(props.config, props.provider, props.account, props.connectedChainId);
  }, [props.provider, props.config, props.account, props.connectedChainId]);

  useEffect(() => {
    setTokensList(props.tokensList);
  }, [props.tokensList]);

  return <TwapContext.Provider value={props}>{props.children}</TwapContext.Provider>;
};

export const useTwapContext = () => {
  return useContext(TwapContext);
};

interface Props {
  twapProps: TWAPProps;
  children: ReactNode;
  config: Config;
  translations: Partial<Translations>;
}

export function TwapAdapter(props: Props) {
  const { twapProps, config } = props;

  const translations = useMemo(() => ({ ...defaultTranlations, ...props.translations }), [props.translations]);
  return (
    <TwapProvider
      gasPrice={twapProps.gasPrice}
      translations={translations}
      tokensList={twapProps.tokensList}
      config={config}
      connectedChainId={twapProps.connectedChainId}
      account={twapProps.account}
      provider={twapProps.provider}
      connect={twapProps.connect}
      getTokenImage={twapProps.getTokenImage}
      onSrcTokenSelected={twapProps.onSrcTokenSelected}
      onDstTokenSelected={twapProps.onDstTokenSelected}
      TokenSelectModal={twapProps.TokenSelectModal}
    >
      {props.children}
    </TwapProvider>
  );
}
