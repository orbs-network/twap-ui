import { GlobalStyles } from "@mui/material";
import { styled } from "@mui/system";
import { Components, hooks, Translations, TwapAdapter, TWAPProps, useTwapContext, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { memo, ReactNode, useCallback } from "react";
import translations from "./i18n/en.json";
import * as AdapterStyles from "./styles";
import { Configs } from "@orbs-network/twap";
import { AdapterContextProvider, parseToken, useAdapterContext, useParseTokenList, useTokensFromDapp } from "./hooks";
const TWAP = (props: TWAPProps) => {
  const { account } = props;
  const tokenList = useParseTokenList(props.dappTokens);
  useTokensFromDapp(props.srcToken, props.dstToken, account ? tokenList : undefined);

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
      <GlobalStyles styles={AdapterStyles.globalStyle as any} />
      <AdapterContextProvider value={{ TokenSelectModal: props.TokenSelectModal }}>
        <div className="twap-container" style={{ flexDirection: "column", width: "100%" }}>
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
    <AdapterStyles.StyledMarketPrice>
      <AdapterStyles.StyledCard>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <AdapterStyles.Text className="title">{translations.currentMarketPrice}</AdapterStyles.Text>
          {ready ? (
            <Components.TokenPriceCompare loading={loading} leftToken={leftToken} rightToken={rightToken} price={marketPrice} toggleInverted={toggleInverted} />
          ) : (
            <AdapterStyles.Text>-</AdapterStyles.Text>
          )}
        </TwapStyles.StyledRowFlex>
      </AdapterStyles.StyledCard>
    </AdapterStyles.StyledMarketPrice>
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
    <AdapterStyles.StyledChangeOrder>
      <Components.IconButton onClick={switchTokens}>
        <AdapterStyles.StyledIcon icon={<HiOutlineSwitchVertical />} />
      </Components.IconButton>
    </AdapterStyles.StyledChangeOrder>
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
        {token && <TokenDisplay logo={token?.logoUrl} name={token?.symbol} />}
      </AdapterStyles.StyledTradeSize>
    </AdapterStyles.StyledTrade>
  );
};

const LimitPriceDisplay = () => {
  const { isLimitOrder, onToggleLimit, onChange, limitPrice, leftToken, rightToken, toggleInverted, warning, isLoading } = hooks.useLimitPrice();
  const translations = useTwapContext().translations;

  return (
    <AdapterStyles.StyledPrice>
      <TwapStyles.StyledColumnFlex>
        <AdapterStyles.StyledFlexStart>
          <Components.Tooltip text={isLoading ? `${translations.loading}...` : warning}>
            <AdapterStyles.StyledSwitch disabled={!!warning || isLoading} value={isLimitOrder} onChange={onToggleLimit} />
          </Components.Tooltip>
          <Components.Label tooltipText={isLimitOrder ? translations.limitPriceTooltip : translations.marketPriceTooltip}>{translations.limitPrice}</Components.Label>
        </AdapterStyles.StyledFlexStart>
        {isLimitOrder && (
          <Components.LimitPrice onChange={onChange} toggleInverted={toggleInverted} price={limitPrice} leftToken={leftToken} rightToken={rightToken} placeholder="0" />
        )}
      </TwapStyles.StyledColumnFlex>
    </AdapterStyles.StyledPrice>
  );
};

const MaxDuration = () => {
  const { duration, onChange } = store.useTwapStore((state) => ({
    duration: state.duration,
    onChange: state.setDuration,
  }));
  const translations = useTwapContext().translations;

  return (
    <AdapterStyles.StyledColoredFlex gap={10}>
      <Components.Label tooltipText={translations.maxDurationTooltip}>{translations.maxDuration}</Components.Label>
      <Components.TimeSelector value={duration} onChange={onChange} />
    </AdapterStyles.StyledColoredFlex>
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
    <AdapterStyles.StyledColoredFlex gap={10}>
      <Components.Label tooltipText={translations.tradeIntervalTootlip}>{translations.tradeInterval}</Components.Label>
      <AdapterStyles.StyledIntervalTimeSelect>
        <Components.TimeSelector disabled={!customFillDelayEnabled} onChange={onChange} value={fillDelay} />
      </AdapterStyles.StyledIntervalTimeSelect>
      {!customFillDelayEnabled && (
        <Components.IconButton tooltip={translations.customIntervalTooltip} onClick={onCustomFillDelayClick}>
          <AdapterStyles.StyledIcon icon={<AiFillEdit />} />
        </Components.IconButton>
      )}
    </AdapterStyles.StyledColoredFlex>
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
  isSrcToken?: boolean;
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
  const { toggleTokenList, onTokenSelect, tokenListOpen, inputWarning, amountPrefix, disabled, selectTokenWarning, logo, symbol, onChange, value, decimalScale } =
    hooks.useTokenPanel(isSrcToken);
  const { translations } = useTwapContext();

  const marketPrice = hooks.useMarketPrice().marketPrice;

  const onOpen = () => {
    if (!selectTokenWarning) toggleTokenList(true);
  };

  const onTokenSelected = useCallback((token: any) => {
    onTokenSelect(parseToken(token));
  }, []);

  const onClose = useCallback(() => {
    toggleTokenList(false);
  }, []);

  return (
    <>
      <TokenSelect isOpen={tokenListOpen} onClose={onClose} onCurrencySelect={onTokenSelected} selectedCurrency={undefined} otherSelectedCurrency={undefined} />

      <AdapterStyles.StyledTokenPanel>
        <TwapStyles.StyledColumnFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <AdapterStyles.StyledPanelLabel>{isSrcToken ? translations.from : translations.to}</AdapterStyles.StyledPanelLabel>
            {children}
            {!isSrcToken && marketPrice !== "0" && (
              <Components.Tooltip text={marketPrice}>
                <AdapterStyles.Text>
                  Price <Components.NumberDisplay value={marketPrice} /> {symbol}
                </AdapterStyles.Text>
              </Components.Tooltip>
            )}
          </TwapStyles.StyledRowFlex>
          <AdapterStyles.StyledColoredFlex gap={20} style={{ borderBottomLeftRadius: !isSrcToken ? "0px" : "", borderBottomRightRadius: !isSrcToken ? "0px" : "" }}>
            <Components.Tooltip text={inputWarning}>
              <AdapterStyles.StyledNumbericInput
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
              <AdapterStyles.StyledTokenSelect onClick={onOpen} style={{ background: symbol ? "" : "rgb(255, 200, 0)" }}>
                {symbol ? (
                  <TokenDisplay logo={logo} name={symbol} />
                ) : (
                  <AdapterStyles.StyledOneLineText style={{ color: symbol ? "" : "black", fontWeight: 500 }}>{translations.selectToken}</AdapterStyles.StyledOneLineText>
                )}
                <AdapterStyles.StyledIcon icon={<IoIosArrowDown size={20} style={{ fill: symbol ? "" : "black" }} />} />
              </AdapterStyles.StyledTokenSelect>
            </Components.Tooltip>
          </AdapterStyles.StyledColoredFlex>
        </TwapStyles.StyledColumnFlex>
      </AdapterStyles.StyledTokenPanel>
    </>
  );
};

const SubmitButton = ({ className = "" }: { className?: string }) => {
  const { loading, text, onClick, disabled } = hooks.useSubmitButton();
  return (
    <AdapterStyles.StyledButton className={className} loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
      {text}
    </AdapterStyles.StyledButton>
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
      <AdapterStyles.StyledOrderSummary open={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <AdapterStyles.StyledOrderSummaryContent>
          <TwapStyles.StyledColumnFlex gap={20}>
            <TwapStyles.StyledColumnFlex gap={20}>
              <TokenOrderPreview
                isSrc={true}
                isLimitOrder={isLimitOrder}
                title={translations.from}
                amount={srcAmountUi}
                usdPrice={getSrcAmountUsdUi()}
                name={srcToken?.symbol}
                logo={srcToken?.logoUrl}
              />
              <TokenOrderPreview
                isLimitOrder={isLimitOrder}
                title={translations.to}
                amount={getDstAmountUi()}
                usdPrice={getDstAmountUsdUi()}
                name={dstToken?.symbol}
                logo={dstToken?.logoUrl}
              />
              <OrderConfirmationLimitPrice />

              <AdapterStyles.StyledColoredFlex>
                <TwapStyles.StyledColumnFlex gap={20}>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationDeadlineTooltip}>{translations.expiration}</Components.Label>
                    <AdapterStyles.Text>{getDeadlineUi()}</AdapterStyles.Text>
                  </TwapStyles.StyledRowFlex>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationOrderType}>{translations.orderType}</Components.Label>
                    <AdapterStyles.Text>{isLimitOrder ? translations.limitOrder : translations.marketOrder}</AdapterStyles.Text>
                  </TwapStyles.StyledRowFlex>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationTradeSizeTooltip}>{translations.tradeSize}</Components.Label>
                    <TwapStyles.StyledRowFlex justifyContent="flex-end">
                      <Components.TokenName name={srcToken?.symbol} />
                      <Components.TokenLogo logo={srcToken?.logoUrl} />
                      <AdapterStyles.Text>
                        <Components.Tooltip text={getSrcChunkAmountUi()}>
                          <Components.NumberDisplay value={getSrcChunkAmountUi()} />
                        </Components.Tooltip>
                      </AdapterStyles.Text>
                    </TwapStyles.StyledRowFlex>
                  </TwapStyles.StyledRowFlex>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationTotalTradesTooltip}>{translations.totalTrades}</Components.Label>
                    <AdapterStyles.Text>{chunks}</AdapterStyles.Text>
                  </TwapStyles.StyledRowFlex>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationtradeIntervalTooltip}>{translations.tradeInterval}</Components.Label>
                    <AdapterStyles.Text>{getFillDelayUi(translations)}</AdapterStyles.Text>
                  </TwapStyles.StyledRowFlex>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={isLimitOrder ? translations.confirmationMinDstAmountTootipLimit : translations.confirmationMinDstAmountTootipMarket}>
                      {translations.minReceivedPerTrade}:
                    </Components.Label>
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
                  </TwapStyles.StyledRowFlex>
                </TwapStyles.StyledColumnFlex>
              </AdapterStyles.StyledColoredFlex>
              <TradeInfoDetailsDisplay />
            </TwapStyles.StyledColumnFlex>
            <TwapStyles.StyledColumnFlex gap={12}>
              <TwapStyles.StyledRowFlex gap={5}>
                <Components.SmallLabel>{translations.acceptDisclaimer}</Components.SmallLabel>
                <AdapterStyles.StyledSwitch value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
              </TwapStyles.StyledRowFlex>
              <AdapterStyles.Text>{translations.outputWillBeSentTo}</AdapterStyles.Text>
              <AdapterStyles.Text>{lib?.maker}</AdapterStyles.Text>
              <SubmitButton />
            </TwapStyles.StyledColumnFlex>
          </TwapStyles.StyledColumnFlex>
        </AdapterStyles.StyledOrderSummaryContent>
      </AdapterStyles.StyledOrderSummary>
    </>
  );
};

const TradeInfoDetailsDisplay = () => {
  return (
    <AdapterStyles.StyledColoredFlex>
      <TwapStyles.StyledColumnFlex gap={10}>
        <Components.Disclaimer />
      </TwapStyles.StyledColumnFlex>
    </AdapterStyles.StyledColoredFlex>
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
  logo,
  name,
  usdPrice,
  amount,
  isSrc,
}: {
  isLimitOrder?: boolean;
  title: string;
  logo?: string;
  name?: string;
  usdPrice?: string;
  amount?: string;
  isSrc?: boolean;
}) => {
  return (
    <AdapterStyles.StyledColoredFlex>
      <TwapStyles.StyledColumnFlex gap={10}>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Label>{title}</Components.Label>
          <AdapterStyles.StyledUSD value={usdPrice} />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <TokenDisplay name={name} logo={logo} />
          <StyledTokenOrderPreviewAmount>
            {!isSrc && <> {isLimitOrder ? "≥ " : "~ "}</>} <Components.NumberDisplay value={amount} />
          </StyledTokenOrderPreviewAmount>
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </AdapterStyles.StyledColoredFlex>
  );
};

const StyledTokenOrderPreviewAmount = styled(Components.SmallLabel)({
  fontSize: 19,
});
