import { GlobalStyles } from "@mui/material";
import { Box, styled } from "@mui/system";
import { Components, hooks, TwapAdapter, useTwapContext, Translations, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { memo, ReactNode, useCallback, useState } from "react";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import { AdapterContextProvider, parseToken, useAdapterContext, useGetProvider, useGlobalStyles, useParseTokenList, usePrepareAdapterContextProps, useTokensFromDapp } from "./hooks";
import { SpookySwapTWAPProps } from ".";
import * as AdapterStyles from "./styles";

const TWAP = (props: SpookySwapTWAPProps) => {
  const tokenList = useParseTokenList(props.getTokenImage, props.dappTokens);
  useTokensFromDapp(props.srcToken, props.dstToken, props.account ? tokenList : undefined);
  const provider = useGetProvider(props.getProvider, props.account);
  const adapterContextProps = usePrepareAdapterContextProps(props);
  const globalStyles = useGlobalStyles(false);
  const connect = useCallback(() => {
    props.connect();
  }, []);

  return (
    <>
      <GlobalStyles styles={globalStyles} />
      <TwapAdapter
        connect={connect}
        config={Configs.SpookySwap}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={provider}
        account={props.account}
        connectedChainId={props.connectedChainId}
      >
        <AdapterContextProvider value={adapterContextProps}>
          <div className="twap-container">
            <SrcTokenPanel />
            <ChangeTokensOrder />
            <DstTokenPanel />
            <LimitPriceDisplay />
            <TradeSize />
            <MaxDuration />
            <TradeInterval />
            <TwapStyles.StyledRowFlex className='twap-create-order-btn'>
              <SubmitButton />
            </TwapStyles.StyledRowFlex>
            <OrderConfirmation />
            <Components.PoweredBy />
          </div>
        </AdapterContextProvider>
      </TwapAdapter>
    </>
  );
};

export default memo(TWAP);

const MarketPrice = () => {
  const { toggleInverted, leftToken, rightToken, marketPrice, ready, loading } = hooks.useMarketPrice();
  const translations = useTwapContext().translations;

  return (
    <AdapterStyles.StyledMarketPrice>
      <Components.Card>
        <AdapterStyles.StyledCardFlex justifyContent="space-between">
          <TwapStyles.StyledText className="title">{translations.currentMarketPrice}</TwapStyles.StyledText>
          {ready ? (
            <Components.TokenPriceCompare loading={loading} leftToken={leftToken} rightToken={rightToken} price={marketPrice} toggleInverted={toggleInverted} />
          ) : (
            <TwapStyles.StyledText>-</TwapStyles.StyledText>
          )}
        </AdapterStyles.StyledCardFlex>
      </Components.Card>
    </AdapterStyles.StyledMarketPrice>
  );
};

const SrcTokenPercentSelector = () => {
  const { onPercentClick } = hooks.useCustomActions();
  const translations = useTwapContext().translations;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <AdapterStyles.StyledSrcTokenPercentSelector>
      <AdapterStyles.StyledPercentBtn onClick={() => onClick(0.5)}>50%</AdapterStyles.StyledPercentBtn>
      <AdapterStyles.StyledPercentBtn onClick={() => onClick(1)}>{translations.max}</AdapterStyles.StyledPercentBtn>
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
    <TwapStyles.StyledRowFlex className="twap-change-order">
      <button onClick={switchTokens}>
        <Components.Icon icon={<HiOutlineSwitchVertical style={{width:16,
        height:16}} />} />
      </button>
    </TwapStyles.StyledRowFlex>
  );
};

const TradeSize = () => {
  const { chunksAmount, onTotalChunksChange, totalChunks, token, maxPossibleChunks, showChunksSelect, usdValue } = store.useTwapStore((state) => ({
    chunksAmount: state.getSrcChunkAmountUi(),
    onTotalChunksChange: state.setChunks,
    totalChunks: state.chunks,
    token: state.srcToken,
    maxPossibleChunks: state.getMaxPossibleChunks(),
    showChunksSelect: !!state.srcToken && !!state.srcAmountUi,
    usdValue: state.getSrcChunkAmountUsdUi(),
  }));
  const translations = useTwapContext().translations;
  const usdLoading = hooks.useLoadingState().srcUsdLoading;

  return (
    <AdapterStyles.StyledTrade>
      <Components.Card>
        <AdapterStyles.StyledCardFlex>
          <AdapterStyles.StyledColumnGap>
            <AdapterStyles.StyledSliderContainer gap={10}>
              <Components.Label placement="right" tooltipText={translations.totalTradesTooltip}>{translations.totalTrades}</Components.Label>
              {showChunksSelect ? (
                <>
                  <AdapterStyles.StyledSlider>
                    <Components.Slider maxTrades={maxPossibleChunks} value={totalChunks} onChange={onTotalChunksChange} />
                  </AdapterStyles.StyledSlider>
                  <Components.Tooltip placement="bottom" text={translations.sliderMinSizeTooltip}>
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
                <TwapStyles.StyledText>-</TwapStyles.StyledText>
              )}
            </AdapterStyles.StyledSliderContainer>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <AdapterStyles.StyledTradeSize>
                <Components.Label placement="right" fontSize={14} tooltipText={translations.tradeSizeTooltip}>
                  {translations.tradeSize}: <Components.NumberDisplay value={chunksAmount} />
                </Components.Label>
                {token && <TokenDisplay logo={token?.logoUrl} name={token?.symbol} />}
              </AdapterStyles.StyledTradeSize>
              <AdapterStyles.StyledUSD value={usdValue} isLoading={usdLoading} />
            </TwapStyles.StyledRowFlex>
          </AdapterStyles.StyledColumnGap>
        </AdapterStyles.StyledCardFlex>
      </Components.Card>
    </AdapterStyles.StyledTrade>
  );
};

const LimitPriceDisplay = () => {
  const { isLimitOrder, onToggleLimit, onChange, limitPrice, leftToken, rightToken, toggleInverted, warning } = hooks.useLimitPrice();
  const isLoading = false;
  const translations = useTwapContext().translations;

  return (
    <Components.Card className="twap-limit-price">
      <AdapterStyles.StyledColumnGap>
        <TwapStyles.StyledRowFlex justifyContent="flex-start">
          <Components.Tooltip placement="left" text={isLoading ? `${translations.loading}...` : warning}>
            <Components.Switch disabled={!!warning || isLoading} value={isLimitOrder} onChange={onToggleLimit} />
          </Components.Tooltip>
          <Components.Label placement="right" tooltipText={isLimitOrder ? translations.limitPriceTooltip : translations.marketPriceTooltip}>{translations.limitPrice}</Components.Label>
        </TwapStyles.StyledRowFlex>
        {isLimitOrder && (
          <Box style={{padding: '0px 5px'}}>
            <Components.LimitPrice onChange={onChange} toggleInverted={toggleInverted} price={limitPrice} leftToken={leftToken} rightToken={rightToken} placeholder="0" />
          </Box>
        )}
      </AdapterStyles.StyledColumnGap>
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
      <AdapterStyles.StyledCardFlex justifyContent="space-between" gap={10}>
        <Components.Label placement="right" tooltipText={translations.maxDurationTooltip}>{translations.maxDuration}</Components.Label>
        <Components.TimeSelector value={duration} onChange={onChange} />
      </AdapterStyles.StyledCardFlex>
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
      <AdapterStyles.StyledCardFlex justifyContent="space-between" gap={10}>
        <Components.Label placement="right" tooltipText={translations.tradeIntervalTootlip}>{translations.tradeInterval}</Components.Label>
        <AdapterStyles.StyledIntervalTimeSelect>
          <Components.TimeSelector disabled={!customFillDelayEnabled} onChange={onChange} value={fillDelay} />
        </AdapterStyles.StyledIntervalTimeSelect>
        {!customFillDelayEnabled && (
          <Components.IconButton tooltip={translations.customIntervalTooltip} onClick={onCustomFillDelayClick}>
            <Components.Icon icon={<AiFillEdit />} />
          </Components.IconButton>
        )}
      </AdapterStyles.StyledCardFlex>
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
  isSrcToken?: boolean;
}

const TokenPanel = ({ children, isSrcToken }: TokenPanelProps) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const translations = useTwapContext().translations

  const { onTokenSelect, inputWarning, amountPrefix, disabled, selectTokenWarning, token, onChange, value, usdValue, balanceLoading, balance, usdLoading, decimalScale } =
    hooks.useTokenPanel(isSrcToken);

  const { TokenSelectModal, getTokenImage, onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();

  const onOpen = () => {
    if (!selectTokenWarning) setTokenListOpen(true);
  };

  const onTokenSelected = useCallback(
    (token: TokenData) => {
      setTokenListOpen(false);
      if (isSrcToken) {
        onSrcTokenSelected(token);
      } else {
        onDstTokenSelected(token);
      }
      onTokenSelect(parseToken(token, getTokenImage));
    },
    [isSrcToken]
  );

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      {TokenSelectModal && <TokenSelectModal commonTokens={[]} tokenSelected={undefined} onSelect={onTokenSelected} isOpen={tokenListOpen} onClose={onClose} />}
      <AdapterStyles.StyledTokenPanel>
        <Components.Tooltip text={selectTokenWarning} placement="bottom">
          <Components.Card>
            <AdapterStyles.StyledColumnGap>
              <AdapterStyles.StyledCardFlex justifyContent="space-between">
                <AdapterStyles.Text className="twap-panel-title">{isSrcToken ? translations.from : translations.to}</AdapterStyles.Text>
                {children}
              </AdapterStyles.StyledCardFlex>
              <AdapterStyles.StyledCardFlex>
                <Box onClick={onOpen} className="twap-token-select">
                  <TokenDisplay logo={token?.logoUrl} name={token?.symbol} />
                </Box>
                <TwapStyles.StyledColumnFlex style={{ alignItems: "flex-end" }} gap={2}>
                  <Components.NumericInput
                    decimalScale={decimalScale}
                    prefix={amountPrefix}
                    loading={false}
                    disabled={disabled}
                    placeholder="0.0"
                    onChange={onChange || (() => {})}
                    value={value}
                  />
                  <AdapterStyles.StyledUSD value={usdValue} isLoading={usdLoading} />
                </TwapStyles.StyledColumnFlex>
              </AdapterStyles.StyledCardFlex>
              <Balance isLoading={balanceLoading} balance={balance} />
            </AdapterStyles.StyledColumnGap>
          </Components.Card>
        </Components.Tooltip>
      </AdapterStyles.StyledTokenPanel>
    </>
  );
};

const Balance = ({ isLoading, balance = "0" }: { isLoading: boolean; balance: string }) => {
  const translations = useTwapContext().translations;

  return (
    <AdapterStyles.StyledCardFlex justifyContent='space-between' className="twap-balance">
      <TwapStyles.StyledText>{translations.balance}</TwapStyles.StyledText>
      {balance && (
        <Components.SmallLabel loading={isLoading}>
          <Components.NumberDisplay value={balance} />
        </Components.SmallLabel>
      )}
    </AdapterStyles.StyledCardFlex>
  );
};

const SubmitButton = () => {
  const { loading, text, onClick, disabled } = hooks.useSubmitButton();
  return (
    <Components.Button className="twap-button" loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
      {text}
    </Components.Button>
  );
};

const OrderConfirmation = () => {
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
        <AdapterStyles.StyledColumnGap gap={12} className="twap-order-summary">
          <TokenOrderPreview isSrc={true} isLimitOrder={isLimitOrder} title={translations.from} amount={srcAmountUi} usdPrice={getSrcAmountUsdUi()} token={srcToken} />
          <TokenOrderPreview isLimitOrder={isLimitOrder} title={translations.to} amount={getDstAmountUi()} usdPrice={getDstAmountUsdUi()} token={dstToken} />
          <OrderConfirmationLimitPrice />

          <Components.Card className="twap-summary-breakdown">
            <TwapStyles.StyledColumnFlex gap={12}>
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
          <Components.Card>
            <AdapterStyles.StyledCardFlex>
              <TwapStyles.StyledColumnFlex>
                <Box style={{ display: "flex", gap: 5 }}>
                  <Components.SmallLabel>{translations.acceptDisclaimer}</Components.SmallLabel>
                  <Components.Switch value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
                </Box>
                <TwapStyles.StyledText className="output-text">{translations.outputWillBeSentTo}</TwapStyles.StyledText>
                <TwapStyles.StyledText className="output-text">{lib?.maker}</TwapStyles.StyledText>
              </TwapStyles.StyledColumnFlex>
            </AdapterStyles.StyledCardFlex>
          </Components.Card>
          <SubmitButton />
        </AdapterStyles.StyledColumnGap>
      </Components.Modal>
    </>
  );
};

const SummaryRow = ({ label, tooltip, children }: { label: string; tooltip: string; children: ReactNode }) => {
  return (
    <AdapterStyles.StyledSummaryRow>
      <Components.Label placement="right" tooltipText={tooltip}>{label}</Components.Label>
      <Box className='twap-summary-row-children'>{children}</Box>
    </AdapterStyles.StyledSummaryRow>
  );
};



const TradeInfoDetailsDisplay = () => {
  return (
    <Components.Card>
      <AdapterStyles.StyledCardFlex>
        <AdapterStyles.StyledColumnGap gap={10}>
          <Components.Disclaimer />
        </AdapterStyles.StyledColumnGap>
      </AdapterStyles.StyledCardFlex>
    </Components.Card>
  );
};

const OrderConfirmationLimitPrice = () => {
  const { isLimitOrder, toggleInverted, limitPrice, leftToken, rightToken } = hooks.useLimitPrice();
  const translations = useTwapContext().translations;

  return (
    <Components.Card>
      <AdapterStyles.StyledCardFlex justifyContent="space-between">
        <Components.Label placement="right" tooltipText={translations.confirmationLimitPriceTooltip}>
          {translations.limitPrice}
        </Components.Label>
        {isLimitOrder ? (
          <Components.TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={limitPrice} toggleInverted={toggleInverted} />
        ) : (
          <TwapStyles.StyledText>{translations.none}</TwapStyles.StyledText>
        )}
      </AdapterStyles.StyledCardFlex>
    </Components.Card>
  );
};

const TokenOrderPreview = ({
  isLimitOrder,
  title,
  token,
  usdPrice,
  amount,
  isSrc,
}: {
  isLimitOrder?: boolean;
  title: string;
  token?: TokenData;
  usdPrice?: string;
  amount?: string;
  isSrc?: boolean;
}) => {
  return (
    <Components.Card>
      <AdapterStyles.StyledCardFlex>
        <AdapterStyles.StyledColumnGap gap={10}>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Label placement="right">{title}</Components.Label>
            <AdapterStyles.StyledUSD value={usdPrice} />
          </TwapStyles.StyledRowFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <TokenDisplay name={token?.symbol} logo={token?.logoUrl} />
            <AdapterStyles.StyledTokenOrderPreviewAmount>
              {!isSrc && <> {isLimitOrder ? "≥ " : "~ "}</>} <Components.NumberDisplay value={amount} decimalScale={token?.decimals} />
            </AdapterStyles.StyledTokenOrderPreviewAmount>
          </TwapStyles.StyledRowFlex>
        </AdapterStyles.StyledColumnGap>
      </AdapterStyles.StyledCardFlex>
    </Components.Card>
  );
};
