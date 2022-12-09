import { GlobalStyles } from "@mui/material";
import { Box } from "@mui/system";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { memo, ReactNode, useCallback } from "react";
import * as AdapterStyles from "./styles";
import { Configs, TokenData } from "@orbs-network/twap";
import { AdapterContextProvider, parseToken, useAdapterContext, useGetProvider, useParseTokenList, usePrepareAdapterContextProps, useSetTokensFromDapp } from "./hooks";
import translations from "./i18n/en.json";
import { SpiritSwapTWAPProps } from ".";

const TWAP = (props: SpiritSwapTWAPProps) => {
  const { getTokenImage, dappTokens } = props;
  const tokenList = useParseTokenList(getTokenImage, dappTokens);
  useSetTokensFromDapp(props.srcToken, props.dstToken, props.account ? tokenList : undefined);
  const provider = useGetProvider(props.getProvider, props.account);
  const adapterContextProps = usePrepareAdapterContextProps(props);

  const connect = useCallback(() => {
    props.connect();
  }, []);

  return (
    <TwapAdapter
      connect={connect}
      config={Configs.SpiritSwap}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
      translations={translations as Translations}
      provider={provider}
      account={props.account}
    >
      <GlobalStyles styles={AdapterStyles.globalStyle as any} />
      <AdapterContextProvider value={adapterContextProps}>
        <div className="twap-container" style={{ flexDirection: "column", width: "100%" }}>
          {/* <button onClick={onClick}>reset</button> */}
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
  const translations = useTwapContext().translations;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <AdapterStyles.StyledSrcTokenPercentSelector>
      <AdapterStyles.StyledPercentBtn onClick={() => onClick(0.25)}>25%</AdapterStyles.StyledPercentBtn>
      <AdapterStyles.StyledPercentBtn onClick={() => onClick(0.5)}>50%</AdapterStyles.StyledPercentBtn>
      <AdapterStyles.StyledPercentBtn onClick={() => onClick(0.75)}>75%</AdapterStyles.StyledPercentBtn>
      <AdapterStyles.StyledPercentBtn onClick={() => onClick(1)}>{translations.max}</AdapterStyles.StyledPercentBtn>
    </AdapterStyles.StyledSrcTokenPercentSelector>
  );
};

const SrcTokenPanel = () => {
  return (
    <TokenPanel isSrcToken={true}>
      <SrcTokenPercentSelector />
    </TokenPanel>
  );
};

const DstTokenPanel = () => {
  return (
    <AdapterStyles.StyledDstToken>
      <TokenPanel isSrcToken={false} />
      <MarketPrice />
    </AdapterStyles.StyledDstToken>
  );
};

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
        <TwapStyles.StyledColumnFlex>
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
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <AdapterStyles.StyledTradeSize>
              <Components.Label fontSize={14} tooltipText={translations.tradeSizeTooltip}>
                {translations.tradeSize}: <Components.NumberDisplay value={chunksAmount} />
              </Components.Label>
              {token && <TokenDisplay logo={token?.logoUrl} name={token?.symbol} />}
            </AdapterStyles.StyledTradeSize>
            <AdapterStyles.StyledUSD value={usdValue} isLoading={usdLoading} />
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
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
        <TwapStyles.StyledColumnFlex>
          <AdapterStyles.StyledFlexStart>
            <Components.Tooltip text={warning}>
              {isLoading ? <Components.Loader width={50} /> : <AdapterStyles.StyledSwitch disabled={!!warning} value={isLimitOrder} onChange={onToggleLimit} />}
            </Components.Tooltip>
            <Components.Label tooltipText={isLimitOrder ? translations.limitPriceTooltip : translations.marketPriceTooltip}>{translations.limitPrice}</Components.Label>
          </AdapterStyles.StyledFlexStart>
          {isLimitOrder && (
            <Components.LimitPrice onChange={onChange} toggleInverted={toggleInverted} price={limitPrice} leftToken={leftToken} rightToken={rightToken} placeholder="0" />
          )}
        </TwapStyles.StyledColumnFlex>
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
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
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
    inputLoading,
    decimalScale,
  } = hooks.useTokenPanel(isSrcToken);

  const { getTokenImage, TokenSelectModal, onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();

  const onOpen = () => {
    if (!selectTokenWarning) toggleTokenList(true);
  };

  const onTokenSelected = useCallback(
    (token: any) => {
      onTokenSelect(parseToken(token, getTokenImage));
      if (isSrcToken) {
        onSrcTokenSelected(token);
      } else {
        onDstTokenSelected(token);
      }
    },
    [isSrcToken, onSrcTokenSelected, onDstTokenSelected]
  );

  const onListClose = useCallback(() => {
    toggleTokenList(false);
  }, []);

  return (
    <>
      <TokenSelectModal tokenSelected={undefined} onSelect={onTokenSelected} isOpen={tokenListOpen} onClose={onListClose} />
      <AdapterStyles.StyledTokenPanel>
        <AdapterStyles.StyledCard>
          <TwapStyles.StyledColumnFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.Tooltip text={inputWarning}>
                <AdapterStyles.StyledNumbericInput
                  decimalScale={decimalScale}
                  prefix={amountPrefix}
                  disabled={disabled}
                  placeholder="0"
                  onChange={onChange || (() => {})}
                  value={value}
                  loading={inputLoading}
                />
              </Components.Tooltip>
              <Components.Tooltip text={selectTokenWarning}>
                <AdapterStyles.StyledTokenSelect onClick={onOpen}>
                  <TokenDisplay logo={logo} name={symbol} />
                  <AdapterStyles.StyledIcon icon={<IoIosArrowDown size={20} />} />
                </AdapterStyles.StyledTokenSelect>
              </Components.Tooltip>
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <AdapterStyles.StyledUSD value={usdValue} isLoading={usdLoading} />
              <Components.Balance isLoading={balanceLoading} value={balance} />
            </TwapStyles.StyledRowFlex>
            {children}
          </TwapStyles.StyledColumnFlex>
        </AdapterStyles.StyledCard>
      </AdapterStyles.StyledTokenPanel>
    </>
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

const OrderSummary = () => {
  const twapStore = store.useTwapStore();
  const translations = useTwapContext().translations;

  return (
    <>
      <AdapterStyles.StyledTradeInfoModal open={twapStore.showConfirmation} onClose={() => twapStore.setShowConfirmation(false)}>
        <AdapterStyles.StyledOrderConfirmation>
          <TwapStyles.StyledColumnFlex gap={20}>
            <TwapStyles.StyledColumnFlex gap={20}>
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

              <AdapterStyles.StyledCard className="twap-order-summary">
                <TwapStyles.StyledColumnFlex gap={12}>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationDeadlineTooltip}>{translations.expiration}</Components.Label>
                    <AdapterStyles.Text>{twapStore.getDeadlineUi()}</AdapterStyles.Text>
                  </TwapStyles.StyledRowFlex>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationOrderType}>{translations.orderType}</Components.Label>
                    <AdapterStyles.Text>{twapStore.isLimitOrder ? translations.limitOrder : translations.marketOrder}</AdapterStyles.Text>
                  </TwapStyles.StyledRowFlex>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationTradeSizeTooltip}>{translations.tradeSize}</Components.Label>
                    <TwapStyles.StyledRowFlex justifyContent="flex-end">
                      <Components.TokenName name={twapStore.srcToken?.symbol} />
                      <Components.TokenLogo logo={twapStore.srcToken?.logoUrl} />
                      <AdapterStyles.Text>
                        <Components.Tooltip text={twapStore.getSrcChunkAmountUi()}>
                          <Components.NumberDisplay value={twapStore.getSrcChunkAmountUi()} />
                        </Components.Tooltip>
                      </AdapterStyles.Text>
                    </TwapStyles.StyledRowFlex>
                  </TwapStyles.StyledRowFlex>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationTotalTradesTooltip}>{translations.totalTrades}</Components.Label>
                    <AdapterStyles.Text>{twapStore.chunks}</AdapterStyles.Text>
                  </TwapStyles.StyledRowFlex>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationtradeIntervalTooltip}>{translations.tradeInterval}</Components.Label>
                    <AdapterStyles.Text>{twapStore.getFillDelayUi(translations)}</AdapterStyles.Text>
                  </TwapStyles.StyledRowFlex>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={twapStore.isLimitOrder ? translations.confirmationMinDstAmountTootipLimit : translations.confirmationMinDstAmountTootipMarket}>
                      {translations.minReceivedPerTrade}:
                    </Components.Label>
                    <TwapStyles.StyledRowFlex justifyContent="flex-end">
                      <Components.TokenName name={twapStore.dstToken?.symbol} />
                      <Components.TokenLogo logo={twapStore.dstToken?.logoUrl} />
                      <AdapterStyles.Text>
                        {twapStore.isLimitOrder ? (
                          <Components.Tooltip text={twapStore.getDstMinAmountOutUi()}>
                            <Components.NumberDisplay value={twapStore.getDstMinAmountOutUi()} />
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
            </TwapStyles.StyledColumnFlex>
            <TwapStyles.StyledColumnFlex gap={12}>
              <Box style={{ display: "flex", gap: 5 }}>
                <Components.SmallLabel>{translations.acceptDisclaimer}</Components.SmallLabel>
                <AdapterStyles.StyledSwitch value={twapStore.disclaimerAccepted} onChange={() => twapStore.setDisclaimerAccepted(!twapStore.disclaimerAccepted)} />
              </Box>
              <AdapterStyles.Text className="output-text">{translations.outputWillBeSentTo}</AdapterStyles.Text>
              <AdapterStyles.Text className="output-text">{twapStore.lib?.maker}</AdapterStyles.Text>
              <SubmitButton />
            </TwapStyles.StyledColumnFlex>
          </TwapStyles.StyledColumnFlex>
        </AdapterStyles.StyledOrderConfirmation>
      </AdapterStyles.StyledTradeInfoModal>
    </>
  );
};

const TradeInfoDetailsDisplay = () => {
  return (
    <AdapterStyles.StyledCard>
      <TwapStyles.StyledColumnFlex gap={10}>
        <Components.Disclaimer />
      </TwapStyles.StyledColumnFlex>
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
          <AdapterStyles.Text>{translations.none}</AdapterStyles.Text>
        )}
      </TwapStyles.StyledRowFlex>
    </AdapterStyles.StyledLimitPrice>
  );
};

const TokenOrderPreview = ({
  isLimitOrder,
  token,
  title,
  usdPrice,
  amount,
  isSrc,
}: {
  isLimitOrder?: boolean;
  token?: TokenData;
  name?: string;
  title: string;
  usdPrice?: string;
  amount?: string;
  isSrc?: boolean;
}) => {
  return (
    <AdapterStyles.StyledTokenOrder>
      <AdapterStyles.StyledCard>
        <TwapStyles.StyledColumnFlex gap={10}>
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
        </TwapStyles.StyledColumnFlex>
      </AdapterStyles.StyledCard>
    </AdapterStyles.StyledTokenOrder>
  );
};
