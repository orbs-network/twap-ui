import { StyledModalContent, StyledSushiLayout, StyledSushi } from "./styles";
import { TWAP } from "@orbs-network/twap-ui-sushiswap";
import { useConnectWallet, useGetTokens, usePriceUSD, useTheme, useTrade } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { SelectorOption, TokenListItem } from "./types";
import { Components, getConfig } from "@orbs-network/twap-ui";
import { DappProvider } from "./context";
import { baseSwapTokens } from "./BaseSwap";

const name = "SushiSwap";
const configs = [Configs.SushiArb, Configs.SushiBase];

export const useDappTokens = () => {
  const config = useConfig();
  const isBase = config?.chainId === Configs.SushiBase.chainId;
  const { chainId } = useWeb3React();
  const parseListToken = useCallback(
    (tokenList?: any) => {
      if (isBase) {
        return _.map(baseSwapTokens, (it, key) => {
          return {
            address: key,
            decimals: it.decimals,
            symbol: it.symbol,
            logoURI: it.tokenInfo.logoURI,
          };
        });
      }

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
      default:
        break;
    }
  }, [chainId]);

  return useGetTokens({
    url,
    parse: parseListToken,
    tokens: isBase ? baseSwapTokens : undefined,
    modifyList: (tokens: any) => tokens.slice(0, 20),
  });
};

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

const TokenSelectModal = ({ children, onSelect, selected }: { children: ReactNode; onSelect: (value: any) => void; selected: any }) => {
  const { data: baseAssets } = useDappTokens();
  const [open, setOpen] = useState(false);

  const tokensListSize = _.size(baseAssets);
  const parsedList = useMemo(() => parseList(baseAssets), [tokensListSize]);

  const _onSelect = (value: any) => {
    setOpen(false);
    onSelect(value);
  };

  return (
    <>
      <Components.Base.Modal open={open} onClose={() => setOpen(false)}>
        <StyledModalContent>
          <TokensList tokens={parsedList} onClick={_onSelect} />
        </StyledModalContent>
      </Components.Base.Modal>
      <div onClick={() => setOpen(true)}>{children}</div>
    </>
  );
};

const getTokenLogo = (token: any) => {
  return token.logoURI;
};

const useUSD = (address?: string) => {
  const res = usePriceUSD(address);
  return res?.toString();
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library, chainId } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();
  const [fromToken, setFromToken] = useState(undefined);
  const [toToken, setToToken] = useState(undefined);

  const _useTrade = (fromToken?: string, toToken?: string, amount?: string) => {
    return useTrade(fromToken, toToken, amount, dappTokens);
  };

  useEffect(() => {
    setFromToken(undefined);
    setToToken(undefined);
  }, [chainId]);

  useEffect(() => {
    if (!fromToken) {
      setFromToken(dappTokens?.[1]);
    }
    if (!toToken) {
      setToToken(dappTokens?.[2]);
    }
  }, [dappTokens, toToken]);

  const onSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <TWAP
      connect={connect}
      account={account}
      srcToken={fromToken}
      dstToken={toToken}
      dappTokens={dappTokens}
      TokenSelectModal={TokenSelectModal}
      provider={library}
      isDarkTheme={isDarkTheme}
      useTrade={_useTrade}
      limit={limit}
      Modal={SushiModal}
      getTokenLogo={getTokenLogo}
      useUSD={useUSD}
      onSrcTokenSelected={(it: any) => setFromToken(it)}
      onDstTokenSelected={(it: any) => setToToken(it)}
      onSwitchTokens={onSwitchTokens}
    />
  );
};

const SushiModal = ({ children, title, header, open, onClose }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; header?: ReactNode }) => {
  return (
    <Components.Base.Modal header={header} hideHeader={!title && !header} title={title} open={open} onClose={onClose}>
      {children}
    </Components.Base.Modal>
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
