import { GlobalStyles, styled, ThemeProvider, Typography, useTheme } from "@mui/material";
import { Components, Styles as TwapStyles, Translations, TwapAdapter, TWAPProps, useTwapContext, store, Orders, TwapContextUIPreferences, hooks } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import { createContext, useCallback, useContext, useMemo } from "react";
import Web3 from "web3";
import {
  configureStyles,
  darkTheme,
  lightTheme,
  StyledChangeTokensOrder,
  StyledInputAndSelect,
  StyledMaxButton,
  StyledOrdersPanel,
  StyledOrderSummaryModal,
  StyledPriceCard,
  StyledReset,
  StyledSubmitContainer,
  StyledTokenBalance,
  StyledTokenPanel,
  StyledTokenPanelBalanceAndMax,
  StyledTokenPanelBottom,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledTopGrid,
  StyledTradeSize,
} from "./styles";
import { isNativeAddress } from "@defi.org/web3-candies";
import { memo, ReactNode } from "react";
import { BsQuestionCircle } from "@react-icons/all-files/bs/BsQuestionCircle";
import { AiOutlineArrowDown } from "@react-icons/all-files/ai/AiOutlineArrowDown";
import { GrPowerReset } from "@react-icons/all-files/gr/GrPowerReset";

const config = Configs.BaseSwap;

const Button = (props: any) => {
  const DappButton = useAdapterContext().Button;

  return (
    <DappButton text={props.text} onClick={props.onClick} disabled={props.disabled} isLoading={props.loading}>
      {props.loading ? "Loading..." : props.children}
    </DappButton>
  );
};

const uiPreferences: TwapContextUIPreferences = {
  infoIcon: BsQuestionCircle,
  switchVariant: "ios",
  Button,
  usdSuffix: " USD",
  usdPrefix: `≈ `,
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
    <StyledOrderSummaryModal theme={theme} title="Review order">
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
        <StyledSubmitContainer>
          <StyledSubmitButton />
        </StyledSubmitContainer>
      </TwapStyles.StyledColumnFlex>
    </StyledOrderSummaryModal>
  );
};

const MaxButton = () => {
  const onPercentClick = hooks.useCustomActions();
  const translations = useTwapContext().translations;

  return <StyledMaxButton onClick={() => onPercentClick(1)}>{translations.max.toUpperCase()}</StyledMaxButton>;
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const { useModal, TokenSelectModal } = useAdapterContext();
  const { dstToken, srcToken } = hooks.useDappRawSelectedTokens();
  const selectToken = hooks.useSelectTokenCallback();

  const onSelect = useCallback(
    (token: any) => {
      selectToken({ isSrc: !!isSrcToken, token });
    },
    [selectToken, isSrcToken]
  );
  const [onPresentCurrencyModal] = useModal(<TokenSelectModal otherSelectedCurrency={dstToken} selectedCurrency={srcToken} onCurrencySelect={onSelect} />);

  const theme = useTheme();

  return (
    <>
      <StyledTokenPanel theme={theme}>
        <StyledInputAndSelect>
          <StyledTokenSelect theme={theme}>
            <Components.TokenSelect hideArrow={false} isSrc={isSrcToken} onClick={onPresentCurrencyModal} />
          </StyledTokenSelect>
          <StyledTokenPanelInput dstDecimalScale={3} isSrc={isSrcToken} />
        </StyledInputAndSelect>
        <StyledTokenPanelBottom>
          <StyledTokenPanelBalanceAndMax>
            <StyledTokenBalance isSrc={isSrcToken} />
            {isSrcToken && <MaxButton />}
          </StyledTokenPanelBalanceAndMax>
          <Components.TokenUSD isSrc={isSrcToken} />
        </StyledTokenPanelBottom>
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
const AdapterContext = createContext({} as BaseSwapTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const getTokenImageUrl = (token: any) => {
  return token?.logoUri || `https://baseswap.fi/images/tokens/${token.address.toLowerCase()}.png`;
};

interface BaseSwapTWAPProps extends TWAPProps {
  connect: () => void;
  provider?: any;
  useModal?: any;
  Button: any;
}

const TWAP = (props: BaseSwapTWAPProps) => {
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
      onDstTokenSelected={props.onDstTokenSelected}
      onSrcTokenSelected={props.onSrcTokenSelected}
      priceUsd={props.priceUsd}
      useTrade={props.useTrade}
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
      <TradeSize />
      <TradeInterval />
      <MaxDuration />
      <StyledSubmitButton isMain={true} />
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
      <StyledSubmitButton isMain={true} />
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

export const SubmitButton = ({ className = "", isMain }: { className?: string; isMain?: boolean }) => {
  const { loading, onClick, disabled, text } = hooks.useSubmitButton(isMain);
  const createOrderLoading = store.useTwapStore((state) => state.loading);

  return (
    <Button
      text={text}
      className={`twap-submit ${className}`}
      loading={createOrderLoading ? false : loading}
      onClick={onClick || (() => {})}
      disabled={createOrderLoading ? false : disabled}
    >
      {text}
    </Button>
  );
};

export const StyledSubmitButton = styled(SubmitButton)({
  marginTop: 10,
});
