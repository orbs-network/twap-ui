import { GlobalStyles, ThemeProvider, useTheme } from "@mui/material";
import { Components, Styles as TwapStyles, Translations, TwapAdapter, TWAPProps, store, Orders, TwapContextUIPreferences, hooks } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import { createContext, useCallback, useContext, useMemo } from "react";
import Web3 from "web3";
import {
  configureStyles,
  darkTheme,
  lightTheme,
  StyledChangeTokensOrder,
  StyledLimitPriceInput,
  StyledMarketPrice,
  StyledOrdersPanel,
  StyledOrderSummaryModal,
  StyledPriceCard,
  StyledSubmitButton,
  StyledTokenBalance,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledTopGrid,
  StyledTradeSize,
} from "./styles";
import { isNativeAddress } from "@defi.org/web3-candies";
import { memo, ReactNode } from "react";
import { BsQuestionCircle } from "@react-icons/all-files/bs/BsQuestionCircle";
import { HiArrowDown } from "@react-icons/all-files/hi/HiArrowDown";
import _ from "lodash";
const config = Configs.Arbidex;

const uiPreferences: TwapContextUIPreferences = {
  infoIcon: BsQuestionCircle,
  switchVariant: "ios",
  usdSuffix: " USD",
  usdPrefix: "≈ ",
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
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <TwapStyles.StyledColumnFlex style={{ flex: 1, width: "auto", gap: 24 }}>
            <StyledTokenPanelInput isSrc={isSrcToken} />
            <Components.TokenUSD isSrc={isSrcToken} hideIfZero={true} />
            <StyledTokenBalance isSrc={isSrcToken} />
          </TwapStyles.StyledColumnFlex>
          <StyledTokenSelect theme={theme}>
            <Components.TokenSelect hideArrow={false} isSrc={isSrcToken} onClick={onPresentCurrencyModal} />
          </StyledTokenSelect>
        </TwapStyles.StyledRowFlex>
      </StyledTokenPanel>
    </>
  );
};

const parseToken = (rawToken: any): TokenData | undefined => {
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
    logoUrl: getTokenImageUrl(rawToken),
  };
};
const AdapterContext = createContext({} as BaseSwapTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const getTokenImageUrl = (token: any) => {
  return `https://arbidex.fi/images/tokens/${token.address.toLowerCase()}.png`;
};

interface BaseSwapTWAPProps extends TWAPProps {
  connect: () => void;
  provider?: any;
  useModal?: any;
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
      parseToken={parseToken}
      srcToken={props.srcToken}
      dstToken={props.dstToken}
      storeOverride={props.limit ? storeOverride : undefined}
      onDstTokenSelected={props.onDstTokenSelected}
      onSrcTokenSelected={props.onSrcTokenSelected}
      priceUsd={props.priceUsd}
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
  const { dappTokens } = useAdapterContext();
  const loop = hooks.useLoopFeeOnTransfer();

  const onClick = async () => {
    const tokens = await fetch("https://lhthena.s3.us-east-2.amazonaws.com/uniswap-list.json").then((res) =>
      res.json().then((res) => res.tokens.filter((it: any) => it.chainId === 42161).map((it: any) => it.address))
    );
    const res = await loop(tokens);

    console.log({ res });
  };

  return (
    <>
      <StyledTopGrid>
        <button onClick={onClick}>Click</button>
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
  return <StyledChangeTokensOrder icon={<HiArrowDown />} />;
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
