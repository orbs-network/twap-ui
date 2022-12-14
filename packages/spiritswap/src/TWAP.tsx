import { GlobalStyles } from "@mui/material";
import { Box } from "@mui/system";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, store } from "@orbs-network/twap-ui";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { memo, ReactNode, useCallback, useState } from "react";
import * as AdapterStyles from "./styles";
import { Configs, TokenData } from "@orbs-network/twap";
import {
  AdapterContextProvider,
  parseToken,
  useAdapterContext,
  useGetProvider,
  useGlobalStyles,
  useParseTokenList,
  usePrepareAdapterContextProps,
  useSetTokensFromDapp,
} from "./hooks";
import translations from "./i18n/en.json";
import { SpiritSwapTWAPProps } from ".";

const TWAP = (props: SpiritSwapTWAPProps) => {
  const { getTokenImage, dappTokens } = props;
  const tokenList = useParseTokenList(getTokenImage, dappTokens);
  useSetTokensFromDapp(props.srcToken, props.dstToken, props.account ? tokenList : undefined);
  const provider = useGetProvider(props.getProvider, props.account);
  const adapterContextProps = usePrepareAdapterContextProps(props);
  const globalStyles = useGlobalStyles();

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
      <GlobalStyles styles={globalStyles} />
      <AdapterContextProvider value={adapterContextProps}>
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
  const { toggleInverted, leftToken, rightToken, marketPrice, loading } = hooks.useMarketPrice();
  const translations = useTwapContext().translations;
  return (
    <Box className="twap-market-price">
      <Components.Card>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <AdapterStyles.Text className="title">{translations.currentMarketPrice}</AdapterStyles.Text>
          <Components.TokenPriceCompare loading={loading} leftToken={leftToken} rightToken={rightToken} price={marketPrice} toggleInverted={toggleInverted} />
        </TwapStyles.StyledRowFlex>
      </Components.Card>
    </Box>
  );
};

const SrcTokenPercentSelector = () => {
  const { onPercentClick } = hooks.useCustomActions();
  const translations = useTwapContext().translations;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <AdapterStyles.StyledPercentSelector>
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
        {translations.max}
      </button>
    </AdapterStyles.StyledPercentSelector>
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
    <Box style={{ width: "100%" }}>
      <TokenPanel isSrcToken={false} />
      <MarketPrice />
    </Box>
  );
};

const ChangeTokensOrder = () => {
  const switchTokens = hooks.useSwitchTokens();
  return (
    <AdapterStyles.StyledChangeOrder>
      <Components.IconButton onClick={switchTokens}>
        <Components.Icon icon={<HiOutlineSwitchVertical />} />
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
      <Components.Card>
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
            <Components.USD value={usdValue} isLoading={usdLoading} />
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </Components.Card>
    </AdapterStyles.StyledTrade>
  );
};

const LimitPriceDisplay = () => {
  const { isLimitOrder, onToggleLimit, onChange, limitPrice, leftToken, rightToken, toggleInverted, warning, isLoading } = hooks.useLimitPrice();
  const translations = useTwapContext().translations;

  return (
    <Box className="twap-limit-price">
      <Components.Card>
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
    </Box>
  );
};

const MaxDuration = () => {
  const duration = store.useTwapStore((store) => store.duration);
  const onChange = store.useTwapStore((store) => store.setDuration);

  const translations = useTwapContext().translations;

  return (
    <Components.Card>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Label tooltipText={translations.maxDurationTooltip}>{translations.maxDuration}</Components.Label>
        <Components.TimeSelector value={duration} onChange={onChange} />
      </TwapStyles.StyledRowFlex>
    </Components.Card>
  );
};

const TradeInterval = () => {
  const fillDelay = store.useTwapStore((state) => state.getFillDelay());
  const customFillDelayEnabled = store.useTwapStore((state) => state.customFillDelayEnabled);
  const onChange = store.useTwapStore((state) => state.setFillDelay);
  const onCustomFillDelayClick = store.useTwapStore((state) => state.setCustomFillDelayEnabled);

  const translations = useTwapContext().translations;

  return (
    <Components.Card>
      <TwapStyles.StyledRowFlex justifyContent="space-between" gap={10}>
        <Components.Label tooltipText={translations.tradeIntervalTootlip}>{translations.tradeInterval}</Components.Label>
        <AdapterStyles.StyledIntervalTimeSelect>
          <Components.TimeSelector disabled={!customFillDelayEnabled} onChange={onChange} value={fillDelay} />
        </AdapterStyles.StyledIntervalTimeSelect>
        {!customFillDelayEnabled && (
          <Components.IconButton tooltip={translations.customIntervalTooltip} onClick={onCustomFillDelayClick}>
            <Components.Icon icon={<AiFillEdit />} />
          </Components.IconButton>
        )}
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
  isSrcToken?: boolean;
}

const TokenPanel = ({ children, isSrcToken }: TokenPanelProps) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const {
    token,
    onTokenSelect,
    inputWarning,
    amountPrefix,
    disabled,
    selectTokenWarning,
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
    if (!selectTokenWarning) setTokenListOpen(true);
  };

  const onTokenSelected = useCallback(
    (token: any) => {
      setTokenListOpen(false);
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
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelectModal tokenSelected={undefined} onSelect={onTokenSelected} isOpen={tokenListOpen} onClose={onListClose} />
      <AdapterStyles.StyledTokenPanel>
        <Components.Card>
          <TwapStyles.StyledColumnFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.Tooltip text={inputWarning}>
                <Components.NumericInput
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
                <button onClick={onOpen} className="twap-token-select">
                  <TokenDisplay logo={token?.logoUrl} name={token?.symbol} />
                  <Components.Icon icon={<IoIosArrowDown size={20} />} />
                </button>
              </Components.Tooltip>
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.USD value={usdValue} isLoading={usdLoading} />
              <Components.Balance isLoading={balanceLoading} value={balance} />
            </TwapStyles.StyledRowFlex>
            {children}
          </TwapStyles.StyledColumnFlex>
        </Components.Card>
      </AdapterStyles.StyledTokenPanel>
    </>
  );
};

const SubmitButton = () => {
  const { loading, text, onClick, disabled } = hooks.useSubmitButton();
  return (
    <Components.Button loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
      {text}
    </Components.Button>
  );
};

const OrderSummary = () => {
  const twapStore = store.useTwapStore();
  const translations = useTwapContext().translations;

  return (
    <>
      <Components.Modal open={twapStore.showConfirmation} onClose={() => twapStore.setShowConfirmation(false)}>
        <AdapterStyles.StyledOrderConfirmation className="twap-order-summary">
          <TwapStyles.StyledColumnFlex gap={15}>
            <TwapStyles.StyledColumnFlex gap={15}>
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

              <Components.Card className="twap-order-summary-rows">
                <TwapStyles.StyledColumnFlex gap={12}>
                  <SummaryRow tooltip={translations.confirmationDeadlineTooltip} label={translations.expiration}>
                    <AdapterStyles.Text>{twapStore.getDeadlineUi()}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationOrderType} label={translations.orderType}>
                    <AdapterStyles.Text>{twapStore.isLimitOrder ? translations.limitOrder : translations.marketOrder}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationTradeSizeTooltip} label={translations.tradeSize}>
                    <TwapStyles.StyledRowFlex justifyContent="flex-end">
                      <Components.TokenName name={twapStore.srcToken?.symbol} />
                      <Components.TokenLogo logo={twapStore.srcToken?.logoUrl} />
                      <AdapterStyles.Text>
                        <Components.NumberDisplay value={twapStore.getSrcChunkAmountUi()} />
                      </AdapterStyles.Text>
                    </TwapStyles.StyledRowFlex>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationTotalTradesTooltip} label={translations.totalTrades}>
                    <AdapterStyles.Text>{twapStore.chunks}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationtradeIntervalTooltip} label={translations.tradeInterval}>
                    <AdapterStyles.Text>{twapStore.getFillDelayUi(translations)}</AdapterStyles.Text>
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
                <Box style={{ display: "flex", gap: 5 }}>
                  <Components.SmallLabel>{translations.acceptDisclaimer}</Components.SmallLabel>
                  <Components.Switch value={twapStore.disclaimerAccepted} onChange={() => twapStore.setDisclaimerAccepted(!twapStore.disclaimerAccepted)} />
                </Box>
                <AdapterStyles.Text className="output-text">{translations.outputWillBeSentTo}</AdapterStyles.Text>
                <AdapterStyles.Text className="output-text">{twapStore.lib?.maker}</AdapterStyles.Text>
              </TwapStyles.StyledColumnFlex>
            </Components.Card>
            <SubmitButton />
          </TwapStyles.StyledColumnFlex>
        </AdapterStyles.StyledOrderConfirmation>
      </Components.Modal>
    </>
  );
};

const SummaryRow = ({ label, tooltip, children }: { label: string; tooltip: string; children: ReactNode }) => {
  return (
    <AdapterStyles.StyledSummaryRow>
      <Components.Label placement="right" tooltipText={tooltip}>
        {label}
      </Components.Label>
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
      <Components.Card>
        <TwapStyles.StyledColumnFlex gap={10}>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Label>{title}</Components.Label>
            <Components.USD value={usdPrice} />
          </TwapStyles.StyledRowFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <TokenDisplay name={token?.symbol} logo={token?.logoUrl} />
            <AdapterStyles.StyledTokenOrderPreviewAmount>
              {!isSrc && <> {isLimitOrder ? "≥ " : "~ "}</>} <Components.NumberDisplay value={amount} decimalScale={token?.decimals} />
            </AdapterStyles.StyledTokenOrderPreviewAmount>
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </Components.Card>
    </AdapterStyles.StyledTokenOrder>
  );
};
