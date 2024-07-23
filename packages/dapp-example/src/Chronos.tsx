import { StyledChronos, StyledStyledChronosPanel, StyledStyledChronosOrders, StyledChronosLayout, StyledModalContent } from "./styles";
import { useConnectWallet, useGetPriceUsdCallback, useGetTokens, useTheme, useTrade } from "./hooks";
import { Configs } from "@orbs-network/twap-ui";

import { TWAP } from "@orbs-network/twap-ui-chronos";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { erc20s, zeroAddress, erc20sData, isNativeAddress, network } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import { DappProvider } from "./context";
import { size } from "@orbs-network/twap-ui";
const config = Configs.Chronos;

const tokensURL = "https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/arbitrum.json";

const nativeToken = network(config.chainId).native;

const parseListToken = (item?: any[]) => {
  return item?.map((token: any) => {
    return {
      decimals: token.decimals,
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      logoURI: isNativeAddress(token.address) ? nativeToken.logoUrl : token.logoURI,
    };
  });
};
const useDappTokens = () => {
  return useGetTokens({ url: tokensURL, parse: parseListToken, baseAssets: erc20s.arb });
};

interface TokenSelectModalProps {
  open: boolean;
  selectToken: (token: any) => void;
  setOpen: () => void;
}

const parseList = (rawList?: any): TokenListItem[] => {
  return rawList.map((rawToken: any) => {
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

  const tokensListSize = size(tokensList);
  const parsedList = useMemo(() => parseList(tokensList), [tokensListSize]);

  return (
    <Popup isOpen={open} onClose={setOpen}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={selectToken} />
      </StyledModalContent>
    </Popup>
  );
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library } = useWeb3React();

  const connect = useConnectWallet();
  const { data: dappTokens = [] } = useDappTokens();

  const { isDarkTheme } = useTheme();
  const priceUsd = useGetPriceUsdCallback();
  const connector = {
    getProvider: () => library,
  };

  const _useTrade = (fromToken?: string, toToken?: string, amount?: string) => {
    return useTrade(fromToken, toToken, amount, dappTokens);
  };

  const getTokenLogoURL = useCallback(
    (symbol: string) => {
      return dappTokens.find((t: any) => t.symbol === symbol)?.logoURI;
    },
    [dappTokens],
  );

  return (
    <TWAP
      connect={connect}
      account={account}
      // srcToken={zeroAddress}
      // dstToken={erc20sData.arb.USDC.address}
      dappTokens={dappTokens}
      TokenSelectModal={TokenSelectModal}
      connector={connector}
      getTokenLogoURL={getTokenLogoURL}
      limit={limit}
      isDarkTheme={isDarkTheme}
      swapAnimationStart={false}
      useTrade={_useTrade}
      onSrcTokenSelected={(token: any) => console.log(token)}
      onDstTokenSelected={(token: any) => console.log(token)}
    />
  );
};

const logo = "https://chronos.exchange/wp-content/uploads/2023/03/1-1-1.png";
const DappComponent = () => {
  const { isDarkTheme } = useTheme();
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkTheme]);

  return (
    <DappProvider config={config}>
      <StyledChronos isDarkMode={isDarkTheme ? 1 : 0}>
        <StyledChronosLayout name={config.name}>
          <UISelector selected={selected} select={setSelected} limit={true} />
          <StyledStyledChronosPanel>
            <TWAPComponent limit={selected === SelectorOption.LIMIT} />
          </StyledStyledChronosPanel>

          <StyledStyledChronosOrders></StyledStyledChronosOrders>
        </StyledChronosLayout>
      </StyledChronos>
    </DappProvider>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  configs: [config],
  path: config.name.toLowerCase(),
};

export default dapp;
