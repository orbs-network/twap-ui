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
const config = { ...Configs.Lynex };
config.name = "SyncSwap";
const nativeTokenLogo = "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png";
const backendApi = "https://lynex-backend-7e21c8e31085.herokuapp.com/api/v1";

const parseListToken = (tokenList: any) => {
  return tokenList.map(({ symbol, address, decimals, logoURI, name }: any) => ({
    decimals,
    symbol,
    name,
    address,
    logoURI,
  }));
};
export const useDappTokens = () => {
  return useGetTokens({
    chainId: config.chainId,
    parse: parseListToken,
    modifyFetchResponse: (response: any) => {
      return response.data;
    },
    baseAssets: [],
    url: `${backendApi}/assets`,
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
      dstToken={erc20sData.linea.USDC.address} //USDC
      dappTokens={dappTokens}
      TokenSelectModal={TokenSelectModal}
      provider={library}
      isDarkTheme={isDarkTheme}
      limit={limit}
      onTxSubmitted={(args: any) => console.log(args)}
      pallete={pallete}
      priceUsd={priceUsd}
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

const priceUsd = async (address: string) => {
  try {
    const response = await fetch(`${backendApi}/assets`, {
      method: "get",
    });
    const baseAssetsCall = await response.json();
    const baseAssets = baseAssetsCall.data;

    const wbnbPrice = baseAssets.find((asset: any) => asset.address.toLowerCase() === "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f".toLowerCase())?.price;

    const nativeBNB = {
      address: "ETH",
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      price: wbnbPrice,
    };
    baseAssets.unshift(nativeBNB);
    return baseAssets.find((it: any) => it.address.toLowerCase() === address.toLowerCase())?.price;
  } catch (ex) {
    console.error("get baseAssets had error", ex);
    return 0;
  }
};
