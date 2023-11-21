import { StyledLynex, StyledLynexBox, StyledLynexLayout, StyledModalContent } from "./styles";
import { TWAP, Orders } from "@orbs-network/twap-ui-lynex";
import { useConnectWallet, useGetTokens, useTheme } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { SelectorOption, TokenListItem } from "./types";
import _ from "lodash";
import { erc20sData, zeroAddress } from "@defi.org/web3-candies";
import { useMemo, useState } from "react";
import { Configs } from "@orbs-network/twap";

const backendApi = "https://lynex-backend-7e21c8e31085.herokuapp.com/api/v1";

const config = Configs.Lynex;

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
  selectedCurrency?: any;
  onCurrencySelect: (token: any) => void;
  onDismiss: () => void;
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

interface TokenSelectModalProps {
  popup: boolean;
  setPopup: (value: boolean) => void;
  selectedAsset: any;
  setSelectedAsset: (value: any) => void;
  otherAsset: any;
  setOtherAsset: (value: any) => void;
  baseAssets: any[];
  onAssetSelect: () => void;
}

const TokenSelectModal = ({ popup, setPopup, setSelectedAsset, baseAssets }: TokenSelectModalProps) => {
  const tokensListSize = _.size(baseAssets);
  const parsedList = useMemo(() => parseList(baseAssets), [tokensListSize]);

  return (
    <Popup isOpen={popup} onClose={() => setPopup(true)}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={setSelectedAsset} />
      </StyledModalContent>
    </Popup>
  );
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();

  const { isDarkTheme } = useTheme();

  return (
    <TWAP
      provider={library?.givenProvider}
      connect={connect}
      account={account}
      srcToken="ETH"
      dstToken="USDC"
      dappTokens={dappTokens}
      onSrcTokenSelected={(token: any) => console.log(token)}
      onDstTokenSelected={(token: any) => console.log(token)}
      TokenSelectModal={TokenSelectModal}
      isDarkTheme={isDarkTheme}
      limit={limit}
      priceUsd={priceUsd}
    />
  );
};

const logo = "https://app.lynex.fi/images/header/logo.svg";

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <StyledLynex>
      <StyledLynexLayout name={config.name}>
        <UISelector limit={true} select={setSelected} selected={selected} />
        <StyledLynexBox>
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledLynexBox>

        <StyledLynexBox>
          <Orders />
        </StyledLynexBox>
      </StyledLynexLayout>
    </StyledLynex>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;

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
