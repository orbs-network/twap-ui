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
import { eqIgnoreCase, networks } from "@defi.org/web3-candies";
import { Config } from "@orbs-network/twap-sdk";

const configs = [Configs.Lynex, Configs.Ocelex];

const useConfig = () => {
  const { chainId } = useWeb3React();
  return useMemo(() => configs.find((it) => it.chainId === chainId) || configs[0], [chainId]);
};

export const useDappTokens = () => {
  const config = useConfig();

  const parseListToken = useCallback(
    (tokenList?: any) => {
      const res = tokenList?.map(({ symbol, address, decimals, name, logoURI }: any) => ({
        decimals,
        symbol,
        name,
        address,
        logoURI,
      }));
      return res;
    },
    [config?.chainId],
  );

  const url = useMemo(() => {
    switch (config.chainId) {
      case Configs.Ocelex.chainId:
        return `https://api.ocelex.fi/tracking/assets`;
      case Configs.Lynex.chainId:
        return `https://prod-api.lynex.fi/tracking/assets`;
      default:
        break;
    }
  }, [config.chainId]);

  return useGetTokens({
    parse: parseListToken,
    tokens,
    url,
    modifyList: (list: any) => {
      return [networks.eth.native, ...list];
    },
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
  console.log("onCreateOrderSuccess", args);
};

const parseDexToken = (token?: any): Token | undefined => {
  if (!token) return;
  return {
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    logoUrl: token.logoURI,
  };
};

const useToken = (addressOrSymbol?: string) => {
  const { data: tokens } = useDappTokens();

  return useMemo(() => {
    return tokens?.find((it: any) => eqIgnoreCase(it.address, addressOrSymbol || "") || eqIgnoreCase(it.symbol, addressOrSymbol || ""));
  }, [tokens, addressOrSymbol]);
};

const initialSrc = "ETH";
const initialDst = "USDC";

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
      setFromToken(dappTokens?.find((it: any) => it.symbol === initialSrc));
    }
    if (!toToken) {
      setToToken(dappTokens?.find((it: any) => it.symbol === initialDst));
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

  const srcToken = useMemo(() => parseDexToken(fromToken), [fromToken]);
  const dstToken = useMemo(() => parseDexToken(toToken), [toToken]);

  return (
    <TWAP
      title={limit ? "Limit" : "TWAP"}
      connect={connect}
      srcToken={srcToken}
      dstToken={dstToken}
      account={account}
      walletProvider={library?.currentProvider}
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
      useToken={useToken}
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
  const config = useConfig();
  return (
    <DappProvider config={config as Config}>
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
  configs: configs as Config[],
  path: "lynex",
};

export default dapp;
