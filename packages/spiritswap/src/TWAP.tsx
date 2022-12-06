import { GlobalStyles } from "@mui/material";
import { Box } from "@mui/system";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles } from "@orbs-network/twap-ui";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { memo, ReactNode, useCallback } from "react";
import * as AdapterStyles from "./styles";
import { Configs } from "@orbs-network/twap";
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
  );
};

export default memo(TWAP);

const MarketPrice = () => {
  const { toggleInverted, leftToken, rightToken, marketPrice, ready } = hooks.useMarketPrice();
  const translations = useTwapContext().translations;
  return (
    <AdapterStyles.StyledMarketPrice>
      <AdapterStyles.StyledCard>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <AdapterStyles.Text className="title">{translations.currentMarketPrice}</AdapterStyles.Text>
          {ready ? (
            <Components.TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={marketPrice} toggleInverted={toggleInverted} />
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
  const { chunksAmount, onTotalChunksChange, totalChunks, token, usdValue, usdLoading, maxPossibleChunks, ready } = hooks.useChunks();
  const translations = useTwapContext().translations;

  return (
    <AdapterStyles.StyledTrade>
      <AdapterStyles.StyledCard>
        <TwapStyles.StyledColumnFlex>
          <AdapterStyles.StyledSliderContainer gap={10}>
            <Components.Label tooltipText={translations.totalTradesTooltip}>{translations.totalTrades}</Components.Label>
            {ready ? (
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
  const { maxDuration, onChange } = hooks.useMaxDuration();
  const translations = useTwapContext().translations;

  return (
    <AdapterStyles.StyledCard>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Label tooltipText={translations.maxDurationTooltip}>{translations.maxDuration}</Components.Label>
        <Components.TimeSelector value={maxDuration} onChange={onChange} />
      </TwapStyles.StyledRowFlex>
    </AdapterStyles.StyledCard>
  );
};

const TradeInterval = () => {
  const { fillDelay, customFillDelayEnabled, onChange, onCustomFillDelayClick } = hooks.useFillDelay();
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
                <AdapterStyles.StyledNumbericInput prefix={amountPrefix} loading={false} disabled={disabled} placeholder="0" onChange={onChange || (() => {})} value={value} />
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

const OrderConfirmation = () => {
  const {
    srcToken,
    dstToken,
    srcUsd,
    srcChunkAmount,
    deadline,
    fillDelay,
    totalChunks,
    minAmountOut,
    srcAmount,
    dstUsd,
    dstAmount,
    isLimitOrder,
    showConfirmation,
    closeConfirmation,
    disclaimerAccepted,
    setDisclaimerAccepted,
    maker,
  } = hooks.useOrderSummary();
  const translations = useTwapContext().translations;

  return (
    <>
      <AdapterStyles.StyledTradeInfoModal open={showConfirmation} onClose={closeConfirmation}>
        <AdapterStyles.StyledOrderConfirmation>
          <TwapStyles.StyledColumnFlex gap={20}>
            <TwapStyles.StyledColumnFlex gap={20}>
              <TokenOrderPreview
                isSrc={true}
                isLimitOrder={isLimitOrder}
                title={translations.from}
                amount={srcAmount}
                usdPrice={srcUsd}
                name={srcToken?.symbol}
                logo={srcToken?.logoUrl}
              />
              <TokenOrderPreview isLimitOrder={isLimitOrder} title={translations.to} amount={dstAmount} usdPrice={dstUsd} name={dstToken?.symbol} logo={dstToken?.logoUrl} />
              <OrderConfirmationLimitPrice />

              <AdapterStyles.StyledCard className="twap-order-summary">
                <TwapStyles.StyledColumnFlex gap={12}>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationDeadlineTooltip}>{translations.expiration}</Components.Label>
                    <AdapterStyles.Text>{deadline}</AdapterStyles.Text>
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
                        <Components.Tooltip text={srcChunkAmount}>
                          <Components.NumberDisplay value={srcChunkAmount} />
                        </Components.Tooltip>
                      </AdapterStyles.Text>
                    </TwapStyles.StyledRowFlex>
                  </TwapStyles.StyledRowFlex>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationTotalTradesTooltip}>{translations.totalTrades}</Components.Label>
                    <AdapterStyles.Text>{totalChunks}</AdapterStyles.Text>
                  </TwapStyles.StyledRowFlex>
                  <TwapStyles.StyledRowFlex justifyContent="space-between">
                    <Components.Label tooltipText={translations.confirmationtradeIntervalTooltip}>{translations.tradeInterval}</Components.Label>
                    <AdapterStyles.Text>{fillDelay}</AdapterStyles.Text>
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
                          <Components.Tooltip text={minAmountOut}>
                            <Components.NumberDisplay value={minAmountOut} />
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
                <AdapterStyles.StyledSwitch value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
              </Box>
              <AdapterStyles.Text className="output-text">{translations.outputWillBeSentTo}</AdapterStyles.Text>
              <AdapterStyles.Text className="output-text">{maker}</AdapterStyles.Text>
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
    <AdapterStyles.StyledTokenOrder>
      <AdapterStyles.StyledCard>
        <TwapStyles.StyledColumnFlex gap={10}>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Label>{title}</Components.Label>
            <AdapterStyles.StyledUSD value={usdPrice} />
          </TwapStyles.StyledRowFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <TokenDisplay name={name} logo={logo} />
            <AdapterStyles.StyledTokenOrderPreviewAmount>
              {!isSrc && <> {isLimitOrder ? "≥ " : "~ "}</>} <Components.NumberDisplay value={amount} />
            </AdapterStyles.StyledTokenOrderPreviewAmount>
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </AdapterStyles.StyledCard>
    </AdapterStyles.StyledTokenOrder>
  );
};
