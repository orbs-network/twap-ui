import { GlobalStyles, ThemeProvider, useTheme } from "@mui/material";
import {
  Components,
  Styles as TwapStyles,
  Translations,
  TwapAdapter,
  TWAPProps,
  TWAPTokenSelectProps,
  useTwapContext,
  store,
  Orders,
  TwapContextUIPreferences,
  hooks,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import { createContext, useContext, useMemo } from "react";
import Web3 from "web3";
import {
  configureStyles,
  darkTheme,
  lightTheme,
  StyledChangeTokensOrder,
  StyledLimitPriceInput,
  StyledMarketPrice,
  StyledMaxButton,
  StyledOrdersPanel,
  StyledOrderSummaryModal,
  StyledPriceCard,
  StyledSubmitButton,
  StyledTokenBalance,
  StyledTokenInputContainer,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledTopGrid,
  StyledTradeSize,
} from "./styles";
import { isNativeAddress } from "@defi.org/web3-candies";
import { memo, ReactNode, useCallback, useState } from "react";
import { BsQuestionCircle } from "react-icons/bs";
import { AiOutlineArrowDown } from "react-icons/ai";
const config = Configs.SpookySwap;

const uiPreferences: TwapContextUIPreferences = {
  infoIcon: BsQuestionCircle,
};

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 7 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const OrderSummary = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  return (
    <StyledOrderSummaryModal theme={theme}>
      <TwapStyles.StyledColumnFlex gap={14}>
        <TwapStyles.StyledColumnFlex gap={14}>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay isSrc={true} />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryLimitPrice />
          </Components.Base.Card>
          <Components.Base.Card>{children}</Components.Base.Card>
          <Components.Base.Card>
            <TwapStyles.StyledColumnFlex gap={10}>
              <Components.DisclaimerText />
            </TwapStyles.StyledColumnFlex>
          </Components.Base.Card>
        </TwapStyles.StyledColumnFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={12}>
            <Components.AcceptDisclaimer />
            <Components.OutputAddress />
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
        <Components.SubmitButton />
      </TwapStyles.StyledColumnFlex>
    </StyledOrderSummaryModal>
  );
};

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const { TokenSelectModal, dappTokens, account, connectedChainId } = useAdapterContext();
  const { srcToken, dstToken } = store.useTwapStore();

  const selectedCurrency = useMemo(() => {
    if (!!dappTokens && srcToken) {
      return dappTokens[srcToken.address];
    }
  }, [srcToken?.address]);

  const otherSelectedCurrency = useMemo(() => {
    if (!!dappTokens && dstToken) {
      return dappTokens[dstToken.address];
    }
  }, [dstToken?.address]);

  return (
    <TokenSelectModal
      otherSelectedCurrency={otherSelectedCurrency}
      selectedCurrency={selectedCurrency}
      onCurrencySelect={props.onSelect}
      isOpen={props.isOpen}
      onDismiss={props.onClose}
      account={account}
      chainId={connectedChainId}
    />
  );
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  return (
    <Components.TokenSelectModal
      Component={memoizedTokenSelect}
      isOpen={open}
      onClose={onClose}
      isSrc={isSrcToken}
      parseToken={(token: any) => parseToken(token, getTokenImageUrl)}
    />
  );
};

const MaxButton = () => {
  const { onPercentClick } = hooks.useCustomActions();
  const translations = useTwapContext().translations;

  return <StyledMaxButton onClick={() => onPercentClick(1)}>{translations.max.toUpperCase()}</StyledMaxButton>;
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const theme = useTheme();
  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />
      <StyledTokenPanel theme={theme}>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <StyledTokenSelect theme={theme}>
            <Components.TokenSelect hideArrow={false} isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
          </StyledTokenSelect>
          <StyledTokenBalance isSrc={isSrcToken} />
        </TwapStyles.StyledRowFlex>
        <StyledTokenInputContainer>
          <StyledTokenPanelInput isSrc={isSrcToken} />
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.TokenUSD isSrc={isSrcToken} />
            <MaxButton />
          </TwapStyles.StyledRowFlex>
        </StyledTokenInputContainer>
      </StyledTokenPanel>
    </>
  );
};

const parseToken = (rawToken: any, getTokenLogoURL: (address: string) => string): TokenData | undefined => {
  if (!rawToken.symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  if (!rawToken.address || isNativeAddress(rawToken.address)) {
    return config.nativeToken;
  }
  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: rawToken.tokenInfo?.logoURI || getTokenLogoURL(rawToken),
  };
};
const AdapterContext = createContext({} as SpookySwapTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const getTokenImageUrl = (token: any) => {
  return token?.logoUri || `https://assets.spooky.fi/tokens/${token?.symbol}.png`;
};

interface SpookySwapTWAPProps extends TWAPProps {
  connect: () => void;
  provider?: any;
  isLimit?: boolean;
}

const TWAP = (props: SpookySwapTWAPProps) => {
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  return (
    <TwapAdapter
      connect={props.connect}
      config={config}
      uiPreferences={uiPreferences}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
      translations={translations as Translations}
      provider={props.provider}
      account={props.account}
      connectedChainId={props.connectedChainId}
      dappTokens={props.dappTokens}
      parseToken={(rawToken) => parseToken(rawToken, getTokenImageUrl)}
      srcToken={props.srcToken}
      dstToken={props.dstToken}
      storeOverride={props.limit ? storeOverride : undefined}
    >
      <AdapterContextProvider value={props}>
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme)} />
          <div className="twap-container">{props.limit ? <LimitPanel /> : <TWAPPanel />}</div>
          <StyledOrdersPanel theme={theme} />
        </ThemeProvider>
      </AdapterContextProvider>
    </TwapAdapter>
  );
};

const TWAPPanel = () => {
  return (
    <>
      <StyledTopGrid>
        <TokenPanel isSrcToken={true} />
        <ChangeTokensOrder />
        <TokenPanel />
      </StyledTopGrid>
      <StyledMarketPrice />
      <LimitPrice />
      <TradeSize />
      <TradeInterval />
      <MaxDuration />
      <StyledSubmitButton />
      <OrderSummary>
        <Components.OrderSummaryDetails />
      </OrderSummary>
      <Components.PoweredBy />
    </>
  );
};

const ChangeTokensOrder = () => {
  return <StyledChangeTokensOrder icon={<AiOutlineArrowDown />} />;
};

const LimitPanel = () => {
  return (
    <>
      <StyledTopGrid>
        <TokenPanel isSrcToken={true} />
        <ChangeTokensOrder />
        <TokenPanel />
      </StyledTopGrid>
      <StyledMarketPrice />
      <LimitPrice limit={true} />
      <StyledSubmitButton />
      <OrderSummary>
        <TwapStyles.StyledColumnFlex>
          <Components.OrderSummaryDetailsDeadline />
          <Components.OrderSummaryDetailsOrderType />
          <Components.OrderSummaryDetailsChunkSize />
          <Components.OrderSummaryDetailsMinDstAmount />
        </TwapStyles.StyledColumnFlex>
      </OrderSummary>
      <Components.PoweredBy />
    </>
  );
};

const TradeSize = () => {
  return (
    <StyledTradeSize>
      <TwapStyles.StyledColumnFlex gap={5}>
        <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
          <Components.Labels.TotalTradesLabel />
          <Components.ChunksSliderSelect />
          <Components.ChunksInput />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex className="twap-chunks-size" justifyContent="space-between">
          <Components.TradeSize hideSymbol={true} />
          <Components.ChunksUSD />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </StyledTradeSize>
  );
};

const LimitPrice = ({ limit }: { limit?: boolean }) => {
  const theme = useTheme();
  return (
    <StyledPriceCard>
      <TwapStyles.StyledColumnFlex>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Labels.LimitPriceLabel />
          {!limit && <Components.LimitPriceToggle variant="ios" />}
        </TwapStyles.StyledRowFlex>
        <StyledLimitPriceInput reverse={true} placeholder="0" theme={theme} hideSymbol={true} />
      </TwapStyles.StyledColumnFlex>
    </StyledPriceCard>
  );
};
const MaxDuration = () => {
  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
        <Components.PartialFillWarning />
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TradeInterval = () => {
  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <Components.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const memoizedTWAP = memo(TWAP);
const memoizedOrders = memo(Orders);
export { memoizedOrders as Orders, memoizedTWAP as TWAP };
