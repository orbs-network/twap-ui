import { StyledDragonLayout, StyledDragonswapModalContent, StyledLynexswap, StyledLynexPanel } from "./styles";
import { TWAP } from "@orbs-network/twap-ui-lynex";
import { useConnectWallet, useGetTokens, usePriceUSD, useTheme, useTrade } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, Popup, TokensList, UISelector } from "./Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import MuiTooltip from "@mui/material/Tooltip";
import { SelectorOption, TokenListItem } from "./types";
import tokens from "./dragonswap/token.json";
import {
  mapCollection,
  size,
  TooltipProps,
  Configs,
  TokensListModalProps,
  ModalProps,
  Widget,
  Token,
  OnWrapSuccessArgs,
  OnApproveSuccessArgs,
  OnCreateOrderSuccessArgs,
  useAmountBN,
} from "@orbs-network/twap-ui";
import { DappProvider } from "./context";
import { chainId, eqIgnoreCase, erc20s, network, networks } from "@defi.org/web3-candies";

const config = Configs.Lynex;

export const useDappTokens = () => {
  const nativeToken = useMemo(() => {
    const native = network(config.chainId).native;
    return {
      ...native,
      logoURI: native.logoUrl,
    };
  }, [config.chainId]);
  const parseListToken = useCallback(
    (tokenList?: any) => {
      const res = tokenList?.map(({ symbol, address, decimals, name, logoURI }: any) => ({
        decimals,
        symbol,
        name,
        address,
        logoURI,
      }));
      return [nativeToken, ...res];
    },
    [nativeToken, config?.chainId],
  );

  const url = useMemo(() => {
    return `https://prod-api.lynex.fi/tracking/assets`;
  }, []);

  return useGetTokens({
    parse: parseListToken,
    tokens,
    url,
    baseAssets: erc20s.linea,
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

  useEffect(() => {
    setFromToken(undefined);
    setToToken(undefined);
  }, [chainId]);

  useEffect(() => {
    if (!fromToken) {
      setFromToken(dappTokens?.find((it: any) => it.symbol === "USDC"));
    }
    if (!toToken) {
      setToToken(dappTokens?.find((it: any) => it.symbol === "WETH"));
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

  const amount = useAmountBN(fromToken?.decimals, "1");

  const { outAmount, isLoading } = useTrade(fromToken?.address, toToken?.address, amount, dappTokens);
  const srcUsd = useUSD(fromToken?.address);
  const dstUsd = useUSD(toToken?.address);

  return (
    <TWAP
      title={limit ? "Limit" : "TWAP"}
      connect={connect}
      account={account}
      walletProvider={library}
      srcTokenAddress={fromToken?.address}
      dstTokenAddress={toToken?.address}
      dexTokens={dappTokens}
      isDarkTheme={isDarkTheme}
      marketPrice={outAmount}
      marketPriceLoading={isLoading}
      srcUsd1Token={srcUsd ? Number(srcUsd) : 0}
      dstUsd1Token={dstUsd ? Number(dstUsd) : 0}
      chainId={chainId}
      isLimitPanel={limit}
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
      <StyledLynexswap isDarkMode={isDarkTheme ? 1 : 0}>
        <StyledDragonLayout name={config.name}>
          <UISelector selected={selected} select={setSelected} limit={true} />
          <StyledLynexPanel isDarkMode={isDarkTheme ? 1 : 0}>
            <TWAPComponent limit={selected === SelectorOption.LIMIT} />
          </StyledLynexPanel>
          <Widget.PoweredByOrbs />
          <Widget.Orders />
          <Widget.LimitPriceWarning />
        </StyledDragonLayout>
      </StyledLynexswap>
    </DappProvider>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/29525.png",
  configs: [config],
  path: "lynex",
};

export default dapp;
