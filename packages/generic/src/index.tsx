import { Config, TimeUnit } from "@orbs-network/twap-sdk";
import {
  Components,
  TWAPTokenSelectProps,
  Translations,
  TwapAdapter,
  Styles as TwapStyles,
  TWAPProps,
  getConfig,
  hooks,
  LimitPriceInputProps,
  LimitPricePercentProps,
  Styles,
  LimitPriceZeroButtonProps,
  TwapContextUIPreferences,
  LimitPriceTokenSelectProps,
  LimitPriceTitleProps,
  useTwapContext,
  compact,
  size,
  getNetwork,
  Widget,
  TokensListModalProps,
  WidgetModalProps
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { createContext, FC, useContext, useEffect, useMemo } from "react";
import Web3 from "web3";
import { memo, ReactNode, useCallback, useState } from "react";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";

import {
  StyledBalance,
  StyledPanelInput,
  StyledTokenChange,
  StyledTokenPanel,
  StyledTokenSelect,
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
  StyledTradeDuration,
  StyledTradeDurationRight,
  StyledOrdersContent,
  StyledLimitPriceTitle,
  GlobalStyles,
  StyledOrdersButton,
  StyledCreateOrderModal,
  StyledOrdersHeader,
  StyledNetworkSelect,
  StyledLimitAndInputs,
  StyledChunksWarning,
  StyledLimitPanelExpiration,
  StyledLimitPanelExpirationButtons,
  StyledLimitPanelExpirationButton,
  StyledTokenPanelLabel,
  StyledFee,
  StyledShowConfirmationButtonContainer,
  StyledChunksSelectText,
} from "./styles";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import BN from "bignumber.js";
import { BsArrowDownShort } from "@react-icons/all-files/bs/BsArrowDownShort";
import { IoWalletSharp } from "@react-icons/all-files/io5/IoWalletSharp";
import { MdInfo } from "@react-icons/all-files/md/MdInfo";
import { eqIgnoreCase, isNativeAddress } from "@defi.org/web3-candies";
import { Token } from "@orbs-network/twap-ui";
import { ThemeProvider } from "styled-components";

const uiPreferences: TwapContextUIPreferences = {
  disableThousandSeparator: true,
  addressPadding: {
    start: 5,
    end: 3,
  },
  infoIcon: <MdInfo size={15} />,
};

const TokenChange = () => {
  return <StyledTokenChange icon={<BsArrowDownShort />} />;
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  return (
    <Widget.TokenPanel isSrcToken={isSrcToken}>
      <Widget.TokenPanel.Balance />
      <Widget.TokenPanel.Usd />
      <Widget.TokenPanel.Select />
      <Widget.TokenPanel.Input />
    </Widget.TokenPanel>
  );
};

const useParseToken = () => {
  const { config, getTokenLogo } = useAdapterContext();
  return useCallback(
    (token?: any) => {
      const nativeToken = getNetwork(config.chainId)?.native;
      try {
        if (!token || !token.symbol) {
          return;
        }

        if (token.isNative && nativeToken) {
          return {
            ...nativeToken,
            logoUrl: getTokenLogo(token) || nativeToken.logoUrl,
          };
        }
        return {
          address: Web3.utils.toChecksumAddress(token.address),
          decimals: token.decimals,
          symbol: token.symbol,
          logoUrl: getTokenLogo(token),
        };
      } catch (error) {
        console.error("Invalid token", token);
      }
    },
    [config.chainId, getTokenLogo]
  );
};

export type SushiModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  header?: ReactNode;
};

interface GenericProps extends TWAPProps {
  TokenSelectModal: FC<{ isOpen: boolean; onClose: () => void; onSelect: (value: any) => void; selected: any }>;
  Modal: FC<SushiModalProps>;
  getTokenLogo: (token: any) => string;
  useUSD: (address?: any) => string | undefined;
  srcToken?: any;
  dstToken?: any;
  connector?: any;
  NetworkSelector?: FC<{ children: ReactNode }>;
  Button?: FC<{ children: ReactNode; disabled?: boolean }>;
  config: Config;
}

const AdapterContext = createContext({} as GenericProps);
const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const useWToken = () => {
  const context = useAdapterContext();

  return useMemo(() => {
    const wTokenAddress = getNetwork(context.config.chainId)?.wToken.address;

    return context.dappTokens?.find((it: any) => eqIgnoreCase(it.address || "", wTokenAddress || ""));
  }, [context.dappTokens, context.config]);
};

const useIsNative = () => {
  const context = useAdapterContext();

  return useCallback(
    (token?: any) => {
      if (token?.isNative || token?.symbol === getNetwork(context.config.chainId)?.native.symbol) {
        return true;
      }
    },
    [context.config.chainId]
  );
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
  const { useTrade } = useAdapterContext();

  const { srcAddress, dstAddress } = useAddresses();
  const { srcToken } = useSelectedParsedTokens();
  const amount = hooks.useAmountBN(srcToken?.decimals, "1");

  const trade = useTrade!(srcAddress, dstAddress, BN(amount || 0).isZero() ? undefined : amount);

  return trade?.outAmount;
};

const useUsd = () => {
  const context = useAdapterContext();
  const wToken = useWToken();
  const tokens = useAddresses();

  const srcAddress = isNativeAddress(tokens.srcAddress || "") ? wToken?.address : tokens.srcAddress;
  const dstAddress = isNativeAddress(tokens.dstAddress || "") ? wToken?.address : tokens.dstAddress;

  return {
    srcUsd: context.useUSD(srcAddress),
    dstUsd: context.useUSD(dstAddress),
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

export const useProvider = () => {
  const context = useAdapterContext();

  const [provider, setProvider] = useState<any>(undefined);

  const setProviderFromConnector = useCallback(async () => {
    setProvider(undefined);
    try {
      const res = await context.connector?.getProvider();
      setProvider(res);
    } catch (error) {}
  }, [setProvider, context.connector, context.connectedChainId, context.account]);

  useEffect(() => {
    setProviderFromConnector();
  }, [setProviderFromConnector]);

  return provider;
};

const useParsedTokens = () => {
  const context = useAdapterContext();
  const parseToken = useParseToken();
  return useMemo(() => {
    if (!size(context.dappTokens)) {
      return [];
    }
    let parsed = context.dappTokens.map((rawToken: any) => {
      return parseToken(rawToken);
    });
    return compact(parsed) as Token[];
  }, [context.dappTokens, parseToken]);
};

const useIsWrongChain = () => {
  const context = useAdapterContext();

  return useMemo(() => {
    return context.connectedChainId !== context.config.chainId;
  }, [context.connectedChainId, context.config.chainId]);
};

const TokensListModal = (props: TokensListModalProps) => {
  const context = useAdapterContext().TokenSelectModal;

  return <context.TokenSelectModal isOpen={props.isOpen} onClose={props.onClose} onSelect={props.onSelect} />;
};

const TWAPContent = () => {
  const context = useAdapterContext();
  const provider = useProvider();

  const theme = useMemo(() => {
    return context.isDarkTheme ? darkTheme : lightTheme;
  }, [context.isDarkTheme]);

  const parsedTokens = useParsedTokens();
  const { srcToken, dstToken } = useSelectedParsedTokens();
  const { srcUsd, dstUsd } = useUsd();
  const marketPrice = useMarketPrice();
  const isWrongChain = useIsWrongChain();

  return (
    <ThemeProvider theme={theme}>
      <StyledTwap className="twap-adapter-wrapper">
        <Widget
          config={context.config}
          maxFeePerGas={context.maxFeePerGas}
          priorityFeePerGas={context.priorityFeePerGas}
          translations={translations as Translations}
          provider={provider}
          account={context.account}
          tokens={parsedTokens}
          srcToken={srcToken}
          dstToken={dstToken}
          onSrcTokenSelected={context.onSrcTokenSelected}
          onDstTokenSelected={context.onDstTokenSelected}
          isLimitPanel={context.limit}
          uiPreferences={uiPreferences}
          onSwitchTokens={context.onSwitchTokens}
          srcUsd={srcUsd}
          dstUsd={dstUsd}
          marketPrice={marketPrice}
          chainId={context.connectedChainId}
          isWrongChain={isWrongChain}
          components={{ Modal, TokensListModal }}
          isExactAppoval={true}
        >
          <GlobalStyles />
          <StyledContent>
            {context.limit ? <LimitPanel /> : <TWAPPanel />}
            <Components.LimitPriceMessage />
            <Widget.Orders />
            <StyledPoweredBy />
          </StyledContent>
        </Widget>
      </StyledTwap>
    </ThemeProvider>
  );
};

const TWAP = (props: GenericProps) => {
  return (
    <AdapterContextProvider value={props}>
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


const Modal = (props: WidgetModalProps) => {
  const context = useAdapterContext()

  return <context.Modal open={props.isOpen} onClose={props.onClose} />;
}

const LimitPriceTokenSelect = (props: LimitPriceTokenSelectProps) => {
  return null
};

const LimitPriceTitleTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const adapterContext = useAdapterContext();
  const twapContext = useTwapContextUI();
  const token = props.isSrc ? twapContext.state.srcToken : twapContext.state.destToken;

  return (
    <adapterContext.TokenSelectModal selected={props.isSrc ? adapterContext.srcToken : adapterContext.dstToken} onSelect={props.onSelect!}>
      <Components.Base.TokenDisplay symbol={token?.symbol} logo={token?.logoUrl} />
    </adapterContext.TokenSelectModal>
  );
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
          <Widget.LimitPanel.Label />
          <StyledLimitSwitch />
        </Card.Header>
        <Card.Body>
          <Widget.LimitPanel.Main
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
  const isWrongChain = useTwapContext().isWrongChain;

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

  return (
    <StyledShowConfirmationButtonContainer>
      <StyledFee>Fee: 0.25%</StyledFee>
      <Widget.ShowConfirmationButton />
    </StyledShowConfirmationButtonContainer>
  );
};
const TWAPPanel = () => {
  return (
    <StyledContent>
      <LimitPrice />
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
    [setCustomDuration]
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
        <Widget.FillDelaySelect.Label />
      </Card.Header>
      <StyledTradeInterval>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledTradeIntervalInput>
            <Widget.FillDelaySelect.Input />
          </StyledTradeIntervalInput>
          <StyledTradeIntervalResolution>
            <Widget.FillDelaySelect.Resolution />
          </StyledTradeIntervalResolution>
        </Styles.StyledRowFlex>
      </StyledTradeInterval>
    </Card>
  );
};


export { TWAP };
