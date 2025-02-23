import { StyledDragonLayout, StyledGenericModalContent, StyledLynexswap } from "./styles";
import { useBalanceQuery, useConnectWallet, useGetTokens, usePriceUSD, useRefetchBalances, useTheme, useTrade } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, Popup, SelectorOption, TokensList, UISelector } from "./Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import MuiTooltip from "@mui/material/Tooltip";
import { TooltipProps, Configs, TokensListModalProps, ModalProps, Widget, Token, useAmountBN, WidgetProvider, UIPreferences } from "@orbs-network/twap-ui";
import { DappProvider } from "./context";
import { Config, eqIgnoreCase, networks } from "@orbs-network/twap-sdk";

const config = Configs.Lynex;

const TokensListModal = ({ isOpen, onSelect, onClose }: TokensListModalProps) => {
  const { data: baseAssets } = useGetTokens();
  const { isDarkTheme } = useTheme();

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledGenericModalContent isDarkTheme={isDarkTheme ? 1 : 0}>
        <TokensList tokens={baseAssets} onClick={onSelect} />
      </StyledGenericModalContent>
    </Popup>
  );
};

const Modal = (props: ModalProps) => {
  const { isDarkTheme } = useTheme();

  return (
    <Popup isOpen={props.isOpen} onClose={props.onClose}>
      <StyledGenericModalContent isDarkTheme={isDarkTheme ? 1 : 0}>{props.children}</StyledGenericModalContent>
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

const useToken = (addressOrSymbol?: string) => {
  const { data: tokens } = useGetTokens();

  return useMemo(() => {
    return tokens?.find((it: any) => eqIgnoreCase(it.address || "", addressOrSymbol || "") || eqIgnoreCase(it.symbol || "", addressOrSymbol || ""));
  }, [tokens, addressOrSymbol]);
};

const initialSrc = "USDC";
const initialDst = "WETH";

const uiPreferences: UIPreferences = {
  input: { disableThousandSeparator: true, placeholder: "0.0" },
  usd: { prefix: "$" },
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library, chainId } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useGetTokens();

  const [srcToken, setSrcToken] = useState<Token | undefined>(undefined);
  const [dstToken, setDstToken] = useState<Token | undefined>(undefined);

  useEffect(() => {
    setSrcToken(undefined);
    setDstToken(undefined);
  }, [chainId]);

  useEffect(() => {
    if (!srcToken) {
      setSrcToken(dappTokens?.find((it) => it.symbol === initialSrc));
    }
    if (!dstToken) {
      setDstToken(dappTokens?.find((it) => it.symbol === initialDst));
    }
  }, [dappTokens, dstToken, srcToken]);

  const onSwitchTokens = () => {
    setSrcToken(dstToken);
    setDstToken(srcToken);
  };

  const onSwitchFromNativeToWtoken = useCallback(() => {
    const wToken = Object.values(networks).find((it) => it.id === chainId)?.wToken.address;
    const token = dappTokens?.find((it: any) => eqIgnoreCase(it.address, wToken || ""));
    if (token) {
      setSrcToken(token);
    }
  }, [dappTokens, chainId]);

  const amount = useAmountBN(srcToken?.decimals, "1");

  const { outAmount: marketPrice, isLoading: marketPriceLoading } = useTrade(srcToken?.address, dstToken?.address, amount, dappTokens);

  const srcUsd = useUSD(srcToken?.address);
  const dstUsd = useUSD(dstToken?.address);
  const srcBalance = useBalanceQuery(srcToken?.address).data;
  const dstBalance = useBalanceQuery(dstToken?.address).data;
  const refetchBalances = useRefetchBalances(srcToken?.address, dstToken?.address);
  const { isDarkTheme } = useTheme();

  return (
    <WidgetProvider
      config={config}
      web3Provider={library?.currentProvider}
      account={account as string}
      srcToken={srcToken}
      dstToken={dstToken}
      actions={{
        onSwitchFromNativeToWrapped: onSwitchFromNativeToWtoken,
        onSrcTokenSelect: setSrcToken,
        onDstTokenSelect: setDstToken,
        onConnect: connect,
        refetchBalances,
        onSwitchTokens,
      }}
      isLimitPanel={limit}
      uiPreferences={uiPreferences}
      srcUsd1Token={srcUsd}
      dstUsd1Token={dstUsd}
      srcBalance={srcBalance}
      dstBalance={dstBalance}
      marketPrice={marketPrice}
      marketPriceLoading={marketPriceLoading}
      chainId={chainId}
      isExactAppoval={true}
      components={{ Tooltip, TokensListModal, Modal }}
      useToken={useToken}
      includeStyles={true}
      isDarkTheme={isDarkTheme}
      minChunkSizeUsd={4}
    >
      <Widget.SwapPanel />
    </WidgetProvider>
  );
};

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);
  const { isDarkTheme } = useTheme();
  return (
    <DappProvider config={config as Config}>
      <StyledLynexswap isDarkMode={isDarkTheme ? 1 : 0}>
        <StyledDragonLayout name={config.name}>
          <UISelector selected={selected} select={setSelected} limit={true} />
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
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
