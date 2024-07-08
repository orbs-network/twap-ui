import { StyledModalContent, StyledSushiLayout, StyledSushi } from "./styles";
import { TWAP } from "@orbs-network/twap-ui-sushiswap";
import { useConnectWallet, useGetPriceUsdCallback, useGetTokens, useTheme, useTrade } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useCallback, useMemo, useState } from "react";
import _ from "lodash";
import { zeroAddress } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import { Components, getConfig } from "@orbs-network/twap-ui";
import { DappProvider } from "./context";

const name = "SushiSwap";
const configs = [Configs.SushiArb, Configs.SushiBase];

export const useDappTokens = () => {
  const config = useConfig();
  const { chainId } = useWeb3React();
  const parseListToken = useCallback(
    (tokenList?: any) => {
      const res = tokenList?.tokens
        .filter((it: any) => it.chainId === config?.chainId)
        .map(({ symbol, address, decimals, logoURI, name }: any) => ({
          decimals,
          symbol,
          name,
          address,
          logoURI,
        }));

      const native = {
        decimals: config?.nativeToken.decimals,
        symbol: config?.nativeToken.symbol,
        address: config?.nativeToken.address,
        logoURI: config?.nativeToken.logoUrl,
      };

      return config ? [native, ...res] : res;
    },
    [config?.nativeToken, config?.chainId]
  );

  const url = useMemo(() => {
    switch (chainId) {
      case Configs.SushiArb.chainId:
        return "https://token-list.sushi.com/";
      case Configs.SushiBase.chainId:
        return "https://tokens.coingecko.com/base/all.json";
      default:
        break;
    }
  }, [chainId]);

  return useGetTokens({
    url,
    parse: parseListToken,
    modifyList: (tokens: any) => tokens.slice(0, 20),
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

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();
  const priceUsd = useGetPriceUsdCallback();

  const _useTrade = (fromToken?: string, toToken?: string, amount?: string) => {
    return useTrade(fromToken, toToken, amount, dappTokens);
  };

  return (
    <TWAP
      connect={connect}
      account={account}
      srcToken={zeroAddress}
      dstToken="DAI"
      dappTokens={dappTokens}
      TokenSelectModal={TokenSelectModal}
      provider={library}
      isDarkTheme={isDarkTheme}
      priceUsd={priceUsd}
      useTrade={_useTrade}
      limit={limit}
      Modal={Components.Base.Modal}
    />
  );
};

const useConfig = () => {
  const { chainId } = useWeb3React();

  return useMemo(() => getConfig(configs, chainId), [chainId]);
};

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);
  const { isDarkTheme } = useTheme();

  const config = useConfig();

  return (
    <DappProvider config={config}>
      <StyledSushi isDarkMode={isDarkTheme ? 1 : 0}>
        <StyledSushiLayout name={name}>
          <UISelector selected={selected} select={setSelected} limit={true} />

          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledSushiLayout>
      </StyledSushi>
    </DappProvider>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo: "https://cdn.cdnlogo.com/logos/s/10/sushiswap.svg",
  configs: [Configs.SushiArb, Configs.SushiBase],
  path: name.toLowerCase(),
  workInProgress: true,
};

export default dapp;
