import { GlobalStyles } from "@mui/material";
import { Box, styled } from "@mui/system";
import { Components, hooks, TwapAdapter, useTwapContext, Translations, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { memo, ReactNode, useCallback } from "react";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import { AdapterContextProvider, parseToken, useAdapterContext, useGetProvider, useParseTokenList, usePrepareAdapterContextProps, useTokensFromDapp } from "./hooks";
import { SpookySwapTWAPProps } from ".";
import * as AdapterStyles from "./styles";

const TWAP = (props: SpookySwapTWAPProps) => {
  const tokenList = useParseTokenList(props.getTokenImage, props.dappTokens);
  useTokensFromDapp(props.srcToken, props.dstToken, props.account ? tokenList : undefined);
  const provider = useGetProvider(props.getProvider, props.account);
  const adapterContextProps = usePrepareAdapterContextProps(props);

  const connect = useCallback(() => {
    props.connect();
  }, []);

  return (
    <>
      <GlobalStyles styles={AdapterStyles.globalStyle as any} />
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
          <div className="twap-container" style={{ flexDirection: "column", width: "100%" }}>
            <SrcTokenPanel />
            <ChangeTokensOrder />
            <DstTokenPanel />
            <LimitPriceDisplay />
            <TradeSize />
            <MaxDuration />
            <TradeInterval />
            <SubmitButton />
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
      <AdapterStyles.StyledCard>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <TwapStyles.StyledText className="title">{translations.currentMarketPrice}</TwapStyles.StyledText>
          {ready ? (
            <Components.TokenPriceCompare loading={loading} leftToken={leftToken} rightToken={rightToken} price={marketPrice} toggleInverted={toggleInverted} />
          ) : (
            <TwapStyles.StyledText>-</TwapStyles.StyledText>
          )}
        </TwapStyles.StyledRowFlex>
      </AdapterStyles.StyledCard>
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
    <AdapterStyles.StyledChangeOrder>
      <Components.IconButton onClick={switchTokens}>
        <AdapterStyles.StyledIcon icon={<HiOutlineSwitchVertical />} />
      </Components.IconButton>
    </AdapterStyles.StyledChangeOrder>
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
      <AdapterStyles.StyledCard>
        <AdapterStyles.StyledColumnGap>
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
              <TwapStyles.StyledText>-</TwapStyles.StyledText>
            )}
          </AdapterStyles.StyledSliderContainer>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <AdapterStyles.StyledTradeSize>
              <Components.Label fontSize={14} tooltipText={translations.tradeSizeTooltip}>
                {translations.tradeSize}: <Components.NumberDisplay value={chunksAmount} />
              </Components.Label>
              {token && <TokenDisplay logo={token?.logoUrl} name={token?.symbol} />}
            </AdapterStyles.StyledTradeSize>
            <AdapterStyles.StyledUSD value={usdValue} isLoading={usdLoading} />
          </TwapStyles.StyledRowFlex>
        </AdapterStyles.StyledColumnGap>
      </AdapterStyles.StyledCard>
    </AdapterStyles.StyledTrade>
  );
};

const LimitPriceDisplay = () => {
  const { isLimitOrder, onToggleLimit, onChange, limitPrice, leftToken, rightToken, toggleInverted, warning } = hooks.useLimitPrice();
  const isLoading = false;
  const translations = useTwapContext().translations;

  return (
    <AdapterStyles.StyledPrice>
      <AdapterStyles.StyledCard>
        <AdapterStyles.StyledColumnGap>
          <TwapStyles.StyledRowFlex justifyContent="flex-start">
            <Components.Tooltip text={warning}>
              {isLoading ? <Components.Loader width={50} /> : <AdapterStyles.StyledSwitch disabled={!!warning} value={isLimitOrder} onChange={onToggleLimit} />}
            </Components.Tooltip>
            <Components.Label tooltipText={isLimitOrder ? translations.limitPriceTooltip : translations.marketPriceTooltip}>{translations.limitPrice}</Components.Label>
          </TwapStyles.StyledRowFlex>
          {isLimitOrder && (
            <Components.LimitPrice onChange={onChange} toggleInverted={toggleInverted} price={limitPrice} leftToken={leftToken} rightToken={rightToken} placeholder="0" />
          )}
        </AdapterStyles.StyledColumnGap>
      </AdapterStyles.StyledCard>
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
    <AdapterStyles.StyledCard>
      <TwapStyles.StyledRowFlex justifyContent="space-between" gap={10}>
        <Components.Label tooltipText={translations.maxDurationTooltip}>{translations.maxDuration}</Components.Label>
        <Components.TimeSelector value={duration} onChange={onChange} />
      </TwapStyles.StyledRowFlex>
    </AdapterStyles.StyledCard>
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
    <AdapterStyles.StyledCard>
      <TwapStyles.StyledRowFlex justifyContent="space-between" gap={10}>
        <Components.Label tooltipText={translations.tradeIntervalTootlip}>{translations.tradeInterval}</Components.Label>
        <AdapterStyles.StyledIntervalTimeSelect>
          <Components.TimeSelector disabled={!customFillDelayEnabled} onChange={onChange} value={fillDelay} />
        </AdapterStyles.StyledIntervalTimeSelect>
        {!customFillDelayEnabled && (
          <Components.IconButton tooltip={translations.customIntervalTooltip} onClick={onCustomFillDelayClick}>
            <AdapterStyles.StyledIcon icon={<AiFillEdit />} />
          </Components.IconButton>
        )}
      </TwapStyles.StyledRowFlex>
    </AdapterStyles.StyledCard>
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
  const {
    toggleTokenList,
    onTokenSelect,
    tokenListOpen,
    inputWarning,
    amountPrefix,
    disabled,
    selectTokenWarning,
    logo,
    symbol,
    onChange,
    value,
    usdValue,
    balanceLoading,
    balance,
    usdLoading,
    decimalScale,
  } = hooks.useTokenPanel(isSrcToken);

  const { TokenSelectModal, getTokenImage, onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();

  const onOpen = () => {
    if (!selectTokenWarning) toggleTokenList(true);
  };

  const onTokenSelected = useCallback(
    (token: TokenData) => {
      if (isSrcToken) {
        onSrcTokenSelected(token);
      } else {
        onDstTokenSelected(token);
      }
      onTokenSelect(parseToken(token, getTokenImage));
    },
    [isSrcToken]
  );

  return (
    <>
      {TokenSelectModal && (
        <TokenSelectModal commonTokens={[]} tokenSelected={undefined} onSelect={onTokenSelected} isOpen={tokenListOpen} onClose={() => toggleTokenList(false)} />
      )}
      <AdapterStyles.StyledTokenPanel>
        <AdapterStyles.StyledCard>
          <AdapterStyles.StyledColumnGap>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <AdapterStyles.StyledPanelLabel>{isSrcToken ? "From" : "To (estimated)"}</AdapterStyles.StyledPanelLabel>
              {children}
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between" gap={20}>
              <Components.Tooltip text={selectTokenWarning}>
                <AdapterStyles.StyledTokenSelect onClick={onOpen}>
                  <TokenDisplay logo={logo} name={symbol} />
                  <AdapterStyles.StyledIcon icon={<IoIosArrowDown size={20} />} />
                </AdapterStyles.StyledTokenSelect>
              </Components.Tooltip>
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
            </TwapStyles.StyledRowFlex>
            <AdapterStyles.StyledUSD value={usdValue} isLoading={usdLoading} />
            <Balance isLoading={balanceLoading} balance={balance} />
          </AdapterStyles.StyledColumnGap>
        </AdapterStyles.StyledCard>
      </AdapterStyles.StyledTokenPanel>
    </>
  );
};

const Balance = ({ isLoading, balance = "0" }: { isLoading: boolean; balance: string }) => {
  const translations = useTwapContext().translations;

  return (
    <AdapterStyles.StyledBalance>
      <TwapStyles.StyledText>{translations.balance}</TwapStyles.StyledText>
      {balance && (
        <Components.SmallLabel loading={isLoading}>
          <Components.NumberDisplay value={balance} />
        </Components.SmallLabel>
      )}
    </AdapterStyles.StyledBalance>
  );
};

const SubmitButton = () => {
  const { loading, text, onClick, disabled } = hooks.useSubmitButton();
  return (
    <AdapterStyles.StyledButton loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
      {text}
    </AdapterStyles.StyledButton>
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
      <AdapterStyles.StyledTradeInfoModal open={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <AdapterStyles.StyledOrderConfirmation>
          <AdapterStyles.StyledColumnGap gap={20}>
            <AdapterStyles.StyledColumnGap gap={20}>
              <TokenOrderPreview isSrc={true} isLimitOrder={isLimitOrder} title={translations.from} amount={srcAmountUi} usdPrice={getSrcAmountUsdUi()} token={srcToken} />
              <TokenOrderPreview isLimitOrder={isLimitOrder} title={translations.to} amount={getDstAmountUi()} usdPrice={getDstAmountUsdUi()} token={dstToken} />
              <OrderConfirmationLimitPrice />

              <AdapterStyles.StyledCard>
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
              </AdapterStyles.StyledCard>
              <TradeInfoDetailsDisplay />
            </AdapterStyles.StyledColumnGap>
            <AdapterStyles.StyledColumnGap gap={12}>
              <Box style={{ display: "flex", gap: 5 }}>
                <Components.SmallLabel>{translations.acceptDisclaimer}</Components.SmallLabel>
                <AdapterStyles.StyledSwitch value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
              </Box>
              <TwapStyles.StyledText className="output-text">{translations.outputWillBeSentTo}</TwapStyles.StyledText>
              <TwapStyles.StyledText className="output-text">{lib?.maker}</TwapStyles.StyledText>
              <SubmitButton />
            </AdapterStyles.StyledColumnGap>
          </AdapterStyles.StyledColumnGap>
        </AdapterStyles.StyledOrderConfirmation>
      </AdapterStyles.StyledTradeInfoModal>
    </>
  );
};

const TradeInfoDetailsDisplay = () => {
  return (
    <AdapterStyles.StyledCard>
      <AdapterStyles.StyledColumnGap gap={10}>
        <Components.Disclaimer />
      </AdapterStyles.StyledColumnGap>
    </AdapterStyles.StyledCard>
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
          <TwapStyles.StyledText>{translations.none}</TwapStyles.StyledText>
        )}
      </TwapStyles.StyledRowFlex>
    </AdapterStyles.StyledLimitPrice>
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
    <AdapterStyles.StyledTokenOrder>
      <AdapterStyles.StyledCard>
        <AdapterStyles.StyledColumnGap gap={10}>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Label>{title}</Components.Label>
            <AdapterStyles.StyledUSD value={usdPrice} />
          </TwapStyles.StyledRowFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <TokenDisplay name={token?.symbol} logo={token?.logoUrl} />
            <AdapterStyles.StyledTokenOrderPreviewAmount>
              {!isSrc && <> {isLimitOrder ? "≥ " : "~ "}</>} <Components.NumberDisplay value={amount} decimalScale={token?.decimals} />
            </AdapterStyles.StyledTokenOrderPreviewAmount>
          </TwapStyles.StyledRowFlex>
        </AdapterStyles.StyledColumnGap>
      </AdapterStyles.StyledCard>
    </AdapterStyles.StyledTokenOrder>
  );
};
