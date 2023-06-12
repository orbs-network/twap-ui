import { StyledQuickswapBox, StyledModalContent, StyledQuickswapLayout, StyledQuickswap } from "./styles";
import { Orders, TWAP, Limit, QuickSwapTWAPProps, QuickSwapOrdersProps } from "@orbs-network/twap-ui-quickswap";
import { useConnectWallet, useNetwork, useTheme } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { erc20sData, zeroAddress, erc20s } from "@defi.org/web3-candies";
import { TokenListItem } from "./types";
const config = Configs.QuickSwap;

const nativeTokenLogo = "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png";
export const useDappTokens = () => {
  const { account } = useWeb3React();
  const { isInValidNetwork } = useNetwork(config.chainId);

  return useQuery(
    ["useDappTokens", config.chainId],
    async () => {
      const response = await fetch(`https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/polygon.json`);

      const tokenList = await response.json();
      const parsed = tokenList
        .filter((t: any) => t.chainId === config.chainId)
        .map(({ symbol, address, decimals, logoURI, name, chainId }: any) => ({
          decimals,
          symbol,
          name,
          chainId,
          address,
          tokenInfo: { address, chainId, decimals, symbol, name, logoURI: (logoURI as string)?.replace("/logo_24.png", "/logo_48.png") },
          tags: [],
        }));
      const candiesAddresses = [zeroAddress, ..._.map(erc20s.poly, (t) => t().address)];

      const _tokens = _.sortBy(parsed, (t: any) => {
        const index = candiesAddresses.indexOf(t.address);
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
      });

      return { ..._.mapKeys(_tokens, (t) => t.address) } as any;
    },
    { enabled: !!account && !isInValidNetwork }
  );
};

interface TokenSelectModalProps {
  isOpen: boolean;
  selectedToken?: any;
  onCurrencySelect: (token: any) => void;
  onDismiss: () => void;
}

const parseList = (rawList?: any): TokenListItem[] => {
  return _.map(rawList, (rawToken) => {
    return {
      token: {
        address: rawToken.address ?? rawToken.tokenInfo?.address,
        decimals: rawToken.decimals ?? rawToken.tokenInfo?.decimals,
        symbol: rawToken.symbol ?? rawToken.tokenInfo?.symbol,
        logoUrl: rawToken.tokenInfo?.logoURI || nativeTokenLogo,
      },
      rawToken,
    };
  });
};

const TokenSelectModal = ({ isOpen, onCurrencySelect, onDismiss }: TokenSelectModalProps) => {
  const { data: tokensList } = useDappTokens();
  const tokensListSize = _.size(tokensList);
  const parsedList = useMemo(() => parseList(tokensList), [tokensListSize]);

  return (
    <Popup isOpen={isOpen} onClose={onDismiss}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={onCurrencySelect} />
      </StyledModalContent>
    </Popup>
  );
};
const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/8206.png";
const DappComponent = () => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();

  const getTokenLogoURL = (address: string) => {
    if (!dappTokens) return "";
    const token = dappTokens[address];
    if (!token) {
      return null;
    }
    return token.tokenInfo ? token.tokenInfo.logoURI : nativeTokenLogo;
  };

  const twapProps: QuickSwapTWAPProps = {
    connect,
    account,
    srcToken: zeroAddress,
    dstToken: erc20sData.poly.USDC.address, //USDC
    dappTokens,
    onSrcTokenSelected: (token: any) => console.log(token),
    onDstTokenSelected: (token: any) => console.log(token),
    TokenSelectModal,
    provider: library,
    getTokenLogoURL,
    isDarkTheme,
  };
  const ordersProps: QuickSwapOrdersProps = { account, dappTokens, provider: library, getTokenLogoURL, isDarkTheme };

  return (
    <StyledQuickswap isDarkMode={isDarkTheme ? 1 : 0}>
      <StyledQuickswapLayout name={config.name}>
        <UISelector
          options={[
            {
              title: "TWAP",
              component: (
                <StyledQuickswapBox isDarkMode={isDarkTheme ? 1 : 0}>
                  <TWAP {...twapProps} />
                </StyledQuickswapBox>
              ),
            },
            {
              title: "LIMIT",
              component: (
                <StyledQuickswapBox isDarkMode={isDarkTheme ? 1 : 0}>
                  <Limit {...twapProps} />
                </StyledQuickswapBox>
              ),
            },
          ]}
        />
        <Orders {...ordersProps} />
      </StyledQuickswapLayout>
    </StyledQuickswap>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;
