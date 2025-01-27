import {
  Components,
  Translations,
  WidgetProvider,
  Styles as TwapStyles,
  WidgetProps,
  getConfig,
  hooks,
  Styles,
  Configs,
  UIPreferences,
  useWidgetContext,
  Widget,
} from "@orbs-network/twap-ui";
import { Config, TimeUnit } from "@orbs-network/twap-sdk";
import translations from "./i18n/en.json";
import { createContext, FC, useContext, useEffect, useMemo } from "react";
import Web3 from "web3";
import React, { ReactNode, useCallback, useState } from "react";
import {
  StyledBalance,
  StyledPanelInput,
  StyledTokenChange,
  StyledTokenPanel,
  StyledUSD,
  StyledPoweredBy,
  darkTheme,
  lightTheme,
  StyledLimitSwitch,
  Card,
  StyledLimitInput,
  StyledSelectButton,
  StyledLimitPanel,
  StyledTradeIntervalInput,
  StyledTradeIntervalResolution,
  StyledTradeInterval,
  StyledResetLimitButtonContainer,
  StyledResetLimitButtonLeft,
  StyledResetLimitButtonRight,
  StyledChunksSelect,
  StyledChunksSelectInput,
  StyledContent,
  StyledSmallText,
  StyledBalanceWarning,
  StyledTop,
  StyledTwap,
  StyledLimitPriceTitle,
  GlobalStyles,
  StyledNetworkSelect,
  StyledLimitAndInputs,
  StyledChunksWarning,
  StyledLimitPanelExpiration,
  StyledLimitPanelExpirationButtons,
  StyledLimitPanelExpirationButton,
  StyledTokenPanelLabel,
  StyledChunksSelectText,
} from "./styles";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import BN from "bignumber.js";
import { BsArrowDownShort } from "@react-icons/all-files/bs/BsArrowDownShort";
import { IoWalletSharp } from "@react-icons/all-files/io5/IoWalletSharp";
import { network } from "@defi.org/web3-candies";
import { Token } from "@orbs-network/twap-ui";
import { ThemeProvider } from "styled-components";

const ethConfig = { ...Configs.SushiEth, minChunkSizeUsd: 1000 };
const configs = [Configs.SushiArb, Configs.SushiBase, ethConfig];

const USD = ({ usd }: { usd?: string }) => {
  return (
    <StyledUSD className="twap-custom-usd">
      <SmallText prefix="$ " value={BN(usd || 0).isZero() ? "0.00" : usd} />
    </StyledUSD>
  );
};

const uiPreferences: UIPreferences = {
  input: {
    disableThousandSeparator: true,
  },
};

const SmallText = ({ value = "", prefix }: { value?: string; prefix?: string }) => {
  const splitted = value?.split(".");
  const nums = splitted?.[0];
  const decimals = splitted?.[1];
  return (
    <StyledSmallText>
      {prefix}
      {nums}
      {decimals && <small>.{decimals}</small>}
    </StyledSmallText>
  );
};

const Balance = ({ isSrc }: { isSrc?: boolean }) => {
  const onClick = hooks.useOnSrcAmountPercent();
  const _balance = hooks.useTokenBalance(isSrc);
  const isZeroBalance = BN(_balance || 0).eq(0);
  const balance = hooks.useFormatDecimals(_balance, 2);

  return (
    <StyledBalance disabled={!isSrc ? 1 : 0} onClick={!isZeroBalance ? () => onClick(1) : () => {}}>
      <IoWalletSharp />
      <SmallText value={isZeroBalance ? "0.00" : balance} />
    </StyledBalance>
  );
};

const TokenChange = () => {
  return <StyledTokenChange icon={<BsArrowDownShort />} />;
};

const TokenPanelUsd = ({ isSrc, exceedsBalance }: { isSrc?: boolean; exceedsBalance?: boolean }) => {
  const { srcUsd, dstUsd } = hooks.useUsdAmount();
  const usd = hooks.useFormatDecimals(isSrc ? srcUsd : dstUsd, 2);

  if (exceedsBalance) {
    return <StyledBalanceWarning>Exceeds Balance</StyledBalanceWarning>;
  }

  return <USD usd={usd} />;
};

const TokenSelect = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const {
    components: { TokensListModal },
    onSrcTokenSelected,
    onDstTokenSelected,
  } = useWidgetContext();

  const onSelect = useCallback(
    (token: any) => {
      if (isSrcToken) {
        onSrcTokenSelected?.(token);
      } else {
        onDstTokenSelected?.(token);
      }
    },
    [isSrcToken, onSrcTokenSelected, onDstTokenSelected],
  );

  return (
    <TokensListModal onSelect={onSelect}>
      <div>Select</div>
    </TokensListModal>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const insufficientFunds = hooks.useBalanceWarning();
  const { isLimitPanel } = useWidgetContext();
  const exceedsBalance = !isSrcToken ? undefined : insufficientFunds;
  const hideAmounts = !isSrcToken && !isLimitPanel;

  return (
    <>
      <StyledTokenPanel error={exceedsBalance ? 1 : 0}>
        <StyledTokenPanelLabel>{isSrcToken ? (!isLimitPanel ? "Allocate" : "Sell") : "Buy"}</StyledTokenPanelLabel>
        <TwapStyles.StyledColumnFlex gap={12}>
          <TwapStyles.StyledRowFlex style={{ marginTop: 8, justifyContent: "space-between" }}>
            <StyledPanelInput placeholder="0.0" isSrc={isSrcToken} hide={hideAmounts ? 1 : 0} />
            <TokenSelect isSrcToken={isSrcToken} />
          </TwapStyles.StyledRowFlex>
          <TwapStyles.StyledRowFlex style={{ justifyContent: "space-between" }}>
            {!hideAmounts && <TokenPanelUsd exceedsBalance={!!exceedsBalance} isSrc={isSrcToken} />}
            <Balance isSrc={isSrcToken} />
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </StyledTokenPanel>
    </>
  );
};

const useParseToken = () => {
  const { config, getTokenLogo } = useAdapterContext();
  return useCallback(
    (token?: any) => {
      const nativeToken = network(config.chainId).native;
      try {
        if (!token || !token.symbol) {
          return;
        }

        if (token.isNative) {
          return {
            ...nativeToken,
            logoUrl: getTokenLogo(token) || nativeToken.logoUrl,
          } as Token;
        }
        return {
          address: Web3.utils.toChecksumAddress(token.address),
          decimals: token.decimals,
          symbol: token.symbol,
          logoUrl: getTokenLogo(token),
        } as Token;
      } catch (error) {
        console.error("Invalid token", token);
      }
    },
    [config.chainId, getTokenLogo],
  );
};

export type SushiModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  header?: ReactNode;
};

interface SushiProps extends Partial<WidgetProps> {
  getTokenLogo: (token: any) => string;
  useUSD: (address?: any) => string | undefined;
  srcToken?: any;
  dstToken?: any;
  configChainId?: number;
  connector?: any;
  dappTokens?: any;
  NetworkSelector?: FC<{ children: ReactNode }>;
  Button?: FC<{ children: ReactNode; disabled?: boolean }>;
  useMarketPrice: (srcAddress?: string, dstAddress?: string, amount?: string) => { outAmount?: string; isLoading?: boolean };
}

interface AdapterContextProps extends SushiProps {
  config: Config;
}

const AdapterContext = createContext({} as AdapterContextProps);
const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const useIsNative = () => {
  const context = useAdapterContext();

  return useCallback(
    (token?: any) => {
      if (token?.isNative || token?.symbol === network(context.config.chainId).native.symbol) {
        return true;
      }
    },
    [context.config.chainId],
  );
};

const useWToken = () => {
  const context = useAdapterContext();
  const token = context.useToken?.(network(context.config.chainId).wToken.address);
  return token;
};

const useAddresses = () => {
  const context = useAdapterContext();
  const wrappedAddress = useWToken()?.address;
  const isNative = useIsNative();

  return useMemo(() => {
    return {
      srcAddress: isNative(context.srcToken) ? wrappedAddress : context.srcToken?.address,
      dstAddress: isNative(context.dstToken) ? wrappedAddress : context.dstToken?.address,
    };
  }, [context.srcToken, context.dstToken, isNative, wrappedAddress]);
};

const useMarketPrice = () => {
  const context = useAdapterContext();

  const { srcAddress, dstAddress } = useAddresses();
  const { srcToken } = useSelectedParsedTokens();
  const amount = hooks.useAmountBN(srcToken?.decimals, "1");

  const trade = context.useMarketPrice!(srcAddress, dstAddress, BN(amount || 0).isZero() ? undefined : amount);

  return trade?.outAmount;
};

const useUsd = () => {
  const context = useAdapterContext();
  const { srcAddress, dstAddress } = useAddresses();
  const wTokenAddress = network(context.config.chainId).wToken.address;

  return {
    srcUsd: context.useUSD(srcAddress),
    dstUsd: context.useUSD(dstAddress),
    nativeUsd: context.useUSD(wTokenAddress),
  };
};

const useSelectedParsedTokens = () => {
  const context = useAdapterContext();
  const parseToken = useParseToken();
  return useMemo(() => {
    return {
      srcToken: parseToken(context.srcToken),
      dstToken: parseToken(context.dstToken),
    };
  }, [context.srcToken, context.dstToken, parseToken]);
};
const supportedChains = configs.map((config) => config.chainId);

export const useProvider = () => {
  const context = useAdapterContext();

  const [provider, setProvider] = useState<any>(undefined);

  const setProviderFromConnector = useCallback(async () => {
    setProvider(undefined);
    try {
      const res = await context.connector?.getProvider();
      setProvider(res);
    } catch (error) {}
  }, [setProvider, context.connector, context.chainId, context.account]);

  useEffect(() => {
    setProviderFromConnector();
  }, [setProviderFromConnector]);

  return provider;
};

const useParsedToken = (address?: string) => {
  const { useToken } = useAdapterContext();
  const parseToken = useParseToken();

  const token = useToken?.(address);

  return useMemo(() => parseToken(token), [token, parseToken]);
};

const useIsWrongChain = () => {
  const context = useAdapterContext();

  return useMemo(() => {
    if (!context.configChainId) {
      return false;
    }
    return !supportedChains.includes(context.configChainId);
  }, [context.configChainId]);
};

const TWAPContent = () => {
  const context = useAdapterContext();
  const provider = useProvider();

  const theme = useMemo(() => {
    return context.isDarkTheme ? darkTheme : lightTheme;
  }, [context.isDarkTheme]);

  const { srcUsd, dstUsd, nativeUsd } = useUsd();
  const marketPrice = useMarketPrice();

  return (
    <ThemeProvider theme={theme}>
      <StyledTwap className="twap-adapter-wrapper">
        <WidgetProvider
          connect={context.connect!}
          config={context.config}
          maxFeePerGas={context.maxFeePerGas}
          priorityFeePerGas={context.priorityFeePerGas}
          translations={translations as Translations}
          provider={provider}
          account={!context.configChainId ? undefined : context.account}
          useToken={context.useToken}
          srcToken={context.srcToken}
          dstToken={context.dstToken}
          onDstTokenSelected={context.onDstTokenSelected}
          onSrcTokenSelected={context.onSrcTokenSelected}
          isLimitPanel={context.isLimitPanel}
          uiPreferences={uiPreferences}
          onSwitchTokens={context.onSwitchTokens}
          srcUsd={srcUsd ? Number(srcUsd) : 0}
          dstUsd={dstUsd ? Number(dstUsd) : 0}
          nativeUsd={nativeUsd ? Number(nativeUsd) : 0}
          marketPrice={marketPrice}
          chainId={context.chainId}
          components={context.components!}
          isExactAppoval={true}
          fee={"0.25"}
        >
          <GlobalStyles />
          <StyledContent>
            {context.isLimitPanel ? <LimitPanel /> : <TWAPPanel />}
            <Components.LimitPriceMessage />
            <Widget.Orders />
            <StyledPoweredBy />
          </StyledContent>
          <Widget.SubmitOrderModal />
        </WidgetProvider>
      </StyledTwap>
    </ThemeProvider>
  );
};

const TWAP = (props: SushiProps) => {
  const config = useMemo(() => {
    return getConfig(configs, props.configChainId);
  }, [props.configChainId]);

  return (
    <AdapterContextProvider value={{ ...props, config }}>
      <TWAPContent />
    </AdapterContextProvider>
  );
};

const LimitInput = (props: LimitPriceInputProps) => {
  return <StyledLimitInput placeholder="0" onChange={props.onChange} value={props.value} loading={props.isLoading} />;
};

const LimitPercentButton = (props: LimitPricePercentProps) => {
  return (
    <StyledSelectButton onClick={props.onClick} selected={props.selected ? 1 : 0}>
      {props.text === "0%" ? "Market" : props.text}
    </StyledSelectButton>
  );
};

const LimitPriceZeroButton = ({ text, onClick }: LimitPriceZeroButtonProps) => {
  return (
    <StyledResetLimitButtonContainer>
      <StyledResetLimitButtonLeft selected={1} onClick={onClick}>
        {text}
      </StyledResetLimitButtonLeft>
      <StyledResetLimitButtonRight selected={1} onClick={onClick}>
        <IoMdClose />
      </StyledResetLimitButtonRight>
    </StyledResetLimitButtonContainer>
  );
};

const LimitPriceTokenSelect = (props: LimitPriceTokenSelectProps) => {
  return <TokenSelect isSrcToken={props.isSrcToken} />;
};

const LimitPriceTitleTokenSelectModal = (props: any) => {
  return <TokenSelect isSrcToken={props.isSrc} />;
};

const LimitPriceTitleTokenSelect = (props: LimitPriceTitleProps) => {
  return <Components.TokenSelectModal Component={LimitPriceTitleTokenSelectModal} isOpen={false} onClose={() => {}} isSrc={props.isSrcToken} />;
};

const LimitPriceTitle = (props: LimitPriceTitleProps) => {
  return (
    <StyledLimitPriceTitle>
      <span>{props.textLeft}</span>
      <LimitPriceTitleTokenSelect {...props} />
      <span>{props.textRight}</span>
    </StyledLimitPriceTitle>
  );
};

const LimitPrice = () => {
  return (
    <StyledLimitPanel>
      <Card>
        <Card.Header>
          {/* <Components.LimitPanel.Label /> */}
          <StyledLimitSwitch />
        </Card.Header>
        <Card.Body>
          <Components.LimitPanel.Main
            onSrcSelect={() => {}}
            Components={{ Input: LimitInput, PercentButton: LimitPercentButton, ZeroButton: LimitPriceZeroButton, TokenSelect: LimitPriceTokenSelect, Title: LimitPriceTitle }}
            onDstSelect={() => {}}
            styles={{
              percentButtonsGap: "5px",
            }}
          />
        </Card.Body>
      </Card>
    </StyledLimitPanel>
  );
};

const ShowConfirmationButton = () => {
  const context = useAdapterContext();
  const isWrongChain = useWidgetContext().isWrongChain;

  if (isWrongChain && context.NetworkSelector) {
    return (
      <context.NetworkSelector>
        <StyledNetworkSelect>
          <Components.Base.Button className="twap-submit-button" onClick={() => {}}>
            Switch network
          </Components.Base.Button>
        </StyledNetworkSelect>
      </context.NetworkSelector>
    );
  }

  return <Components.ShowConfirmation />;
};

const TWAPPanel = () => {
  return (
    <StyledContent>
      <StyledTop>
        <TokenPanel isSrcToken={true} />
        <TokenChange />
        <TokenPanel />
      </StyledTop>
      <TradeIntervalSelect />
      <TotalTrades />
      <ShowConfirmationButton />
    </StyledContent>
  );
};

const LimitPanel = () => {
  return (
    <StyledContent>
      <StyledLimitAndInputs>
        <LimitPrice />
        <StyledTop>
          <TokenPanel isSrcToken={true} />
          <TokenChange />
          <TokenPanel />
        </StyledTop>
      </StyledLimitAndInputs>
      <LimitPanelExpiration />
      <TradeSizeWarning />
      <ShowConfirmationButton />
    </StyledContent>
  );
};
const LimitPanelExpirationOptions = [
  {
    text: "1 Day",
    value: TimeUnit.Days,
  },
  {
    text: "1 Week",
    value: TimeUnit.Weeks,
  },
  {
    text: "1 Month",
    value: TimeUnit.Months,
  },
  {
    text: "1 Year",
    value: TimeUnit.Years,
  },
];

const LimitPanelExpiration = () => {
  const selectedExpiry = hooks.useDuration().millis;

  const setCustomDuration = hooks.useSetDuration();
  const onChange = useCallback(
    (unit: TimeUnit) => {
      setCustomDuration({ unit, value: 1 });
    },
    [setCustomDuration],
  );

  return (
    <StyledLimitPanelExpiration>
      <Components.Labels.MaxDurationLabel />
      <StyledLimitPanelExpirationButtons>
        {LimitPanelExpirationOptions.map((it) => {
          return (
            <StyledLimitPanelExpirationButton key={it.value} onClick={() => onChange(it.value)} selected={selectedExpiry === it.value ? 1 : 0}>
              {it.text}
            </StyledLimitPanelExpirationButton>
          );
        })}
      </StyledLimitPanelExpirationButtons>
    </StyledLimitPanelExpiration>
  );
};

const TradeSizeWarning = () => {
  const warning = hooks.useTradeSizeWarning();
  if (!warning) return null;
  return <StyledChunksWarning title={warning} variant="warning" />;
};

const TotalTrades = () => {
  return (
    <Card>
      <Card.Header>
        <Components.Labels.TotalTradesLabel />
      </Card.Header>
      <StyledChunksSelect>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledChunksSelectInput>
            <Components.ChunkSelector.Input />
            <StyledChunksSelectText>Orders</StyledChunksSelectText>
          </StyledChunksSelectInput>
        </Styles.StyledRowFlex>
      </StyledChunksSelect>
    </Card>
  );
};

const TradeIntervalSelect = () => {
  return (
    <Card>
      <Card.Header>
        <Components.TradeInterval.Label />
      </Card.Header>
      <StyledTradeInterval>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledTradeIntervalInput>
            <Components.TradeInterval.Input />
          </StyledTradeIntervalInput>
          <StyledTradeIntervalResolution>
            <Components.TradeInterval.Resolution />
          </StyledTradeIntervalResolution>
        </Styles.StyledRowFlex>
      </StyledTradeInterval>
    </Card>
  );
};

const isSupportedChain = (chainId?: number) => {
  return Boolean(configs.find((config: Config) => config.chainId === chainId));
};

export { TWAP, isSupportedChain, supportedChains };
