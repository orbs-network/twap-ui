import { StyledDragonswap, StyledDragonLayout, StyledDragonPanel, StyledDragonswapModalContent } from "../styles";
import { TWAP } from "@orbs-network/twap-ui-dragonswap";
import tokens from "./token.json";
import { useConnectWallet, useGetTokens, usePriceUSD, useTheme, useTrade } from "../hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, Popup, TokensList, UISelector } from "../Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import MuiTooltip from "@mui/material/Tooltip";
import { SelectorOption, TokenListItem } from "../types";
import {
  mapCollection,
  size,
  TooltipProps,
  Configs,
  TokensListModalProps,
  ModalProps,
  Widget,
  OnWrapSuccessArgs,
  OnApproveSuccessArgs,
  OnCreateOrderSuccessArgs,
} from "@orbs-network/twap-ui";
import { DappProvider } from "../context";
import { eqIgnoreCase, network, networks } from "@defi.org/web3-candies";

const config = Configs.DragonSwap;
  console.log({config});
  
export const useDappTokens = () => {
  const nativeToken = network(config.chainId).native;
  const parseListToken = useCallback(
    (tokenList?: any) => {
      const res = tokenList?.tokens
        .filter((it: any) => it.chainId === config?.chainId)
        .map(({ symbol, address, decimals, name }: any) => ({
          decimals,
          symbol,
          name,
          address,
          logoURI: `https://dzyb4dm7r8k8w.cloudfront.net/prod/logos/${address}/logo.png`,
        }));
      return res;
    },
    [nativeToken, config?.chainId],
  );

  return useGetTokens({
    parse: parseListToken,
    tokens: tokens,
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
      <StyledDragonswapModalContent isDarkTheme={isDarkTheme ? 1 : 0}>
        <TokensList tokens={parsedList} onClick={onSelect} />
      </StyledDragonswapModalContent>
    </Popup>
  );
};

const Modal = (props: ModalProps) => {
  const { isDarkTheme } = useTheme();

  return (
    <Popup isOpen={props.isOpen} onClose={props.onClose}>
      <StyledDragonswapModalContent isDarkTheme={isDarkTheme ? 1 : 0}>{props.children}</StyledDragonswapModalContent>
    </Popup>
  );
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

const onWrapSuccess = (args: OnWrapSuccessArgs) => {
  console.log("onWrapSuccess", args.token, args.txHash);
};

const onApproveSuccess = (args: OnApproveSuccessArgs) => {
  console.log("onApproveSuccess", args.token, args.txHash);
};

const onCreateOrderSuccess = (args: OnCreateOrderSuccessArgs) => {
  console.log("onCreateOrderSuccess");
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library, chainId } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();
  const [fromToken, setFromToken] = useState<any>(undefined);
  const [toToken, setToToken] = useState<any>(undefined);

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

  const onSwitchFromNativeToWtoken = useCallback(() => {
    const wToken = Object.values(networks).find((it) => it.id === chainId)?.wToken.address;
    const token = dappTokens.find((it: any) => eqIgnoreCase(it.address, wToken || ""));
    if (token) {
      setFromToken(token);
    }
  }, [dappTokens, chainId]);

  return (
    <TWAP
      title={limit ? "Limit" : "TWAP"}
      connect={connect}
      account={account}
      connector={connector}
      srcTokenAddress={fromToken?.address}
      dstTokenAddress={toToken?.address}
      dexTokens={dappTokens}
      isDarkTheme={isDarkTheme}
      useMarketPrice={_useTrade}
      chainId={chainId}
      isLimitPanel={limit}
      useUSD={useUSD}
      onSrcTokenSelected={setFromToken}
      onDstTokenSelected={setToToken}
      onSwitchFromNativeToWtoken={onSwitchFromNativeToWtoken}
      onSwitchTokens={onSwitchTokens}
      components={{ Tooltip, TokensListModal, Modal }}
      isExactAppoval={true}
      minChunkSizeUsd={4}
      callbacks={{
        onWrapSuccess,
        onApproveSuccess,
        onCreateOrderSuccess,
      }}
    />
  );
};

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);
  const { isDarkTheme } = useTheme();

  return (
    <DappProvider config={config}>
      <StyledDragonswap isDarkMode={isDarkTheme ? 1 : 0}>
        <StyledDragonLayout name={config.name}>
          <UISelector selected={selected} select={setSelected} limit={true} />
          <StyledDragonPanel isDarkMode={isDarkTheme ? 1 : 0}>
            <TWAPComponent limit={selected === SelectorOption.LIMIT} />
          </StyledDragonPanel>
          <Widget.PoweredByOrbs />
          <Widget.Orders />
          <Widget.LimitPriceWarning />
        </StyledDragonLayout>
      </StyledDragonswap>
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
