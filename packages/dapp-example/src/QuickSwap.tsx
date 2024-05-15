import { StyledQuickswapBox, StyledModalContent, StyledQuickswapLayout, StyledQuickswap } from "./styles";
import { useConnectWallet, useGetTokens, usePriceUSD, useTheme, useTrade } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { erc20s } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import { TWAP, Orders } from "@orbs-network/twap-ui-quickswap";
import BN from "bignumber.js";
import { hooks } from "@orbs-network/twap-ui";
const config = Configs.QuickSwap;

const nativeTokenLogo = "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png";

const parseListToken = (tokenList: any) => {
  return tokenList
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
};
export const useDappTokens = () => {
  return useGetTokens({
    chainId: config.chainId,
    parse: parseListToken,
    modifyList: (tokens: any) => ({ ..._.mapKeys(tokens, (t) => t.address) }),
    baseAssets: erc20s.poly,
    url: `https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/polygon.json`,
  });
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

const useDecimals = (fromToken?: string, toToken?: string) => {
  const { data: dappTokens } = useDappTokens();
  const fromTokenDecimals = dappTokens?.[fromToken || ""]?.decimals;
  const toTokenDecimals = dappTokens?.[toToken || ""]?.decimals;
  return { fromTokenDecimals, toTokenDecimals };
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();
  const [fromAmount, setFromAmount] = useState("");
  const [fromToken, setFromToken] = useState<any>(undefined);
  const [toToken, setToToken] = useState<any>(undefined);

  useEffect(() => {
    if (!dappTokens) return;
    if (!fromToken) setFromToken(Object.values(dappTokens).find((it: any) => it.symbol === "WBTC"));
    if (!toToken) setToToken(Object.values(dappTokens).find((it: any) => it.symbol === "USDC"));
  }, [dappTokens, fromToken, toToken]);

  const getTokenLogoURL = useCallback(
    (address: string) => {
      if (!dappTokens) return "";
      const token = dappTokens[address];
      if (!token) {
        return null;
      }
      return token.tokenInfo ? token.tokenInfo.logoURI : nativeTokenLogo;
    },
    [_.size(dappTokens)]
  );

  const onInputChange = (e: any) => {
    setFromAmount(e);
  };

  const { fromTokenDecimals, toTokenDecimals } = useDecimals(fromToken?.address, toToken?.address);

  const trade = useTrade(fromToken?.address, toToken?.address, fromAmount, fromTokenDecimals, toTokenDecimals);
  console.log({ trade: trade.outAmount });

  return (
    <TWAP
      connect={connect}
      account={account}
      srcToken={fromToken?.address}
      dstToken={toToken?.address}
      dappTokens={dappTokens}
      onSrcTokenSelected={(token: any) => setFromToken(token)}
      onDstTokenSelected={(token: any) => setToToken(token)}
      TokenSelectModal={TokenSelectModal}
      provider={library}
      getTokenLogoURL={getTokenLogoURL}
      isDarkTheme={isDarkTheme}
      limit={limit}
      onTxSubmitted={(args: any) => console.log(args)}
      usePriceUSD={usePriceUSD}
      onInputChange={onInputChange}
      dstAmountOut={trade.outAmount}
      dstAmountLoading={BN(fromAmount).gt(0) && trade.isLoading}
    />
  );
};
const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/8206.png";
const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  const { isDarkTheme } = useTheme();

  return (
    <StyledQuickswap isDarkMode={isDarkTheme ? 1 : 0}>
      <StyledQuickswapLayout name={config.name}>
        <UISelector select={setSelected} selected={selected} limit={true} />
        <StyledQuickswapBox isDarkMode={isDarkTheme ? 1 : 0}>
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledQuickswapBox>
        <StyledQuickswapBox isDarkMode={isDarkTheme ? 1 : 0}>
          <Orders />
        </StyledQuickswapBox>
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
