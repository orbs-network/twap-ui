import { StyledChronos, StyledChronosLayout, StyledModalContent } from "./styles";
import { Orders, TWAP, Limit, ChronosTWAPProps, ChronosOrdersProps } from "@orbs-network/twap-ui-chronos";
import { useConnectWallet, useNetwork, useTheme } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { erc20s, zeroAddress } from "@defi.org/web3-candies";
import { TokenListItem } from "./types";
const config = Configs.Chronos;

const getTokenLogoURL = (symbol: string) => {
  if (symbol === "ETH") {
    return config.nativeToken.logoUrl!;
  }

  return `https://dexapi.chronos.exchange/tokens/${symbol}.png`;
};

export const useDappTokens = () => {
  const { account } = useWeb3React();
  const { isInValidNetwork } = useNetwork(config.chainId);

  return useQuery(
    ["useDappTokens", config.chainId],
    async () => {
      const response = await fetch(`https://dexapi.chronos.exchange/pairs/tokens`);

      const data = (await response.json()).data;
      const tokens = [config.nativeToken, ...data.tokens];

      const parsed = tokens.map(({ symbol, address, decimals, name }: any) => ({
        decimals,
        symbol,
        name,
        address,
        logoURI: getTokenLogoURL(symbol),
      }));

      const candiesAddresses = [zeroAddress, ..._.map(erc20s.arb, (t) => t().address)];

      return _.sortBy(parsed, (t: any) => {
        const index = candiesAddresses.indexOf(t.address);
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
      });
    },
    { enabled: !!account && !isInValidNetwork, staleTime: Infinity }
  );
};

interface TokenSelectModalProps {
  open: boolean;
  selectToken: (token: any) => void;
  setOpen: () => void;
}

const parseList = (rawList?: any): TokenListItem[] => {
  return _.map(rawList, (rawToken) => {
    return {
      token: {
        address: rawToken.address,
        decimals: rawToken.decimals,
        symbol: rawToken.symbol,
        logoUrl: rawToken.logoURI,
      },
      rawToken,
    };
  });
};

const TokenSelectModal = ({ open, selectToken, setOpen }: TokenSelectModalProps) => {
  const { data: tokensList } = useDappTokens();
  console.log({ tokensList });

  const tokensListSize = _.size(tokensList);
  const parsedList = useMemo(() => parseList(tokensList), [tokensListSize]);

  return (
    <Popup isOpen={open} onClose={setOpen}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={selectToken} />
      </StyledModalContent>
    </Popup>
  );
};
const logo = "https://chronos.exchange/wp-content/uploads/2023/03/1-1-1.png";
const DappComponent = () => {
  const { account, library } = useWeb3React();

  const connect = useConnectWallet();
  const { data: dappTokens = [] } = useDappTokens();
  const { isDarkTheme } = useTheme();

  const twapProps: ChronosTWAPProps = {
    connect,
    account,
    srcToken: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    dstToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    dappTokens,
    TokenSelectModal,
    provider: library,
    getTokenLogoURL,
  };
  const ordersProps: ChronosOrdersProps = { account, dappTokens, provider: library, getTokenLogoURL, isDarkTheme };

  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkTheme]);

  return (
    <StyledChronos isDarkMode={isDarkTheme ? 1 : 0}>
      <StyledChronosLayout name={config.partner}>
        <UISelector
          options={[
            {
              title: "TWAP",
              component: <TWAP {...twapProps} />,
            },
            {
              title: "LIMIT",
              component: <Limit {...twapProps} />,
            },
          ]}
        />
        <Orders {...ordersProps} />
      </StyledChronosLayout>
    </StyledChronos>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
  workInProgress: true,
};

export default dapp;
