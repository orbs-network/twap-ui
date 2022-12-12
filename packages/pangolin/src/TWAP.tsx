import { GlobalStyles } from "@mui/material";
import { Box, styled } from "@mui/system";
import { Components, hooks, Translations, TwapAdapter, TWAPProps, useTwapContext, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { memo, ReactNode, useCallback, useState } from "react";
import translations from "./i18n/en.json";
import * as AdapterStyles from "./styles";
import { Configs, TokenData } from "@orbs-network/twap";
import { AdapterContextProvider, parseToken, useAdapterContext, useGlobalStyles, useParseTokenList, useTokensFromDapp } from "./hooks";
const TWAP = (props: TWAPProps) => {
  const { account } = props;
  const tokenList = useParseTokenList(props.dappTokens);
  useTokensFromDapp(props.srcToken, props.dstToken, account ? tokenList : undefined);
  const globalStyles = useGlobalStyles(true);
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

const MarketPrice = () => {
  const { toggleInverted, leftToken, rightToken, marketPrice, ready, loading } = hooks.useMarketPrice();
  const translations = useTwapContext().translations;

  return (
    <TwapStyles.StyledRowFlex justifyContent="space-between" className="twap-market-price">
      <AdapterStyles.Text className="title">{translations.currentMarketPrice}</AdapterStyles.Text>
      {ready ? (
        <Components.TokenPriceCompare loading={loading} leftToken={leftToken} rightToken={rightToken} price={marketPrice} toggleInverted={toggleInverted} />
      ) : (
        <AdapterStyles.Text>-</AdapterStyles.Text>
      )}
    </TwapStyles.StyledRowFlex>
  );
};

const SrcTokenPercentSelector = () => {
  const { onPercentClick } = hooks.useCustomActions();

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <AdapterStyles.StyledSrcTokenPercentSelector>
      <AdapterStyles.StyledPercentBtn onClick={() => onClick(0.25)}>25%</AdapterStyles.StyledPercentBtn>
      <AdapterStyles.StyledPercentBtn onClick={() => onClick(0.5)}>50%</AdapterStyles.StyledPercentBtn>
      <AdapterStyles.StyledPercentBtn onClick={() => onClick(0.75)}>75%</AdapterStyles.StyledPercentBtn>
      <AdapterStyles.StyledPercentBtn onClick={() => onClick(1)}>100%</AdapterStyles.StyledPercentBtn>
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
    <MarketPrice />
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
  const { chunksAmount, onTotalChunksChange, totalChunks, token, maxPossibleChunks, showChunksSelect } = store.useTwapStore((state) => ({
    chunksAmount: state.getSrcChunkAmountUi(),
    onTotalChunksChange: state.setChunks,
    totalChunks: state.chunks,
    token: state.srcToken,
    maxPossibleChunks: state.getMaxPossibleChunks(),
    showChunksSelect: !!state.srcToken && !!state.srcAmountUi,
  }));
  const translations = useTwapContext().translations;

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
            <AdapterStyles.Text>-</AdapterStyles.Text>
          )}
        </AdapterStyles.StyledSliderContainer>
        <AdapterStyles.StyledTradeSize>
          <Components.Label fontSize={14} tooltipText={translations.tradeSizeTooltip}>
            {translations.tradeSize}: <Components.NumberDisplay value={chunksAmount} />
          </Components.Label>
          {token && <TokenDisplay logo={token.logoUrl} name={token.symbol} />}
        </AdapterStyles.StyledTradeSize>
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
      <Components.Label tooltipText={translations.maxDurationTooltip}>{translations.maxDuration}</Components.Label>
      <Components.TimeSelector value={duration} onChange={onChange} />
    </Components.Card>
  );
};

const TradeInterval = () => {
  const { fillDelay, customFillDelayEnabled, onChange, onCustomFillDelayClick } = store.useTwapStore((state) => ({
    fillDelay: state.getFillDelay(),
    customFillDelayEnabled: state.customFillDelayEnabled,
    onChange: state.setFillDelay,
    onCustomFillDelayClick: state.setCustomFillDelayEnabled,
  }));
  const translations = useTwapContext().translations;

  return (
    <Components.Card>
      <Components.Label tooltipText={translations.tradeIntervalTootlip}>{translations.tradeInterval}</Components.Label>
      <AdapterStyles.StyledIntervalTimeSelect>
        <Components.TimeSelector disabled={!customFillDelayEnabled} onChange={onChange} value={fillDelay} />
      </AdapterStyles.StyledIntervalTimeSelect>
      {!customFillDelayEnabled && (
        <Components.IconButton tooltip={translations.customIntervalTooltip} onClick={onCustomFillDelayClick}>
          <Components.Icon icon={<AiFillEdit />} />
        </Components.IconButton>
      )}
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

  return (
    <TokenSelectModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      onCurrencySelect={props.onCurrencySelect}
      selectedCurrency={props.selectedCurrency}
      otherSelectedCurrency={props.otherSelectedCurrency}
    />
  );
};

const TokenPanel = ({ children, isSrcToken }: TokenPanelProps) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const { onTokenSelect, inputWarning, amountPrefix, disabled, selectTokenWarning, token, onChange, value, decimalScale } = hooks.useTokenPanel(isSrcToken);
  const { translations } = useTwapContext();

  const marketPrice = hooks.useMarketPrice().marketPrice;

  const onOpen = () => {
    if (!selectTokenWarning) setTokenListOpen(true);
  };

  const onTokenSelected = useCallback((token: any) => {
    setTokenListOpen(false);
    onTokenSelect(parseToken(token));
  }, []);

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect isOpen={tokenListOpen} onClose={onClose} onCurrencySelect={onTokenSelected} selectedCurrency={undefined} otherSelectedCurrency={undefined} />

      <AdapterStyles.StyledTokenPanel issrc={isSrcToken}>
        <TwapStyles.StyledColumnFlex gap={2}>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.SmallLabel>{isSrcToken ? translations.from : `${translations.to} (${translations.estimated})`}</Components.SmallLabel>
            {children}
            {!isSrcToken && marketPrice !== "0" && (
              <Components.Tooltip text={marketPrice}>
                <AdapterStyles.Text>
                  Price <Components.NumberDisplay value={marketPrice} /> {token?.symbol}
                </AdapterStyles.Text>
              </Components.Tooltip>
            )}
          </TwapStyles.StyledRowFlex>
          <Components.Card>
            <Components.Tooltip text={inputWarning}>
              <Components.NumericInput
                decimalScale={decimalScale}
                prefix={amountPrefix}
                loading={false}
                disabled={disabled}
                placeholder="0.0"
                onChange={onChange || (() => {})}
                value={value}
              />
            </Components.Tooltip>
            <Components.Tooltip text={selectTokenWarning}>
              <button className="twap-token-select" onClick={onOpen} style={{ background: token?.symbol ? "" : "rgb(255, 200, 0)" }}>
                {token ? (
                  <TokenDisplay logo={token?.logoUrl} name={token?.symbol} />
                ) : (
                  <AdapterStyles.StyledOneLineText style={{ color: "black", fontWeight: 500 }}>{translations.selectToken}</AdapterStyles.StyledOneLineText>
                )}
                <Components.Icon icon={<IoIosArrowDown size={20} style={{ fill: token ? "" : "black" }} />} />
              </button>
            </Components.Tooltip>
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
  const {
    srcToken,
    dstToken,
    getSrcAmountUsdUi,
    getSrcChunkAmountUi,
    getDeadlineUi,
    getFillDelayUi,
    chunks,
    getDstMinAmountOutUi,
    srcAmountUi,
    getDstAmountUsdUi,
    getDstAmountUi,
    isLimitOrder,
    showConfirmation,
    setShowConfirmation,
    disclaimerAccepted,
    setDisclaimerAccepted,
    lib,
  } = store.useTwapStore();
  const translations = useTwapContext().translations;

  return (
    <>
      <Components.Modal open={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <AdapterStyles.StyledOrderSummaryContent>
          <TwapStyles.StyledColumnFlex gap={20}>
            <TwapStyles.StyledColumnFlex gap={20}>
              <TokenOrderPreview isSrc={true} isLimitOrder={isLimitOrder} title={translations.from} amount={srcAmountUi} usdPrice={getSrcAmountUsdUi()} token={srcToken} />
              <TokenOrderPreview isLimitOrder={isLimitOrder} title={translations.to} amount={getDstAmountUi()} usdPrice={getDstAmountUsdUi()} token={dstToken} />
              <OrderConfirmationLimitPrice />

              <Components.Card className="twap-summary-breakdown">
                <TwapStyles.StyledColumnFlex gap={20}>
                  <SummaryRow tooltip={translations.confirmationDeadlineTooltip} label={translations.expiration}>
                    <AdapterStyles.Text>{getDeadlineUi()}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationOrderType} label={translations.orderType}>
                    <AdapterStyles.Text>{isLimitOrder ? translations.limitOrder : translations.marketOrder}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationTradeSizeTooltip} label={translations.tradeSize}>
                    <TwapStyles.StyledRowFlex>
                      <Components.TokenName name={srcToken?.symbol} />
                      <Components.TokenLogo logo={srcToken?.logoUrl} />
                      <AdapterStyles.Text>
                        <Components.Tooltip text={getSrcChunkAmountUi()}>
                          <Components.NumberDisplay value={getSrcChunkAmountUi()} />
                        </Components.Tooltip>
                      </AdapterStyles.Text>
                    </TwapStyles.StyledRowFlex>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationTotalTradesTooltip} label={translations.totalTrades}>
                    <AdapterStyles.Text>{chunks}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationtradeIntervalTooltip} label={translations.tradeInterval}>
                    <AdapterStyles.Text>{getFillDelayUi(translations)}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow
                    tooltip={isLimitOrder ? translations.confirmationMinDstAmountTootipLimit : translations.confirmationMinDstAmountTootipMarket}
                    label={`${translations.minReceivedPerTrade}:`}
                  >
                    <TwapStyles.StyledRowFlex justifyContent="flex-end">
                      <Components.TokenName name={dstToken?.symbol} />
                      <Components.TokenLogo logo={dstToken?.logoUrl} />
                      <AdapterStyles.Text>
                        {isLimitOrder ? (
                          <Components.Tooltip text={getDstMinAmountOutUi()}>
                            <Components.NumberDisplay value={getDstMinAmountOutUi()} />
                          </Components.Tooltip>
                        ) : (
                          translations.none
                        )}
                      </AdapterStyles.Text>
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
                  <Components.Switch value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
                </TwapStyles.StyledRowFlex>
                <AdapterStyles.Text style={{ textAlign: "center", width: "100%" }}>{translations.outputWillBeSentTo}</AdapterStyles.Text>
                <AdapterStyles.Text style={{ textAlign: "center", width: "100%" }}>{lib?.maker}</AdapterStyles.Text>
              </TwapStyles.StyledColumnFlex>
            </Components.Card>
            <SubmitButton />
          </TwapStyles.StyledColumnFlex>
        </AdapterStyles.StyledOrderSummaryContent>
      </Components.Modal>
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
    <Components.Card>
      <TwapStyles.StyledColumnFlex gap={10}>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Label>{title}</Components.Label>
          <Components.USD value={usdPrice} />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <TokenDisplay name={token?.symbol} logo={token?.logoUrl} />
          <StyledTokenOrderPreviewAmount>
            {!isSrc && <> {isLimitOrder ? "≥ " : "~ "}</>} <Components.NumberDisplay value={amount} decimalScale={token?.decimals} />
          </StyledTokenOrderPreviewAmount>
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </Components.Card>
  );
};

const StyledTokenOrderPreviewAmount = styled(Components.SmallLabel)({
  fontSize: 19,
});
