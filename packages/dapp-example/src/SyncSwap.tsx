import { StyledModalContent, StyledQuickswapLayout, StyledSyncSwap, StyledSyncSwapBox } from "./styles";
import { useConnectWallet, useGetTokens, useTheme } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useCallback, useMemo, useState } from "react";
import _ from "lodash";
import { erc20sData, zeroAddress, erc20s } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import { TWAP, Orders } from "@orbs-network/twap-ui-syncswap";
import { createTheme, ThemeProvider } from "@mui/material";
const config = { ...Configs.QuickSwap };
config.name = "SyncSwap";
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

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();

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

  return (
    <TWAP
      connect={connect}
      account={account}
      srcToken={zeroAddress}
      dstToken={erc20sData.poly.USDC.address} //USDC
      dappTokens={dappTokens}
      onSrcTokenSelected={(token: any) => console.log(token)}
      onDstTokenSelected={(token: any) => console.log(token)}
      TokenSelectModal={TokenSelectModal}
      provider={library}
      getTokenLogoURL={getTokenLogoURL}
      isDarkTheme={isDarkTheme}
      limit={limit}
      onTxSubmitted={(args: any) => console.log(args)}
      pallete={pallete}
    />
  );
};

const logo = "https://syncswap.xyz/images/syncswap.svg";
const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  const { isDarkTheme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <StyledSyncSwap className={isDarkTheme ? pallete.background : pallete.background} isDarkMode={isDarkTheme ? 1 : 0}>
        <StyledQuickswapLayout name={config.name}>
          <UISelector select={setSelected} selected={selected} limit={true} />
          <StyledSyncSwapBox>
            <TWAPComponent limit={selected === SelectorOption.LIMIT} />
          </StyledSyncSwapBox>
          <StyledSyncSwapBox>
            <Orders />
          </StyledSyncSwapBox>
        </StyledQuickswapLayout>
      </StyledSyncSwap>
    </ThemeProvider>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
  workInProgress: true,
};

export default dapp;

const pallete = {
  normal: "#060828",
  primary: "#5155a6", // #4E529A // zkSync official color darker
  secondary: "#474ba3", // #4E529A #494c91
  banner: "#e4e2ff",

  overlay: "#ffffff",
  overlay2: "#F6F5FA",
  //overlay3: '#f0f0f5',

  error: "#d50000",
  info: "#6f7183", // rgb(110, 114, 125)
  light: "#e5e5e5",
  light2: "#dbdbdb",
  disable: "#505050",

  background: "theme-background-light",
  banner2: "theme-banner-light",
  portfolio: "theme-portfolio-light",
};

const theme = createTheme({
  palette: {
    primary: {
      main: pallete.primary,
    },
  },
});