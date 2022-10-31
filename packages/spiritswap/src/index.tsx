import TWAP_Spiritswap from "./Twap";
import Orders from "./Orders";
import TWAPLib from "@orbs-network/twap-ui";
import BigNumber from "bignumber.js";
import { convertDecimals } from "@defi.org/web3-candies";
import axios from "axios";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

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

  const result = await axios.get(
    `https://apiv5.paraswap.io/prices/?srcToken=${srcToken}&destToken=0x04068DA6C83AFCFA0e13ba15A6696662335D5B75&srcDecimals=${srcDecimals}&destDecimals=8&amount=${amount}&side=SELL&network=${dappIntegrationChainId}`
  );
  const priceRoute = result.data.priceRoute;
  return convertDecimals(priceRoute.destAmount, priceRoute.destDecimals, 18);
};

interface ProviderWrapperProps {
  provider: any;
  connect: () => void;
  TokenSelectModal: any;
  children: ReactNode;
  tokensList: any[];
}
export const ProviderWrapper = (props: ProviderWrapperProps) => {
  return (
    <TwapProvider
      tokensList={props.tokensList}
      getUsdPrice={getUsdPrice}
      dappIntegration="spiritswap"
      provider={props.provider}
      connect={props.connect}
      integrationChainId={dappIntegrationChainId}
      TokenSelectModal={props.TokenSelectModal}
    >
      {props.children}
    </TwapProvider>
  );
};

export { TWAP_Spiritswap, Orders };
