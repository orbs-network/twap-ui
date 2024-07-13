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
  addMissingTokens,
  TwapContextUIPreferences,
  LimitPriceTokenSelectProps,
  UseMarketPriceProps,
  LimitPriceTitleProps,
  useTwapContext,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, TokenData, Config } from "@orbs-network/twap";
import { createContext, FC, useContext, useMemo } from "react";
import Web3 from "web3";
import { isNativeAddress } from "@defi.org/web3-candies";
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
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import BN from "bignumber.js";
import { BsArrowDownShort } from "@react-icons/all-files/bs/BsArrowDownShort";
import { IoWalletSharp } from "@react-icons/all-files/io5/IoWalletSharp";
import _ from "lodash";

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
};

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const { TokenSelectModal } = useAdapterContext();

  return (
    <TokenSelectModal selected={props.isSrc ? props.srcTokenSelected : props.dstTokenSelected} onSelect={props.onSelect!}>
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
            <StyledPanelInput placeholder="0" isSrc={isSrcToken} />
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

const parseTokens = (props: SushiProps, config: Config): TokenData[] => {
  const result = props.dappTokens.map((rawToken: any) => {
    const { address, decimals, symbol } = rawToken;
    try {
      if (!symbol) {
        console.error("Invalid token", rawToken);
        return;
      }
      if (!address || isNativeAddress(address) || rawToken.isNative) {
        return {
          ...config.nativeToken,
          logoUrl: props.getTokenLogo(rawToken),
        };
      }
      return {
        address: Web3.utils.toChecksumAddress(address),
        decimals,
        symbol,
        logoUrl: props.getTokenLogo(rawToken),
      };
    } catch (error) {}
  });

  return _.compact(result);
};

interface SushiProps extends TWAPProps {
  TokenSelectModal: FC<{ children: ReactNode; onSelect: (value: any) => void; selected: any }>;
  Modal: FC<{ open: boolean; onClose: () => void; title?: string; children: ReactNode; header?: ReactNode }>;
  getTokenLogo: (token: any) => string;
  useUSD: (address?: string) =>  string | undefined;
}

const AdapterContext = createContext({} as SushiProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const useMarketPrice = (props: UseMarketPriceProps) => {
  const { srcToken, dstToken, amount } = props;
  const useTrade = useAdapterContext().useTrade;

  const trade = useTrade!(srcToken?.address, dstToken?.address, BN(amount || 0).isZero() ? undefined : amount);

  return trade?.outAmount;
};

const TWAPContent = (props: SushiProps) => {
  const chainId = hooks.useChainId(props.provider, props.connectedChainId);
  const config = useMemo(() => {
    return getConfig(configs, chainId);
  }, [chainId]);

  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const parsedTokens = useMemo(() => {
    if (!_.size(props.dappTokens) || !config) {
      return [];
    }

    const tokens = parseTokens(props, config);

    return addMissingTokens(config, tokens);
  }, [props.dappTokens]);

  return (
    <StyledTwap className="twap-adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        dappTokens={props.dappTokens}
        connectedChainId={chainId}
        parsedTokens={parsedTokens}
        srcToken={props.srcToken}
        dstToken={props.dstToken}
        onDstTokenSelected={props.onDstTokenSelected}
        onSrcTokenSelected={props.onSrcTokenSelected}
        isLimitPanel={props.limit}
        uiPreferences={uiPreferences}
        useMarketPrice={useMarketPrice}
        usePriceUSD={props.useUSD}
        onSwitchTokens={props.onSwitchTokens}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <AdapterContextProvider value={props}>
            <StyledContent>
              {props.limit ? <LimitPanel /> : <TWAPPanel />}
              <Orders />
              <Components.LimitPriceMessage />
              <StyledPoweredBy />
            </StyledContent>
            <SubmitOrderModal />
          </AdapterContextProvider>
        </ThemeProvider>
      </TwapAdapter>
    </StyledTwap>
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

const TWAP = (props: SushiProps) => {
  return (
    <AdapterContextProvider value={props}>
      <TWAPContent {...props} />
    </AdapterContextProvider>
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
  const { srcToken, dstToken } = useTwapContext().state;
  const token = props.isSrc ? srcToken : dstToken;
  const { TokenSelectModal } = useAdapterContext();

  return (
    <TokenSelectModal selected={props.isSrc ? props.srcTokenSelected : props.dstTokenSelected} onSelect={props.onSelect!}>
      <Components.Base.TokenDisplay symbol={token?.symbol} logo={token?.logoUrl} />
    </TokenSelectModal>
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

export const useIsSupportedChain = (chainId?: number) => {
  return _.find(configs, (config: Config) => config.chainId === chainId);
};

export { TWAP };
