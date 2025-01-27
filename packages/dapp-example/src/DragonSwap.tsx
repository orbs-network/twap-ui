import { StyledSushiLayout, StyledSushi, StyledSushiModalContent } from "./styles";
import { TWAP } from "@orbs-network/twap-ui-generic";
import { useConnectWallet, useGetTokens, usePriceUSD, useTheme, useTrade } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, Popup, TokensList, UISelector } from "./Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import MuiTooltip from "@mui/material/Tooltip";
import { SelectorOption, TokenListItem } from "./types";
import { mapCollection, size, TooltipProps, Configs, TokensListModalProps, ModalProps } from "@orbs-network/twap-ui";
import { DappProvider } from "./context";
import { network } from "@defi.org/web3-candies";

const config = Configs.SushiArb;

console.log(Configs.TeaFi);


export const useDappTokens = () => {
  const isBase = config?.chainId === Configs.SushiBase.chainId;
  const { chainId } = useWeb3React();
  const nativeToken = network(config.chainId).native;
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
        decimals: nativeToken.decimals,
        symbol: nativeToken.symbol,
        address: nativeToken.address,
        logoURI: nativeToken.logoUrl,
      };

      return config ? [native, ...res] : res;
    },
    [nativeToken, config?.chainId],
  );

  const url = useMemo(() => {
    switch (chainId) {
      case Configs.SushiEth.chainId:
      case Configs.SushiArb.chainId:
        return "https://token-list.sushi.com/";
      default:
        break;
    }
  }, [chainId]);

  return useGetTokens({
    url,
    parse: parseListToken,
    tokens: isBase ? [] : undefined,
    modifyList: (tokens: any) => tokens.slice(0, 20),
  });
};

const parseList = (rawList?: any): TokenListItem[] => {
  return mapCollection(rawList, (rawToken: any) => {
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

const TokensListModal = ({ isOpen, onSelect, onClose }: TokensListModalProps) => {
  const { data: baseAssets } = useDappTokens();
  const { isDarkTheme } = useTheme();
  const tokensListSize = size(baseAssets);
  const parsedList = useMemo(() => parseList(baseAssets), [tokensListSize]);

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledSushiModalContent isDarkTheme={isDarkTheme ? 1 : 0}>
        <TokensList tokens={parsedList} onClick={onSelect} />
      </StyledSushiModalContent>
    </Popup>
  );
};

const Modal = (props: ModalProps) => {
  return (
    <Popup isOpen={props.isOpen} onClose={props.onClose}>
      {props.children}
    </Popup>
  );
};

const getTokenLogo = (token: any) => {
  return token.logoURI;
};

const useUSD = (address?: string) => {
  const res = usePriceUSD(address);
  return res?.toString();
};

const Tooltip = (props: TooltipProps) => {
  return (
    <MuiTooltip title={props.tooltipText} arrow>
      <span>{props.children}</span>
    </MuiTooltip>
  );
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

  const connector = useMemo(() => {
    return {
      getProvider: () => library,
    };
  }, [library]);

  useEffect(() => {
    setFromToken(undefined);
    setToToken(undefined);
  }, [chainId]);

  useEffect(() => {
    if (!fromToken) {
      setFromToken(dappTokens?.[1]);
    }
    if (!toToken) {
      setToToken(dappTokens?.[3]);
    }
  }, [dappTokens, toToken, fromToken]);

  const onSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <TWAP
      config={config}
      connect={connect}
      account={account}
      connector={connector}
      srcToken={fromToken}
      dstToken={toToken}
      dappTokens={dappTokens}
      isDarkTheme={isDarkTheme}
      useMarketPrice={_useTrade}
      chainId={chainId}
      isLimitPanel={limit}
      getTokenLogo={getTokenLogo}
      useUSD={useUSD}
      onSrcTokenSelected={setFromToken}
      onDstTokenSelected={setToToken}
      onSwitchTokens={onSwitchTokens}
      components={{ Tooltip, TokensListModal, Modal }}
    />
  );
};

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);
  const { isDarkTheme } = useTheme();

  return (
    <DappProvider config={config}>
      <StyledSushi isDarkMode={isDarkTheme ? 1 : 0}>
        <StyledSushiLayout name={config.name}>
          <UISelector selected={selected} select={setSelected} limit={true} />

          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledSushiLayout>
      </StyledSushi>
    </DappProvider>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo: "https://avatars.githubusercontent.com/u/157521400?s=200&v=4",
  configs: [config],
  path: "dragonswap",
};

export default dapp;
