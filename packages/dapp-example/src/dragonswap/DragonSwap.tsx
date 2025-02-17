import { StyledDragonswap, StyledDragonLayout, StyledDragonPanel, StyledDragonswapModalContent } from "../styles";
import { TWAP } from "@orbs-network/twap-ui-dragonswap";
import tokens from "./token.json";
import { useBalanceQuery, useConnectWallet, usePriceUSD, useRefetchBalances, useTheme, useTrade } from "../hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, Popup, SelectorOption, TokensList, UISelector } from "../Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import MuiTooltip from "@mui/material/Tooltip";
import { TooltipProps, Configs, TokensListModalProps, ModalProps, Widget, useAmountBN, Token } from "@orbs-network/twap-ui";
import { DappProvider } from "../context";
import { eqIgnoreCase, network, networks } from "@defi.org/web3-candies";
import _ from "lodash";
const config = Configs.DragonSwap;

export const useDappTokens = () => {
  const nativeToken = network(config.chainId).native;
  return useMemo(() => {
    return tokens.tokens
      .filter((it: any) => it.chainId === config?.chainId)
      .map((t: any) => ({
        ...t,
        logoURI: `https://dzyb4dm7r8k8w.cloudfront.net/prod/logos/${t.address}/logo.png`,
      }));
  }, [nativeToken, config?.chainId]);
};

const parseList = (rawList?: any): Token[] => {
  return _.map(rawList, (rawToken: any) => {
    return { address: rawToken.address, decimals: rawToken.decimals, symbol: rawToken.symbol, logoUrl: rawToken.logoURI };
  });
};

const TokensListModal = ({ isOpen, onSelect, onClose }: TokensListModalProps) => {
  const baseAssets = useDappTokens();
  const { isDarkTheme } = useTheme();
  const tokensListSize = _.size(baseAssets);
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

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library, chainId } = useWeb3React();
  const connect = useConnectWallet();
  const dappTokens = useDappTokens();
  const { isDarkTheme } = useTheme();
  const [fromToken, setFromToken] = useState<any>(undefined);
  const [toToken, setToToken] = useState<any>(undefined);

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

  const amount = useAmountBN(fromToken?.decimals, "1");

  const { outAmount, isLoading } = useTrade(fromToken?.address, toToken?.address, amount, dappTokens);

  const onSwitchFromNativeToWtoken = useCallback(() => {
    const wToken = Object.values(networks).find((it) => it.id === chainId)?.wToken.address;
    const token = dappTokens.find((it: any) => eqIgnoreCase(it.address, wToken || ""));
    if (token) {
      setFromToken(token);
    }
  }, [dappTokens, chainId]);

  const srcUsd = useUSD(fromToken?.address);
  const dstUsd = useUSD(toToken?.address);
  const srcBalance = useBalanceQuery(fromToken?.address).data;
  const dstBalance = useBalanceQuery(toToken?.address).data;
  const refetchBalances = useRefetchBalances(fromToken?.address, toToken?.address);

  return (
    <TWAP
      title={limit ? "Limit" : "TWAP"}
      account={account as string}
      web3Provider={library?.currentProvider}
      srcTokenAddress={fromToken?.address}
      dstTokenAddress={toToken?.address}
      dexTokens={dappTokens}
      isDarkTheme={isDarkTheme}
      marketPrice={outAmount}
      marketPriceLoading={isLoading}
      chainId={chainId}
      isLimitPanel={limit}
      srcUsd1Token={srcUsd ? Number(srcUsd) : 0}
      dstUsd1Token={dstUsd ? Number(dstUsd) : 0}
      components={{ Tooltip, TokensListModal, Modal }}
      isExactAppoval={true}
      minChunkSizeUsd={4}
      srcBalance={srcBalance}
      dstBalance={dstBalance}
      actions={{
        onSwitchFromNativeToWrapped: onSwitchFromNativeToWtoken,
        onSwitchTokens,
        onSrcTokenSelect: setFromToken,
        onDstTokenSelect: setToToken,
        refetchBalances,
        onConnect: connect,
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
