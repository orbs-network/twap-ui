import { GlobalStyles } from "@mui/material";
import { Box, styled } from "@mui/system";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { memo, ReactNode, useCallback, useState } from "react";
import translations from "./i18n/en.json";
import * as AdapterStyles from "./styles";
import { Configs, isNativeAddress, TokenData } from "@orbs-network/twap";
import { AiOutlineWarning } from "react-icons/ai";
import { AdapterContextProvider, parseToken, useAdapterContext, useGlobalStyles, useParseTokenList, useTokensFromDapp } from "./hooks";
import { PangolinTWAPProps } from "./types";
import { GrClose } from "react-icons/gr";
import Slide from "@mui/material/Slide";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ThemeProvider as Emotion10ThemeProvider } from "@emotion/react";

const defaultTheme = createTheme();

const TWAP = (props: PangolinTWAPProps) => {
  const tokenList = useParseTokenList(props.dappTokens);
  useTokensFromDapp(props.srcToken, props.dstToken, props.account ? tokenList : undefined);
  const globalStyles = useGlobalStyles(props.theme);
  const memoizedConnect = useCallback(() => {
    props.connect?.();
  }, []);

  const partnerDaas = props.partnerDaas && !isNativeAddress(props.partnerDaas) ? props.partnerDaas : undefined;

  return (
    <Emotion10ThemeProvider theme={defaultTheme}>
      <ThemeProvider theme={defaultTheme}>
        <TwapAdapter
          connect={memoizedConnect}
          config={partnerDaas ? Configs.PangolinDaas : Configs.Pangolin}
          maxFeePerGas={props.maxFeePerGas}
          priorityFeePerGas={props.priorityFeePerGas}
          translations={translations as Translations}
          provider={props.provider}
          account={props.account}
          connectedChainId={props.connectedChainId}
          askDataParams={[partnerDaas]}
        >
          <GlobalStyles styles={globalStyles as any} />
          <AdapterContextProvider value={props}>
            <div className="twap-container">
              <TokenPanel isSrcToken={true} />
              <ChangeTokensOrder />
              <TokenPanel isSrcToken={false} />
              <LimitPriceDisplay />
              <TradeSize />
              <MaxDuration />
              <TradeInterval />
              <SubmitButton />
              <OrderSummary />
              <Components.PoweredBy />
            </div>
          </AdapterContextProvider>
        </TwapAdapter>
      </ThemeProvider>
    </Emotion10ThemeProvider>
  );
};

export default memo(TWAP);

const buttons = [
  { text: "25%", value: 0.25 },
  { text: "50%", value: 0.5 },
  { text: "75%", value: 0.75 },
  { text: "100%", value: 1 },
];
const SrcTokenPercentSelector = () => {
  const { onPercentClick } = hooks.useCustomActions();

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <TwapStyles.StyledRowFlex gap={5} style={{ width: "auto" }}>
      {buttons.map((btn) => {
        return (
          <button className="twap-percent-button" key={btn.text} onClick={() => onClick(btn.value)}>
            {btn.text}
          </button>
        );
      })}
    </TwapStyles.StyledRowFlex>
  );
};

const ChangeTokensOrder = () => {
  const switchTokens = hooks.useSwitchTokens();
  return (
    <Box className="twap-change-tokens-order">
      <Components.IconButton onClick={switchTokens}>
        <Components.Icon icon={<HiOutlineSwitchVertical />} />
      </Components.IconButton>
    </Box>
  );
};

const TradeSize = () => {
  const translations = useTwapContext().translations;
  const usdLoading = hooks.useLoadingState().srcUsdLoading;
  const twapStore = store.useTwapStore();

  return (
    <Components.Card>
      <TwapStyles.StyledColumnFlex gap={5}>
        <AdapterStyles.StyledSliderContainer gap={10}>
          <Components.Label tooltipText={translations.totalTradesTooltip}>{translations.totalTrades}</Components.Label>

          {twapStore.getChunksBiggerThanOne() ? (
            <>
              <AdapterStyles.StyledSlider>
                <Components.Slider maxTrades={twapStore.getMaxPossibleChunks()} value={twapStore.getChunks()} onChange={twapStore.setChunks} />
              </AdapterStyles.StyledSlider>
              <Components.Tooltip text={translations.sliderMinSizeTooltip}>
                <AdapterStyles.StyledTotalTradesInput
                  placeholder="0"
                  value={twapStore.getChunks()}
                  decimalScale={0}
                  maxValue={twapStore.getMaxPossibleChunks().toString()}
                  onChange={(value) => twapStore.setChunks(Number(value))}
                />
              </Components.Tooltip>
            </>
          ) : (
            <AdapterStyles.Text>{twapStore.getChunks() || "-"}</AdapterStyles.Text>
          )}
        </AdapterStyles.StyledSliderContainer>
        <TwapStyles.StyledRowFlex>
          <AdapterStyles.StyledTradeSize>
            <Components.Label fontSize={14} tooltipText={translations.tradeSizeTooltip}>
              {translations.tradeSize}: <Components.NumberDisplay value={twapStore.getSrcChunkAmountUi()} />
            </Components.Label>
            {twapStore.srcToken && <TokenDisplay logo={twapStore.srcToken.logoUrl} name={twapStore.srcToken.symbol} />}
          </AdapterStyles.StyledTradeSize>
          <Components.USD value={twapStore.getSrcChunkAmountUsdUi()} isLoading={usdLoading} />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </Components.Card>
  );
};

const LimitPriceDisplay = () => {
  const state = hooks.useLimitPrice();
  const translations = useTwapContext().translations;

  return (
    <Components.Card className="twap-limit-price">
      <TwapStyles.StyledColumnFlex>
        <AdapterStyles.StyledFlexStart>
          <Components.Tooltip text={state.isLoading ? `${translations.loading}...` : state.warning}>
            <Components.Switch disabled={!!state.warning || state.isLoading} value={state.isLimitOrder} onChange={state.onToggleLimit} />
          </Components.Tooltip>
          <Components.Label tooltipText={state.isLimitOrder ? translations.limitPriceTooltip : translations.marketPriceTooltip}>{translations.limitPrice}</Components.Label>
        </AdapterStyles.StyledFlexStart>
        {state.isLimitOrder && (
          <Components.LimitPrice
            onChange={state.onChange}
            toggleInverted={state.toggleInverted}
            price={state.limitPrice}
            leftToken={state.leftToken}
            rightToken={state.rightToken}
            placeholder="0"
          />
        )}
      </TwapStyles.StyledColumnFlex>
    </Components.Card>
  );
};

const MaxDuration = () => {
  const { duration, onChange } = store.useTwapStore((state) => ({
    duration: state.duration,
    onChange: state.setDuration,
  }));
  const translations = useTwapContext().translations;

  return (
    <Components.Card>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Label tooltipText={translations.maxDurationTooltip}>{translations.maxDuration}</Components.Label>
        <PartialFillWarning />
        <Components.TimeSelector value={duration} onChange={onChange} />
      </TwapStyles.StyledRowFlex>
    </Components.Card>
  );
};

const TradeInterval = () => {
  const translations = useTwapContext().translations;
  const twapStore = store.useTwapStore();
  const { onFillDelayBlur, onFillDelayFocus } = hooks.useCustomActions();

  return (
    <Components.Card>
      <TwapStyles.StyledRowFlex>
        <Components.Label tooltipText={store.handleFillDelayText(translations.tradeIntervalTootlip, twapStore.getMinimumDelayMinutes())}>
          {translations.tradeInterval}
        </Components.Label>
        <FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ width: "unset", flex: 1 }}>
          <Components.TimeSelector onFocus={onFillDelayFocus} onBlur={onFillDelayBlur} onChange={twapStore.setFillDelay} value={twapStore.getFillDelay()} />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Card>
  );
};

const TokenDisplay = ({ logo, name }: { logo?: string; name?: string }) => {
  return (
    <TwapStyles.StyledRowFlex gap={10} className="twap-token-display" style={{ width: "unset" }}>
      <Components.TokenLogo logo={logo} />
      <Components.TokenName name={name} />
    </TwapStyles.StyledRowFlex>
  );
};

interface TokenPanelProps {
  isSrcToken: boolean;
}

interface TokenSelectProps {
  isOpen: boolean;
  onClose: () => void;
  onCurrencySelect: (value: any) => void;
  selectedCurrency?: any;
  otherSelectedCurrency?: any;
}

const TokenSelect = (props: TokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;

  if (!props.isOpen) return null;
  return (
    <TokenSelectModal
      isOpen={true}
      onClose={props.onClose}
      onCurrencySelect={props.onCurrencySelect}
      selectedCurrency={props.selectedCurrency}
      otherSelectedCurrency={props.otherSelectedCurrency}
    />
  );
};

const TokenPanel = ({ isSrcToken }: TokenPanelProps) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const tokenPanel = hooks.useTokenPanel(isSrcToken);
  const translations = useTwapContext().translations;
  const marketPrice = hooks.useMarketPrice().marketPrice;

  const onOpen = () => {
    if (!tokenPanel.selectTokenWarning) setTokenListOpen(true);
  };

  const onTokenSelected = useCallback((token: any) => {
    setTokenListOpen(false);
    tokenPanel.onTokenSelect(parseToken(token));
  }, []);

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect isOpen={tokenListOpen} onClose={onClose} onCurrencySelect={onTokenSelected} selectedCurrency={undefined} otherSelectedCurrency={undefined} />

      <AdapterStyles.StyledTokenPanel>
        <TwapStyles.StyledColumnFlex gap={4}>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.SmallLabel className="twap-panel-title">{isSrcToken ? translations.from : `${translations.to} (${translations.estimated})`}</Components.SmallLabel>
            {isSrcToken && <SrcTokenPercentSelector />}
            {!isSrcToken && marketPrice !== "0" && (
              <AdapterStyles.Text>
                Price <Components.NumberDisplay value={marketPrice} /> {tokenPanel.token?.symbol}
              </AdapterStyles.Text>
            )}
          </TwapStyles.StyledRowFlex>
          <Components.Card>
            <TwapStyles.StyledColumnFlex gap={15}>
              <TwapStyles.StyledRowFlex justifyContent="space-between">
                <Components.NumericInput
                  decimalScale={tokenPanel.decimalScale}
                  prefix={tokenPanel.amountPrefix}
                  loading={false}
                  disabled={tokenPanel.disabled}
                  placeholder="0.0"
                  onChange={tokenPanel.onChange || (() => {})}
                  value={tokenPanel.value}
                />
                {tokenPanel.token ? (
                  <button className={"twap-token-select twap-token-select-selected"} onClick={onOpen}>
                    <TokenDisplay logo={tokenPanel.token?.logoUrl} name={tokenPanel.token?.symbol} />
                    <Components.Icon icon={<IoIosArrowDown size={20} />} />
                  </button>
                ) : (
                  <Components.Tooltip text={tokenPanel.selectTokenWarning}>
                    <button className="twap-token-select" onClick={onOpen}>
                      <AdapterStyles.StyledOneLineText>{translations.selectToken}</AdapterStyles.StyledOneLineText>
                      <Components.Icon icon={<IoIosArrowDown size={20} />} />
                    </button>
                  </Components.Tooltip>
                )}
              </TwapStyles.StyledRowFlex>
              <TwapStyles.StyledRowFlex justifyContent="space-between">
                <Components.USD value={tokenPanel.usdValue} isLoading={tokenPanel.usdLoading} />
                <Components.Balance isLoading={tokenPanel.balanceLoading} value={tokenPanel.balance} />
              </TwapStyles.StyledRowFlex>
            </TwapStyles.StyledColumnFlex>
          </Components.Card>
        </TwapStyles.StyledColumnFlex>
      </AdapterStyles.StyledTokenPanel>
    </>
  );
};

const SubmitButton = ({ className = "" }: { className?: string }) => {
  const { loading, text, onClick, disabled } = hooks.useSubmitButton();
  return (
    <Components.Button className={className} loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
      {text}
    </Components.Button>
  );
};

const OrderSummary = () => {
  const twapStore = store.useTwapStore();
  const translations = useTwapContext().translations;

  return (
    <Slide in={twapStore.showConfirmation} direction="left">
      <AdapterStyles.StyledSummary className="twap-summary">
        <AdapterStyles.StyledSummaryCloseButton onClick={() => twapStore.setShowConfirmation(false)} className="twap-summary-close">
          <Components.Icon icon={<GrClose style={{ width: 20, height: 20 }} />} />
        </AdapterStyles.StyledSummaryCloseButton>
        <AdapterStyles.StyledOrderSummaryContent>
          <TwapStyles.StyledColumnFlex gap={14}>
            <TwapStyles.StyledColumnFlex gap={14}>
              <TokenOrderPreview
                isSrc={true}
                isLimitOrder={twapStore.isLimitOrder}
                title={translations.from}
                amount={twapStore.srcAmountUi}
                usdPrice={twapStore.getSrcAmountUsdUi()}
                token={twapStore.srcToken}
              />
              <TokenOrderPreview
                isLimitOrder={twapStore.isLimitOrder}
                title={translations.to}
                amount={twapStore.getDstAmountUi()}
                usdPrice={twapStore.getDstAmountUsdUi()}
                token={twapStore.dstToken}
              />
              <OrderConfirmationLimitPrice />

              <Components.Card className="twap-summary-breakdown">
                <TwapStyles.StyledColumnFlex gap={14}>
                  <SummaryRow tooltip={translations.confirmationDeadlineTooltip} label={translations.expiration}>
                    <AdapterStyles.Text>{twapStore.getDeadlineUi()}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationOrderType} label={translations.orderType}>
                    <AdapterStyles.Text>{twapStore.isLimitOrder ? translations.limitOrder : translations.marketOrder}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationTradeSizeTooltip} label={translations.tradeSize}>
                    <TwapStyles.StyledRowFlex>
                      <Components.TokenName name={twapStore.srcToken?.symbol} />
                      <Components.TokenLogo logo={twapStore.srcToken?.logoUrl} />
                      <AdapterStyles.Text>
                        <Components.NumberDisplay value={twapStore.getSrcChunkAmountUi()} />
                      </AdapterStyles.Text>
                    </TwapStyles.StyledRowFlex>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationTotalTradesTooltip} label={translations.totalTrades}>
                    <AdapterStyles.Text>{twapStore.getChunks()}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationtradeIntervalTooltip} label={translations.tradeInterval}>
                    <AdapterStyles.Text>{twapStore.getFillDelayText(translations)}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow
                    tooltip={twapStore.isLimitOrder ? translations.confirmationMinDstAmountTootipLimit : translations.confirmationMinDstAmountTootipMarket}
                    label={`${translations.minReceivedPerTrade}:`}
                  >
                    <TwapStyles.StyledRowFlex justifyContent="flex-end">
                      <Components.TokenName name={twapStore.dstToken?.symbol} />
                      <Components.TokenLogo logo={twapStore.dstToken?.logoUrl} />
                      <AdapterStyles.Text>{twapStore.isLimitOrder ? <Components.NumberDisplay value={twapStore.getDstMinAmountOutUi()} /> : translations.none}</AdapterStyles.Text>
                    </TwapStyles.StyledRowFlex>
                  </SummaryRow>
                </TwapStyles.StyledColumnFlex>
              </Components.Card>
              <TradeInfoDetailsDisplay />
            </TwapStyles.StyledColumnFlex>
            <Components.Card>
              <TwapStyles.StyledColumnFlex gap={12}>
                <TwapStyles.StyledRowFlex gap={5} justifyContent="flex-start">
                  <Components.SmallLabel>{translations.acceptDisclaimer}</Components.SmallLabel>
                  <Components.Switch value={twapStore.disclaimerAccepted} onChange={() => twapStore.setDisclaimerAccepted(!twapStore.disclaimerAccepted)} />
                </TwapStyles.StyledRowFlex>
                <AdapterStyles.Text style={{ textAlign: "center", width: "100%" }}>{translations.outputWillBeSentTo}</AdapterStyles.Text>
                <AdapterStyles.Text style={{ textAlign: "center", width: "100%" }}>{twapStore.lib?.maker}</AdapterStyles.Text>
              </TwapStyles.StyledColumnFlex>
            </Components.Card>
            <SubmitButton />
          </TwapStyles.StyledColumnFlex>
        </AdapterStyles.StyledOrderSummaryContent>
      </AdapterStyles.StyledSummary>
    </Slide>
  );
};

const SummaryRow = ({ label, tooltip, children }: { label: string; tooltip: string; children: ReactNode }) => {
  return (
    <AdapterStyles.StyledSummaryRow>
      <Components.Label tooltipText={tooltip}>{label}</Components.Label>
      <Box className="twap-summary-row-children">{children}</Box>
    </AdapterStyles.StyledSummaryRow>
  );
};

const TradeInfoDetailsDisplay = () => {
  return (
    <Components.Card>
      <TwapStyles.StyledColumnFlex gap={10}>
        <Components.Disclaimer />
      </TwapStyles.StyledColumnFlex>
    </Components.Card>
  );
};

const OrderConfirmationLimitPrice = () => {
  const { isLimitOrder, toggleInverted, limitPrice, leftToken, rightToken } = hooks.useLimitPrice();
  const translations = useTwapContext().translations;

  return (
    <AdapterStyles.StyledLimitPrice>
      <TwapStyles.StyledRowFlex justifyContent="space-between">
        <Components.Label tooltipText={translations.confirmationLimitPriceTooltip}>{translations.limitPrice}</Components.Label>
        {isLimitOrder ? (
          <Components.TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={limitPrice} toggleInverted={toggleInverted} />
        ) : (
          <AdapterStyles.Text>{translations.none}</AdapterStyles.Text>
        )}
      </TwapStyles.StyledRowFlex>
    </AdapterStyles.StyledLimitPrice>
  );
};

const TokenOrderPreview = ({
  isLimitOrder,
  title,
  usdPrice,
  amount,
  isSrc,
  token,
}: {
  isLimitOrder?: boolean;
  title: string;
  usdPrice?: string;
  amount?: string;
  isSrc?: boolean;
  token?: TokenData;
}) => {
  return (
    <AdapterStyles.StyledTokenSummary>
      <TwapStyles.StyledColumnFlex gap={10}>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Label>{title}</Components.Label>
          <Components.USD value={usdPrice} />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <TokenDisplay name={token?.symbol} logo={token?.logoUrl} />
          <StyledTokenOrderPreviewAmount>
            {!isSrc && <> {isLimitOrder ? "≥ " : "~ "}</>} <Components.NumberDisplay value={amount} decimalScale={token?.decimals} hideTooltip />
          </StyledTokenOrderPreviewAmount>
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </AdapterStyles.StyledTokenSummary>
  );
};

const StyledTokenOrderPreviewAmount = styled(Components.SmallLabel)({
  fontSize: 19,
});

const PartialFillWarning = () => {
  const translations = useTwapContext().translations;
  const isWarning = store.useTwapStore((state) => state.getIsPartialFillWarning());
  if (!isWarning) return null;
  return (
    <Components.Tooltip text={translations.prtialFillWarningTooltip}>
      <TwapStyles.StyledRowFlex justifyContent="flex-start" gap={5} className="twap-warning">
        <AdapterStyles.Text>{translations.prtialFillWarning}</AdapterStyles.Text>
        <AiOutlineWarning />
      </TwapStyles.StyledRowFlex>
    </Components.Tooltip>
  );
};

const FillDelayWarning = () => {
  const translations = useTwapContext().translations;
  const twapStore = store.useTwapStore();
  if (!twapStore.getFillDelayWarning()) return null;
  return (
    <Components.Tooltip text={store.handleFillDelayText(translations.fillDelayWarningTooltip, twapStore.getMinimumDelayMinutes())}>
      <TwapStyles.StyledRowFlex justifyContent="flex-start" gap={5} className="twap-warning">
        <AdapterStyles.Text>{translations.invalid}</AdapterStyles.Text>
        <AiOutlineWarning />
      </TwapStyles.StyledRowFlex>
    </Components.Tooltip>
  );
};
