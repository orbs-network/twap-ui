import { StyledModalContent, StyledThenaLayout, StyledThenaBox, StyledThena } from "./styles";
import { TWAP, Orders } from "@orbs-network/twap-ui-thena";
import { hooks } from "@orbs-network/twap-ui";

import { useConnectWallet, useGetPriceUsdCallback, useGetTokens, useTheme, useTrade } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { erc20s, isNativeAddress } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import BN from "bignumber.js";
const config = Configs.Thena;
const nativeTokenLogo = "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png";

const pasrseListToken = (tokenList?: any) => {
  return tokenList?.tokens.map(({ symbol, address, decimals, logoURI, name, price }: any) => ({
    decimals,
    symbol,
    name,
    address,
    logoURI: isNativeAddress(address) ? nativeTokenLogo : logoURI,
    price,
  }));
};
export const useDappTokens = () => {
  return useGetTokens({
    chainId: config.chainId,
    parse: pasrseListToken,
    modifyList: (tokens: any) => {
      return [config.nativeToken, ...tokens];
    },
    url: "https://lhthena.s3.us-east-2.amazonaws.com/token-list-lh.json",
    baseAssets: erc20s.bsc,
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

const _useTrade = (fromToken?: any, toToken?: any, amount?: string) => {
  const _amount = hooks.useAmountBN(fromToken?.decimals, amount);

  return useTrade(fromToken?.address, toToken?.address, _amount, fromToken?.decimals, toToken?.decimals);
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();
  const priceUsd = useGetPriceUsdCallback();
  const [fromToken, setFromToken] = useState<any>(undefined);
  const [dstToken, setDstToken] = useState<any>(undefined);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!dappTokens) return;
    if (!fromToken) {
      setFromToken(dappTokens[1]);
    }
    if (!dstToken) {
      setDstToken(dappTokens[2]);
    }
  }, [dappTokens, fromToken, dstToken]);

  const connector = useMemo(() => {
    return {
      getProvider: () => library,
    };
  }, [library]);

  const trade = _useTrade(fromToken, dstToken, amount);

  return (
    <TWAP
      connect={connect}
      account={account}
      srcToken={fromToken?.address}
      dstToken={dstToken?.address}
      dappTokens={dappTokens}
      TokenSelectModal={TokenSelectModal}
      provider={library}
      isDarkTheme={isDarkTheme}
      limit={limit}
      priceUsd={priceUsd}
      connector={connector}
      onSrcTokenSelected={setFromToken}
      onDstTokenSelected={setDstToken}
      setFromAmount={setAmount}
    />
  );
};

const logo =
  "https://www.gitbook.com/cdn-cgi/image/width=40,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F2770290301-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fp4Ew3qUZPqMSVg5hJI12%252Ficon%252FIfdx379foqQ3kMzwzmSx%252FTHE.png%3Falt%3Dmedia%26token%3D67208295-11aa-4faa-9c85-117b381682f3";
const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  const { isDarkTheme } = useTheme();

  return (
    <StyledThena isDarkMode={isDarkTheme ? 1 : 0}>
      <StyledThenaLayout name={config.name}>
        <UISelector select={setSelected} selected={selected} limit={true} />

        <StyledThenaBox isDarkMode={isDarkTheme ? 1 : 0}>
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledThenaBox>

        <StyledThenaBox isDarkMode={isDarkTheme ? 1 : 0}>
          <Orders />
        </StyledThenaBox>
      </StyledThenaLayout>
    </StyledThena>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;
