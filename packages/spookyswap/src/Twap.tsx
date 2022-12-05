import { GlobalStyles } from "@mui/material";
import { Box, styled } from "@mui/system";
import { Components, hooks, TwapAdapter, useTwapContext, Translations } from "@orbs-network/twap-ui";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { memo, ReactNode, useCallback } from "react";
import translations from "./i18n/en.json";

import {
  globalStyle,
  StyledBalance,
  StyledButton,
  StyledCard,
  StyledChangeOrder,
  StyledColumnGap,
  StyledDstToken,
  StyledFlexBetween,
  StyledFlexStart,
  StyledIcon,
  StyledIntervalTimeSelect,
  StyledLimitPrice,
  StyledMarketPrice,
  StyledNumbericInput,
  StyledOrderConfirmation,
  StyledPanelLabel,
  StyledPercentBtn,
  StyledPrice,
  StyledSlider,
  StyledSliderContainer,
  StyledSrcTokenPercentSelector,
  StyledSwitch,
  StyledTokenDisplay,
  StyledTokenOrder,
  StyledTokenPanel,
  StyledTokenSelect,
  StyledTotalTradesInput,
  StyledTrade,
  StyledTradeInfoModal,
  StyledTradeSize,
  StyledUSD,
} from "./styles";
import { Configs, TokenData } from "@orbs-network/twap";
import { AdapterContextProvider, parseToken, useAdapterContext, useGetProvider, useParseTokenList, usePrepareAdapterContextProps, useTokensFromDapp } from "./hooks";
import { SpookySwapTWAPProps } from ".";

const TWAP = (props: SpookySwapTWAPProps) => {
  const tokenList = useParseTokenList(props.getTokenImage, props.dappTokens);
  useTokensFromDapp(props.srcToken, props.dstToken,  props.account ? tokenList : undefined);
  const provider = useGetProvider(props.getProvider, props.account);
  const adapterContextProps = usePrepareAdapterContextProps(props);

  const connect = useCallback(() => {
    props.connect();
  }, []);

  return (
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
      <GlobalStyles styles={globalStyle as any} />
      <AdapterContextProvider value={adapterContextProps}>
        <div className="twap-container" style={{ flexDirection: "column", width: "100%" }}>
          <SrcTokenPanel />
          <ChangeTokensOrder />
          <DstTokenPanel />
          <LimitPriceDisplay />
          <TradeSize />
          <MaxDuration />
          <TradeInterval />
          <PlaceOrderButton />
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
    <StyledMarketPrice>
      <StyledCard>
        <StyledFlexBetween>
          <Components.Text className="title">{translations.currentMarketPrice}</Components.Text>
          {ready ? (
            <Components.TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={marketPrice} toggleInverted={toggleInverted} />
          ) : (
            <Components.Text>-</Components.Text>
          )}
        </StyledFlexBetween>
      </StyledCard>
    </StyledMarketPrice>
  );
};

const SrcTokenPercentSelector = () => {
  const { onPercentClick } = hooks.useCustomActions();
  const translations = useTwapContext().translations;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledSrcTokenPercentSelector>
      <StyledPercentBtn onClick={() => onClick(0.5)}>50%</StyledPercentBtn>
      <StyledPercentBtn onClick={() => onClick(1)}>{translations.max}</StyledPercentBtn>
    </StyledSrcTokenPercentSelector>
  );
};

const SrcTokenPanel = () => (
  <TokenPanel isSrcToken={true}>
    <SrcTokenPercentSelector />
  </TokenPanel>
);

const DstTokenPanel = () => (
  <StyledDstToken>
    <TokenPanel isSrcToken={false} />
    <MarketPrice />
  </StyledDstToken>
);

const ChangeTokensOrder = () => {
  const switchTokens = hooks.useSwitchTokens();
  return (
    <StyledChangeOrder>
      <Components.IconButton onClick={switchTokens}>
        <StyledIcon icon={<HiOutlineSwitchVertical />} />
      </Components.IconButton>
    </StyledChangeOrder>
  );
};

const TradeSize = () => {
  const { chunksAmount, onTotalChunksChange, totalChunks, token, usdValue, usdLoading, maxPossibleChunks, ready } = hooks.useChunks();
  const translations = useTwapContext().translations;

  return (
    <StyledTrade>
      <StyledCard>
        <StyledColumnGap>
          <StyledSliderContainer gap={10}>
            <Components.Label tooltipText={translations.totalTradesTooltip}>{translations.totalTrades}</Components.Label>
            {ready ? (
              <>
                <StyledSlider>
                  <Components.Slider maxTrades={maxPossibleChunks} value={totalChunks} onChange={onTotalChunksChange} />
                </StyledSlider>
                <Components.Tooltip text={translations.sliderMinSizeTooltip}>
                  <StyledTotalTradesInput
                    placeholder="0"
                    value={totalChunks}
                    decimalScale={0}
                    maxValue={maxPossibleChunks.toString()}
                    onChange={(value) => onTotalChunksChange(Number(value))}
                  />
                </Components.Tooltip>
              </>
            ) : (
              <Components.Text>-</Components.Text>
            )}
          </StyledSliderContainer>
          <StyledFlexBetween>
            <StyledTradeSize>
              <Components.Label fontSize={14} tooltipText={translations.tradeSizeTooltip}>
                {translations.tradeSize}: <Components.NumberDisplay value={chunksAmount} />
              </Components.Label>
              {token && <TokenDisplay logo={token?.logoUrl} name={token?.symbol} />}
            </StyledTradeSize>
            <StyledUSD value={usdValue} isLoading={usdLoading} />
          </StyledFlexBetween>
        </StyledColumnGap>
      </StyledCard>
    </StyledTrade>
  );
};

const LimitPriceDisplay = () => {
  const { isLimitOrder, onToggleLimit, onChange, limitPrice, leftToken, rightToken, toggleInverted, warning } = hooks.useLimitPrice();
  const isLoading = false;
  const translations = useTwapContext().translations;

  return (
    <StyledPrice>
      <StyledCard>
        <StyledColumnGap>
          <StyledFlexStart>
            <Components.Tooltip text={warning}>
              {isLoading ? <Components.Loader width={50} /> : <StyledSwitch disabled={!!warning} value={isLimitOrder} onChange={onToggleLimit} />}
            </Components.Tooltip>
            <Components.Label tooltipText={isLimitOrder ? translations.limitPriceTooltip : translations.marketPriceTooltip}>{translations.limitPrice}</Components.Label>
          </StyledFlexStart>
          {isLimitOrder && (
            <Components.LimitPrice onChange={onChange} toggleInverted={toggleInverted} price={limitPrice} leftToken={leftToken} rightToken={rightToken} placeholder="0" />
          )}
        </StyledColumnGap>
      </StyledCard>
    </StyledPrice>
  );
};

const MaxDuration = () => {
  const { maxDuration, onChange } = hooks.useMaxDuration();
  const translations = useTwapContext().translations;

  return (
    <StyledCard>
      <StyledFlexBetween gap={10}>
        <Components.Label tooltipText={translations.maxDurationTooltip}>{translations.maxDuration}</Components.Label>
        <Components.TimeSelector value={maxDuration} onChange={onChange} />
      </StyledFlexBetween>
    </StyledCard>
  );
};

const TradeInterval = () => {
  const { fillDelay, customFillDelayEnabled, onChange, onCustomFillDelayClick } = hooks.useFillDelay();
  const translations = useTwapContext().translations;

  return (
    <StyledCard>
      <StyledFlexBetween gap={10}>
        <Components.Label tooltipText={translations.tradeIntervalTootlip}>{translations.tradeInterval}</Components.Label>
        <StyledIntervalTimeSelect>
          <Components.TimeSelector disabled={!customFillDelayEnabled} onChange={onChange} value={fillDelay} />
        </StyledIntervalTimeSelect>
        {!customFillDelayEnabled && (
          <Components.IconButton tooltip={translations.customIntervalTooltip} onClick={onCustomFillDelayClick}>
            <StyledIcon icon={<AiFillEdit />} />
          </Components.IconButton>
        )}
      </StyledFlexBetween>
    </StyledCard>
  );
};

const TokenDisplay = ({ logo, name }: { logo?: string; name?: string }) => {
  return (
    <StyledTokenDisplay className="token-display">
      <Components.TokenLogo logo={logo} />
      <Components.TokenName name={name} />
    </StyledTokenDisplay>
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
    connectedChainId,
    usdLoading,
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
        <TokenSelectModal
          chainId={connectedChainId}
          commonTokens={[]}
          tokenSelected={undefined}
          onSelect={onTokenSelected}
          isOpen={tokenListOpen}
          onClose={() => toggleTokenList(false)}
        />
      )}
      <StyledTokenPanel>
        <StyledCard>
          <StyledColumnGap>
            <StyledFlexBetween>
              <StyledPanelLabel>{isSrcToken ? "From" : "To (estimated)"}</StyledPanelLabel>
              {children}
            </StyledFlexBetween>
            <StyledFlexBetween gap={20}>
              <Components.Tooltip text={selectTokenWarning}>
                <StyledTokenSelect onClick={onOpen}>
                  <TokenDisplay logo={logo} name={symbol} />
                  <StyledIcon icon={<IoIosArrowDown size={20} />} />
                </StyledTokenSelect>
              </Components.Tooltip>
              <Components.Tooltip text={inputWarning}>
                <StyledNumbericInput prefix={amountPrefix} loading={false} disabled={disabled} placeholder="0.0" onChange={onChange || (() => {})} value={value} />
              </Components.Tooltip>
            </StyledFlexBetween>
            <StyledUSD value={usdValue} isLoading={usdLoading} />
            <Balance isLoading={balanceLoading} balance={balance} />
          </StyledColumnGap>
        </StyledCard>
      </StyledTokenPanel>
    </>
  );
};

const Balance = ({ isLoading, balance = "0" }: { isLoading: boolean; balance: string }) => {
  const translations = useTwapContext().translations;

  return (
    <StyledBalance>
      <Components.Text>{translations.balance}</Components.Text>
      {balance && (
        <Components.SmallLabel loading={isLoading}>
          <Components.NumberDisplay value={balance} />
        </Components.SmallLabel>
      )}
    </StyledBalance>
  );
};

const PlaceOrderButton = () => {
  const { loading, text, onClick, disabled } = hooks.useShowConfirmationButton();
  return (
    <StyledButton loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
      {text}
    </StyledButton>
  );
};

const OrderConfirmation = () => {
  const { srcToken, dstToken, srcUsd, srcAmount, dstUsd, dstAmount, isLimitOrder, showConfirmation, closeConfirmation, disclaimerAccepted, setDisclaimerAccepted, maker } =
    hooks.useOrderOverview();
  const { loading, text, onClick, disabled } = hooks.useCreateOrderButton();
  const translations = useTwapContext().translations;

  return (
    <>
      <StyledTradeInfoModal open={showConfirmation} onClose={closeConfirmation}>
        <StyledOrderConfirmation>
          <StyledColumnGap gap={20}>
            <StyledColumnGap gap={20}>
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

              <StyledCard>
                <StyledColumnGap className="trade-info-explanation" gap={20}>
                  <Components.ConfirmationExpiration />
                  <Components.ConfirmationOrderType />
                  <Components.ConfirmationTradeSize />
                  <Components.ConfirmationTotalTrades />
                  <Components.ConfirmationTradeInterval />
                  <Components.ConfirmationMinimumReceived />
                </StyledColumnGap>
              </StyledCard>
              <TradeInfoDetailsDisplay />
            </StyledColumnGap>
            <StyledColumnGap gap={12}>
              <Box style={{ display: "flex", gap: 5 }}>
                <Components.SmallLabel>{translations.acceptDisclaimer}</Components.SmallLabel>
                <StyledSwitch value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
              </Box>
              <Components.Text className="output-text">{translations.outputWillBeSentTo}</Components.Text>
              <Components.Text className="output-text">{maker}</Components.Text>
              <StyledButton loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
                {text}
              </StyledButton>
            </StyledColumnGap>
          </StyledColumnGap>
        </StyledOrderConfirmation>
      </StyledTradeInfoModal>
    </>
  );
};

const TradeInfoDetailsDisplay = () => {
  return (
    <StyledCard>
      <StyledColumnGap gap={10}>
        <Components.TradeInfoExplanation />
      </StyledColumnGap>
    </StyledCard>
  );
};

const OrderConfirmationLimitPrice = () => {
  const { isLimitOrder, toggleInverted, limitPrice, leftToken, rightToken } = hooks.useLimitPrice();
  const translations = useTwapContext().translations;

  return (
    <StyledLimitPrice>
      <StyledFlexBetween>
        <Components.Label tooltipText={translations.confirmationLimitPriceTooltip}>{translations.limitPrice}</Components.Label>
        {isLimitOrder ? (
          <Components.TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={limitPrice} toggleInverted={toggleInverted} />
        ) : (
          <Components.Text>{translations.none}</Components.Text>
        )}
      </StyledFlexBetween>
    </StyledLimitPrice>
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
    <StyledTokenOrder>
      <StyledCard>
        <StyledColumnGap gap={10}>
          <StyledFlexBetween>
            <Components.Label>{title}</Components.Label>
            <StyledUSD value={usdPrice} />
          </StyledFlexBetween>
          <StyledFlexBetween>
            <TokenDisplay name={name} logo={logo} />
            <StyledTokenOrderPreviewAmount>
              {!isSrc && <> {isLimitOrder ? "≥ " : "~ "}</>} <Components.NumberDisplay value={amount} />
            </StyledTokenOrderPreviewAmount>
          </StyledFlexBetween>
        </StyledColumnGap>
      </StyledCard>
    </StyledTokenOrder>
  );
};

const StyledTokenOrderPreviewAmount = styled(Components.SmallLabel)({
  fontSize: 19,
});
