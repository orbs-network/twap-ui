import TWAP_Spiritswap from "./Twap";
import Orders from "./Orders";
import TWAPLib from "@orbs-network/twap-ui";
import BigNumber from "bignumber.js";
import { convertDecimals } from "@defi.org/web3-candies";
import axios from "axios";
import { ReactNode, useMemo } from "react";
import { QueryClient } from "react-query";
import translations from "./i18n/en.json";

const TwapProvider = TWAPLib.TwapProvider;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

const dappIntegrationChainId = 250;

export const getUsdPrice = async (srcToken: string, srcDecimals: number): Promise<BigNumber> => {
  const amount = BigNumber(10).pow(srcDecimals);

  const USDC = `0x04068DA6C83AFCFA0e13ba15A6696662335D5B75`;
  const result = await axios.get(
    `https://apiv5.paraswap.io/prices/?srcToken=${srcToken}&destToken=${USDC}&srcDecimals=${srcDecimals}&destDecimals=6&amount=${amount}&side=SELL&network=${dappIntegrationChainId}`
  );
  const priceRoute = result.data.priceRoute;
  return convertDecimals(priceRoute.destAmount, priceRoute.destDecimals, 18);
};

export interface TwapProps {
  connect?: () => void;
  TokenSelectModal?: any;
  tokensList: any[];
  account: any;
  getProvider?: () => any;
  getTokenImage?: (value: any) => string;
  onSrcTokenSelected?: (token: any) => void;
  onDstTokenSelected?: (token: any) => void;
}

interface ProviderWrapperProps extends TwapProps {
  children: ReactNode;
}

const useGetProvider = (getProvider?: () => any, account?: string) => {
  return useMemo(() => {
    if (account && getProvider) {
      return getProvider();
    }
    return undefined;
  }, [account]);
};

export const ProviderWrapper = (props: ProviderWrapperProps) => {
  const provider = useGetProvider(props.getProvider, props.account);

  return (
    <TwapProvider
      analyticsID="G-NYX815X5K9"
      translations={translations}
      tokensList={props.tokensList}
      getUsdPrice={getUsdPrice}
      dappIntegration="spiritswap"
      provider={provider}
      connect={props.connect}
      integrationChainId={dappIntegrationChainId}
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
