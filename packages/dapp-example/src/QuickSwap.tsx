import { StyledQuickswapBox, StyledModalContent, StyledQuickswapLayout, StyledQuickswap } from "./styles";
import { useConnectWallet, useGetTokens, usePriceUSD, useTheme, useTrade } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { erc20s } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import { TWAP } from "@orbs-network/twap-ui-quickswap";
import { mapKeys, size, Configs } from "@orbs-network/twap-ui";
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
    parse: parseListToken,
    modifyList: (tokens: any) => ({ ...mapKeys(tokens, (t: any) => t.address) }),
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
  return rawList?.map((rawToken: any) => {
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
  const tokensListSize = size(tokensList);
  const parsedList = useMemo(() => parseList(tokensList), [tokensListSize]);

  return (
    <Popup isOpen={isOpen} onClose={onDismiss}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={onCurrencySelect} />
      </StyledModalContent>
    </Popup>
  );
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
    [dappTokens],
  );

  const onInputChange = (e: any) => {
    setFromAmount(e);
  };

  return null;

  // return (
  //   <TWAP
  //     connect={connect}
  //     account={account}
  //     // srcToken={fromToken?.address}
  //     // dstToken={toToken?.address}
  //     dappTokens={dappTokens}
  //     onSrcTokenSelected={(token: any) => setFromToken(token)}
  //     onDstTokenSelected={(token: any) => setToToken(token)}
  //     TokenSelectModal={TokenSelectModal}
  //     provider={library}
  //     getTokenLogoURL={getTokenLogoURL}
  //     isDarkTheme={isDarkTheme}
  //     limit={limit}
  //     onTxSubmitted={(args: any) => console.log(args)}
  //     usePriceUSD={usePriceUSD}
  //     onInputChange={onInputChange}
  //   />
  // );
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
        <StyledQuickswapBox isDarkMode={isDarkTheme ? 1 : 0}></StyledQuickswapBox>
      </StyledQuickswapLayout>
    </StyledQuickswap>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  configs: [config],
  path: config.name.toLowerCase(),
};

export default dapp;
