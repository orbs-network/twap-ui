import { GlobalStyles } from "@mui/material";
import { Box, styled } from "@mui/system";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { memo, ReactNode, useCallback, useState } from "react";
import translations from "./i18n/en.json";
import * as AdapterStyles from "./styles";
import { Configs, TokenData } from "@orbs-network/twap";
import { AiOutlineWarning } from "react-icons/ai";
import { AdapterContextProvider, parseToken, useAdapterContext, useGlobalStyles, useParseTokenList, useTokensFromDapp } from "./hooks";
import { PangolinTWAPProps } from "./types";
import { GrClose } from "react-icons/gr";
const TWAP = (props: PangolinTWAPProps) => {
  const { account } = props;
  const tokenList = useParseTokenList(props.dappTokens);
  useTokensFromDapp(props.srcToken, props.dstToken, account ? tokenList : undefined);
  const globalStyles = useGlobalStyles(props.theme);
  const memoizedConnect = useCallback(() => {
    props.connect?.();
  }, []);

  return (
    <TwapAdapter
      connect={memoizedConnect}
      config={Configs.Pangolin}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
      translations={translations as Translations}
      provider={props.provider}
      account={props.account}
    >
      <GlobalStyles styles={globalStyles as any} />
      <AdapterContextProvider value={{ TokenSelectModal: props.TokenSelectModal }}>
        <div className="twap-container">
          <SrcTokenPanel />
          <ChangeTokensOrder />
          <DstTokenPanel />
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
  );
};

export default memo(TWAP);

const SrcTokenPercentSelector = () => {
  const { onPercentClick } = hooks.useCustomActions();

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <AdapterStyles.StyledSrcTokenPercentSelector>
      <button className="twap-percent-button" onClick={() => onClick(0.25)}>
        25%
      </button>
      <button className="twap-percent-button" onClick={() => onClick(0.5)}>
        50%
      </button>
      <button className="twap-percent-button" onClick={() => onClick(0.75)}>
        75%
      </button>
      <button className="twap-percent-button" onClick={() => onClick(1)}>
        100%
      </button>
    </AdapterStyles.StyledSrcTokenPercentSelector>
  );
};

const SrcTokenPanel = () => (
  <TokenPanel isSrcToken={true}>
    <SrcTokenPercentSelector />
  </TokenPanel>
);

const DstTokenPanel = () => (
  <AdapterStyles.StyledDstToken>
    <TokenPanel isSrcToken={false} />
  </AdapterStyles.StyledDstToken>
);

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
  const { chunksAmount, onTotalChunksChange, totalChunks, token, maxPossibleChunks, showChunksSelect, usdValue } = store.useTwapStore((state) => ({
    chunksAmount: state.getSrcChunkAmountUi(),
    onTotalChunksChange: state.setChunks,
    totalChunks: state.getChunks(),
    token: state.srcToken,
    maxPossibleChunks: state.getMaxPossibleChunks(),
    showChunksSelect: state.getChunksBiggerThanOne(),
    usdValue: state.getSrcChunkAmountUsdUi(),
  }));
  const translations = useTwapContext().translations;
  const usdLoading = hooks.useLoadingState().srcUsdLoading;

  return (
    <Components.Card>
      <AdapterStyles.StyledTrade>
        <AdapterStyles.StyledSliderContainer gap={10}>
          <Components.Label tooltipText={translations.totalTradesTooltip}>{translations.totalTrades}</Components.Label>

          {showChunksSelect ? (
            <>
              <AdapterStyles.StyledSlider>
                <Components.Slider maxTrades={maxPossibleChunks} value={totalChunks} onChange={onTotalChunksChange} />
              </AdapterStyles.StyledSlider>
              <Components.Tooltip text={translations.sliderMinSizeTooltip}>
                <AdapterStyles.StyledTotalTradesInput
                  placeholder="0"
                  value={totalChunks}
                  decimalScale={0}
                  maxValue={maxPossibleChunks.toString()}
                  onChange={(value) => onTotalChunksChange(Number(value))}
                />
              </Components.Tooltip>
            </>
          ) : (
            <AdapterStyles.Text>{totalChunks || "-"}</AdapterStyles.Text>
          )}
        </AdapterStyles.StyledSliderContainer>
        <TwapStyles.StyledRowFlex>
          <AdapterStyles.StyledTradeSize>
            <Components.Label fontSize={14} tooltipText={translations.tradeSizeTooltip}>
              {translations.tradeSize}: <Components.NumberDisplay value={chunksAmount} />
            </Components.Label>
            {token && <TokenDisplay logo={token.logoUrl} name={token.symbol} />}
          </AdapterStyles.StyledTradeSize>
          <Components.USD value={usdValue} isLoading={usdLoading} />
        </TwapStyles.StyledRowFlex>
      </AdapterStyles.StyledTrade>
    </Components.Card>
  );
};

const LimitPriceDisplay = () => {
  const { isLimitOrder, onToggleLimit, onChange, limitPrice, leftToken, rightToken, toggleInverted, warning, isLoading } = hooks.useLimitPrice();
  const translations = useTwapContext().translations;

  return (
    <Components.Card className="twap-limit-price">
      <TwapStyles.StyledColumnFlex>
        <AdapterStyles.StyledFlexStart>
          <Components.Tooltip text={isLoading ? `${translations.loading}...` : warning}>
            <Components.Switch disabled={!!warning || isLoading} value={isLimitOrder} onChange={onToggleLimit} />
          </Components.Tooltip>
          <Components.Label tooltipText={isLimitOrder ? translations.limitPriceTooltip : translations.marketPriceTooltip}>{translations.limitPrice}</Components.Label>
        </AdapterStyles.StyledFlexStart>
        {isLimitOrder && (
          <Components.LimitPrice onChange={onChange} toggleInverted={toggleInverted} price={limitPrice} leftToken={leftToken} rightToken={rightToken} placeholder="0" />
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
  const fillDelay = store.useTwapStore((state) => state.getFillDelay());
  const onChange = store.useTwapStore((state) => state.setFillDelay);
  const setCustomFillDelayEnabled = store.useTwapStore((state) => state.setCustomFillDelayEnabled);
  const setCustomFillDelay = store.useTwapStore((state) => state.setFillDelay);
  const translations = useTwapContext().translations;
  const minimumDelayMinutes = store.useTwapStore((state) => state.getMinimumDelayMinutes());

  const onBlur = () => {
    if (!fillDelay.amount) {
      setCustomFillDelayEnabled(false);
    }
  };

  const onFocus = () => {
    setCustomFillDelay(fillDelay);
    setCustomFillDelayEnabled(true);
  };

  return (
    <Components.Card>
      <TwapStyles.StyledRowFlex>
        <Components.Label tooltipText={translations.tradeIntervalTootlip.replace("{{minutes}}", minimumDelayMinutes.toString())}>{translations.tradeInterval}</Components.Label>
        <FillDelayWarning />
        <AdapterStyles.StyledIntervalTimeSelect>
          <Components.TimeSelector onFocus={onFocus} onBlur={onBlur} onChange={onChange} value={fillDelay} />
        </AdapterStyles.StyledIntervalTimeSelect>
      </TwapStyles.StyledRowFlex>
    </Components.Card>
  );
};

const TokenDisplay = ({ logo, name }: { logo?: string; name?: string }) => {
  return (
    <AdapterStyles.StyledTokenDisplay className="token-display">
      <Components.TokenLogo logo={logo} />
      <Components.TokenName name={name} />
    </AdapterStyles.StyledTokenDisplay>
  );
};

interface TokenPanelProps {
  children?: ReactNode;
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
  const { TokenSelectModal } = useAdapterContext();

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

const TokenPanel = ({ children, isSrcToken }: TokenPanelProps) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const tokenPanel = hooks.useTokenPanel(isSrcToken);
  const { translations } = useTwapContext();

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
  const { marketPrice } = hooks.useMarketPrice();

  return (
    <>
      <TokenSelect isOpen={tokenListOpen} onClose={onClose} onCurrencySelect={onTokenSelected} selectedCurrency={undefined} otherSelectedCurrency={undefined} />

      <AdapterStyles.StyledTokenPanel>
        <TwapStyles.StyledColumnFlex gap={2}>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.SmallLabel className="twap-panel-title">{isSrcToken ? translations.from : `${translations.to} (${translations.estimated})`}</Components.SmallLabel>
            {children}
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
                <Components.Tooltip text={tokenPanel.selectTokenWarning}>
                  <button className={`twap-token-select ${tokenPanel.token?.symbol ? "twap-token-select-selected" : ""}`} onClick={onOpen}>
                    {tokenPanel.token ? (
                      <TokenDisplay logo={tokenPanel.token?.logoUrl} name={tokenPanel.token?.symbol} />
                    ) : (
                      <AdapterStyles.StyledOneLineText style={{ color: "black", fontWeight: 500 }}>{translations.selectToken}</AdapterStyles.StyledOneLineText>
                    )}
                    <Components.Icon icon={<IoIosArrowDown size={20} style={{ fill: tokenPanel.token ? "" : "black" }} />} />
                  </button>
                </Components.Tooltip>
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

  if (!twapStore.showConfirmation) return null;
  return (
    <>
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
    </>
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
  const isWarning = store.useTwapStore((state) => state.getFillDelayWarning());
  const minimumDelayMinutes = store.useTwapStore((state) => state.getMinimumDelayMinutes());

  if (!isWarning) return null;
  return (
    <Components.Tooltip text={translations.fillDelayWarningTooltip.replace("{{minutes}}", minimumDelayMinutes.toString())}>
      <TwapStyles.StyledRowFlex justifyContent="flex-start" gap={5} className="twap-warning">
        <AdapterStyles.Text>{translations.invalid}</AdapterStyles.Text>
        <AiOutlineWarning />
      </TwapStyles.StyledRowFlex>
    </Components.Tooltip>
  );
};
