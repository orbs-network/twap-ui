import { GlobalStyles, ThemeProvider } from "@mui/material";
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
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, Config } from "@orbs-network/twap";
import { createContext, FC, useContext, useEffect, useMemo } from "react";
import Web3 from "web3";
import { memo, ReactNode, useCallback, useState } from "react";
import {
  StyledBalance,
  StyledPanelInput,
  StyledTokenChange,
  StyledTokenPanel,
  StyledTokenSelect,
  StyledUSD,
  configureStyles,
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
  StyledChunksSelectSlider,
  StyledChunksSelectInput,
  StyledContent,
  StyledSmallText,
  StyledBalanceWarning,
  StyledSwapModalContent,
  StyledTop,
  StyledCreateOrderModal,
  StyledTwap,
  StyledTradeDuration,
  StyledTradeDurationRight,
  StyledOrders,
  StyledOrdersContent,
  StyledLimitPriceTitle,
} from "./styles";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import BN from "bignumber.js";
import { BsArrowDownShort } from "@react-icons/all-files/bs/BsArrowDownShort";
import { IoWalletSharp } from "@react-icons/all-files/io5/IoWalletSharp";
import { MdInfo } from "@react-icons/all-files/md/MdInfo";
import _ from "lodash";
import { eqIgnoreCase } from "@defi.org/web3-candies";
import { Token } from "@orbs-network/twap-ui";

const configs = [Configs.SushiArb, Configs.SushiBase];

const USD = ({ usd }: { usd?: string }) => {
  return (
    <StyledUSD className="twap-custom-usd">
      <SmallText prefix="$ " value={BN(usd || 0).isZero() ? "0.00" : usd} />
    </StyledUSD>
  );
};

const uiPreferences: TwapContextUIPreferences = {
  disableThousandSeparator: true,
  switchVariant: "ios",
  Components: {
    USD,
  },
  addressPadding: {
    start: 5,
    end: 3,
  },
  infoIcon: <MdInfo size={15} />,
};

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const { TokenSelectModal, srcToken, dstToken } = useAdapterContext();

  return (
    <TokenSelectModal selected={props.isSrc ? srcToken : dstToken} onSelect={props.onSelect!}>
      <StyledTokenSelect hideArrow={false} isSrc={props.isSrc} onClick={() => {}} />
    </TokenSelectModal>
  );
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  return <Components.TokenSelectModal Component={memoizedTokenSelect} isOpen={open} onClose={onClose} isSrc={isSrcToken} />;
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
  const onClick = hooks.useSetSrcAmountPercent();
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
  const _usd = hooks.useTokenUsd(isSrc);
  const usd = hooks.useFormatDecimals(_usd, 2);

  if (exceedsBalance) {
    return <StyledBalanceWarning>Exceeds Balance</StyledBalanceWarning>;
  }

  return <USD usd={usd} />;
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  const insufficientFunds = hooks.useBalanceWarning();

  const exceedsBalance = !isSrcToken ? undefined : insufficientFunds;

  return (
    <>
      <StyledTokenPanel error={exceedsBalance ? 1 : 0}>
        <TwapStyles.StyledColumnFlex gap={10}>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <StyledPanelInput placeholder="0.0" isSrc={isSrcToken} />
            <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />
          </TwapStyles.StyledRowFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <TokenPanelUsd exceedsBalance={!!exceedsBalance} isSrc={isSrcToken} />
            <Balance isSrc={isSrcToken} />
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </StyledTokenPanel>
    </>
  );
};

const parseToken = (config: Config, getTokenLogo: (token?: any) => string, rawToken?: any): Token | undefined => {
  try {
    if (!rawToken || !rawToken.symbol) {
      return;
    }

    if (rawToken.isNative) {
      return {
        ...config.nativeToken,
        logoUrl: getTokenLogo(rawToken) || config.nativeToken.logoUrl,
      };
    }
    return {
      address: Web3.utils.toChecksumAddress(rawToken.address),
      decimals: rawToken.decimals,
      symbol: rawToken.symbol,
      logoUrl: getTokenLogo(rawToken),
    };
  } catch (error) {
    console.error("Invalid token", rawToken);
  }
};

interface SushiProps extends TWAPProps {
  TokenSelectModal: FC<{ children: ReactNode; onSelect: (value: any) => void; selected: any }>;
  Modal: FC<{ open: boolean; onClose: () => void; title?: string; children: ReactNode; header?: ReactNode }>;
  getTokenLogo: (token: any) => string;
  useUSD: (address?: any) => string | undefined;
  srcToken?: any;
  dstToken?: any;
  configChainId?: number;
  connector?: any;
}

interface AdapterContextProps extends SushiProps {
  config: Config;
}

const AdapterContext = createContext({} as AdapterContextProps);
const AdapterContextProvider = AdapterContext.Provider;
const useAdapterContext = () => useContext(AdapterContext);

const useAddresses = () => {
  const context = useAdapterContext();
  const wrappedAddress = useMemo(() => {
    return _.find(context.dappTokens, (it) => eqIgnoreCase(it.address || "", context.config.wToken.address || ""))?.address;
  }, [context.srcToken, context.dappTokens, context.config.wToken.address]);

  return useMemo(() => {
    return {
      srcAddress: context.srcToken?.isNative ? wrappedAddress : context.srcToken?.address,
      dstAddress: context.dstToken?.isNative ? wrappedAddress : context.dstToken?.address,
    };
  }, [context.srcToken, wrappedAddress, context.dstToken]);
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
  const { srcAddress, dstAddress } = useAddresses();

  return {
    srcUsd: context.useUSD(srcAddress),
    dstUsd: context.useUSD(dstAddress),
  };
};

const useSelectedParsedTokens = () => {
  const context = useAdapterContext();
  return useMemo(() => {
    return {
      srcToken: parseToken(context.config, context.getTokenLogo, context.srcToken),
      dstToken: parseToken(context.config, context.getTokenLogo, context.dstToken),
    };
  }, [context.config, context.srcToken, context.dstToken, context.getTokenLogo]);
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
  }, [setProvider, context.connector, context.connectedChainId, context.account]);

  useEffect(() => {
    setProviderFromConnector();
  }, [setProviderFromConnector]);

  return provider;
};

const TWAPContent = () => {
  const context = useAdapterContext();
  const provider = useProvider();

  const theme = useMemo(() => {
    return context.isDarkTheme ? darkTheme : lightTheme;
  }, [context.isDarkTheme]);

  const parsedTokens = useMemo(() => {
    if (!_.size(context.dappTokens) || !context.config) {
      return [];
    }
    let parsed = context.dappTokens.map((rawToken: any) => {
      return parseToken(context.config, context.getTokenLogo, rawToken);
    });
    return _.compact(parsed) as Token[];
  }, [context.dappTokens, context.config, context.getTokenLogo]);

  const { srcToken, dstToken } = useSelectedParsedTokens();
  const { srcUsd, dstUsd } = useUsd();
  const marketPrice = useMarketPrice();

  const isWrongChain = useMemo(() => {
    if (!context.configChainId) {
      return false;
    }
    return !supportedChains.includes(context.configChainId);
  }, [context.configChainId]);

  return (
    <StyledTwap className="twap-adapter-wrapper">
      <TwapAdapter
        connect={context.connect}
        config={context.config}
        maxFeePerGas={context.maxFeePerGas}
        priorityFeePerGas={context.priorityFeePerGas}
        translations={translations as Translations}
        provider={provider}
        account={!context.configChainId ? undefined : context.account}
        dappTokens={context.dappTokens}
        parsedTokens={parsedTokens}
        srcToken={srcToken}
        dstToken={dstToken}
        onDstTokenSelected={context.onDstTokenSelected}
        onSrcTokenSelected={context.onSrcTokenSelected}
        isLimitPanel={context.limit}
        uiPreferences={uiPreferences}
        onSwitchTokens={context.onSwitchTokens}
        srcUsd={srcUsd}
        dstUsd={dstUsd}
        marketPrice={marketPrice}
        connectedChainId={context.connectedChainId}
        isWrongChain={isWrongChain}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <StyledContent>
            {context.limit ? <LimitPanel /> : <TWAPPanel />}
            <Orders />
            <Components.LimitPriceMessage />
            <StyledPoweredBy />
          </StyledContent>
          <SubmitOrderModal />
        </ThemeProvider>
      </TwapAdapter>
    </StyledTwap>
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

const Orders = () => {
  const [isOpen, setIsOpen] = useState(false);
  const Modal = useAdapterContext().Modal;

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <StyledOrders isOpen={isOpen}>
      <Components.OrderHistory.Button onClick={() => setIsOpen(true)} />
      <Modal open={isOpen} onClose={onClose} header={<Components.OrderHistory.Header />}>
        <StyledOrdersContent />
      </Modal>
    </StyledOrders>
  );
};

const SubmitOrderModal = () => {
  const { isOpen, onClose } = hooks.useSwapModal();

  return (
    <Components.Base.Modal open={isOpen} onClose={() => onClose()}>
      <StyledSwapModalContent>
        <StyledCreateOrderModal />
      </StyledSwapModalContent>
    </Components.Base.Modal>
  );
};

const LimitInput = (props: LimitPriceInputProps) => {
  return <StyledLimitInput placeholder="0" onChange={props.onChange} value={props.value} loading={props.isLoading} />;
};

const LimitPercentButton = (props: LimitPricePercentProps) => {
  return (
    <StyledSelectButton onClick={props.onClick} selected={props.selected ? 1 : 0}>
      {props.text}
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
  return <TokenSelect onClose={() => {}} open={true} isSrcToken={props.isSrcToken} />;
};

const LimitPriceTitleTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const adapterContext = useAdapterContext();
  const twapContext = useTwapContext();
  const token = props.isSrc ? twapContext.srcToken : twapContext.dstToken;

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
  const hide = hooks.useShouldWrapOrUnwrapOnly();

  if (hide) return null;

  return (
    <>
      <Card>
        <Card.Header>
          <Components.Labels.LimitPriceLabel />
          <StyledLimitSwitch />
        </Card.Header>
        <Card.Body>
          <StyledLimitPanel
            onSrcSelect={() => {}}
            Components={{ Input: LimitInput, PercentButton: LimitPercentButton, ZeroButton: LimitPriceZeroButton, TokenSelect: LimitPriceTokenSelect, Title: LimitPriceTitle }}
            onDstSelect={() => {}}
            styles={{
              percentButtonsGap: "5px",
            }}
          />
        </Card.Body>
      </Card>
    </>
  );
};

const TWAPPanel = () => {
  return (
    <StyledContent>
      <StyledTop>
        <TokenPanel isSrcToken={true} />
        <TokenChange />
        <TokenPanel />
      </StyledTop>
      <LimitPrice />
      <TotalTrades />
      <TradeIntervalSelect />
      <TradeDurationSelect />
      <Components.ShowConfirmation />
    </StyledContent>
  );
};

const LimitPanel = () => {
  return (
    <StyledContent>
      <StyledTop>
        <TokenPanel isSrcToken={true} />
        <TokenChange />
        <TokenPanel />
      </StyledTop>
      <LimitPrice />
      <Components.ShowConfirmation />
    </StyledContent>
  );
};

const TotalTrades = () => {
  return (
    <StyledChunksSelect>
      <Card>
        <Card.Header>
          <Components.Labels.TotalTradesLabel />
        </Card.Header>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledChunksSelectInput>
            <Components.ChunkSelector.Input />
          </StyledChunksSelectInput>
          <StyledChunksSelectSlider>
            <Components.ChunkSelector.Slider />
          </StyledChunksSelectSlider>
        </Styles.StyledRowFlex>
      </Card>
    </StyledChunksSelect>
  );
};

const TradeIntervalSelect = () => {
  return (
    <StyledTradeInterval>
      <Card>
        <Card.Header>
          <Components.TradeInterval.Label />
        </Card.Header>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledTradeIntervalInput>
            <Components.TradeInterval.Input />
          </StyledTradeIntervalInput>
          <StyledTradeIntervalResolution>
            <Components.TradeInterval.Resolution />
          </StyledTradeIntervalResolution>
        </Styles.StyledRowFlex>
      </Card>
    </StyledTradeInterval>
  );
};

const TradeDurationSelect = () => {
  return (
    <StyledTradeDuration>
      <Card>
        <Card.Header>
          <Components.TradeDuration.Label />
        </Card.Header>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledTradeDurationRight>
            <Components.TradeDuration.Input />
            <Components.TradeDuration.Reset />
          </StyledTradeDurationRight>
          <StyledTradeIntervalResolution>
            <Components.TradeDuration.Resolution />
          </StyledTradeIntervalResolution>
        </Styles.StyledRowFlex>
      </Card>
    </StyledTradeDuration>
  );
};

const isSupportedChain = (chainId?: number) => {
  return Boolean(_.find(configs, (config: Config) => config.chainId === chainId));
};

export { TWAP, isSupportedChain };
