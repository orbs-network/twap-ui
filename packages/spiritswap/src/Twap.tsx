import { GlobalStyles } from "@mui/material";
import { Box } from "@mui/system";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import TWAPLib from "@orbs-network/twap-ui";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { TbArrowsRightLeft } from "react-icons/tb";
import { memo, ReactNode } from "react";
import translations from "./i18n/en.json";

import {
  globalStyle,
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
  StyledMarketPriceRight,
  StyledNumbericInput,
  StyledOrderConfirmation,
  StyledPercentBtn,
  StyledPrice,
  StyledSlider,
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
import { ProviderWrapper, queryClient, TwapProps } from ".";

// TODO create file for styles
const { PoweredBy, Balance, Loader, Slider, NumberDisplay, TimeSelector, Label, TokenLogo, TokenName, SmallLabel, Switch, Text, IconButton, Tooltip } = TWAPLib.baseComponents;
const PriceToggle = TWAPLib.baseComponents.PriceToggle;

const {
  LimitPrice,
  TradeInfoExplanation,
  ConfirmationExpiration,
  ConfirmationOrderType,
  ConfirmationTradeSize,
  ConfirmationTotalTrades,
  ConfirmationTradeInterval,
  ConfirmationMinimumReceived,
} = TWAPLib.components;

const TWAP = (props: TwapProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProviderWrapper {...props}>
        <GlobalStyles styles={globalStyle as any} />
        <div className="twap-container" style={{ flexDirection: "column" }}>
          <SrcTokenPanel />
          <ChangeTokensOrder />
          <DstTokenPanel />
          <LimitPriceDisplay />
          <TradeSize />
          <MaxDuration />
          <TradeInterval />
          <SubmitButton />
          <OrderConfirmation />
          <PoweredBy />
        </div>
      </ProviderWrapper>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
};

export default memo(TWAP);

const MarketPrice = () => {
  const { toggleInverted, leftTokenInfo, rightTokenInfo, marketPrice } = TWAPLib.store.useMarketPrice();

  return (
    <StyledMarketPrice>
      <StyledCard>
        <StyledFlexBetween>
          <Text className="title">{translations.currentMarketPrice}</Text>
          {marketPrice ? (
            <StyledMarketPriceRight>
              <Text>1</Text>
              <TokenDisplay logo={leftTokenInfo?.logoUrl} name={leftTokenInfo?.symbol} />
              <Tooltip text={marketPrice?.toString()}>
                <Text>
                  = <NumberDisplay value={marketPrice?.toString()} decimalScale={3} />
                </Text>
              </Tooltip>

              <TokenDisplay logo={rightTokenInfo?.logoUrl} name={rightTokenInfo?.symbol} />
              <IconButton onClick={toggleInverted}>
                <StyledIcon icon={<TbArrowsRightLeft />} />
              </IconButton>
            </StyledMarketPriceRight>
          ) : (
            <Label>-</Label>
          )}
        </StyledFlexBetween>
      </StyledCard>
    </StyledMarketPrice>
  );
};

const SrcTokenPercentSelector = () => {
  const { onChangePercent } = TWAPLib.store.useActionHandlers();

  const onClick = (value: number) => {
    onChangePercent(value);
  };

  return (
    <StyledSrcTokenPercentSelector>
      <StyledPercentBtn onClick={() => onClick(0.25)}>25%</StyledPercentBtn>
      <StyledPercentBtn onClick={() => onClick(0.5)}>50%</StyledPercentBtn>
      <StyledPercentBtn onClick={() => onClick(0.75)}>75%</StyledPercentBtn>
      <StyledPercentBtn onClick={() => onClick(1)}>{translations.max}</StyledPercentBtn>
    </StyledSrcTokenPercentSelector>
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
    <StyledDstToken>
      <TokenPanel isSrcToken={false} />
      <MarketPrice />
    </StyledDstToken>
  );
};

const ChangeTokensOrder = () => {
  const onChangeTokenPositions = TWAPLib.store.useChangeTokenPositions();
  return (
    <StyledChangeOrder>
      <IconButton onClick={onChangeTokenPositions}>
        <StyledIcon icon={<HiOutlineSwitchVertical />} />
      </IconButton>
    </StyledChangeOrder>
  );
};

const TradeSize = () => {
  const { uiTradeSize, onTradeSizeChange, totalTrades, uiUsdValue, usdPriceLoading, logoUrl, symbol, maxTrades } = TWAPLib.store.useTradeSize();

  return (
    <StyledTrade>
      <StyledCard>
        <StyledColumnGap>
          <StyledFlexBetween gap={10}>
            <Label tooltipText={translations.totalTradesTooltip}>{translations.totalTrades}</Label>
            <StyledSlider>
              <Slider maxTrades={maxTrades} value={totalTrades} onChange={onTradeSizeChange} />
            </StyledSlider>
            <StyledTotalTradesInput placeholder="0" value={totalTrades} decimalScale={0} maxValue={maxTrades.toString()} onChange={(value) => onTradeSizeChange(Number(value))} />
          </StyledFlexBetween>
          <StyledFlexBetween>
            <StyledTradeSize>
              <Label fontSize={14} tooltipText={translations.tradeSizeTooltip}>
                {translations.tradeSize}: <NumberDisplay value={uiTradeSize} decimalScale={4} />
              </Label>
              {symbol && <TokenDisplay logo={logoUrl} name={symbol} />}
            </StyledTradeSize>
            <StyledUSD value={uiUsdValue} isLoading={usdPriceLoading} />
          </StyledFlexBetween>
        </StyledColumnGap>
      </StyledCard>
    </StyledTrade>
  );
};

const LimitPriceDisplay = () => {
  const { isLimitOrder, onToggleLimit, onChange, limitPriceUI, leftTokenInfo, rightTokenInfo, toggleInverted, warning, isLoading } = TWAPLib.store.useLimitPrice();

  return (
    <StyledPrice>
      <StyledCard>
        <StyledColumnGap>
          <StyledFlexStart>
            <Tooltip text={warning}>{isLoading ? <Loader width={50} /> : <StyledSwitch disabled={!!warning} value={isLimitOrder} onChange={onToggleLimit} />}</Tooltip>
            <Label tooltipText={isLimitOrder ? translations.limitPriceTooltip : translations.marketPriceTooltip}>{translations.limitPrice}</Label>
          </StyledFlexStart>
          {isLimitOrder && (
            <LimitPrice
              onChange={onChange}
              toggleInverted={toggleInverted}
              limitPriceUI={limitPriceUI}
              leftTokenInfo={leftTokenInfo}
              rightTokenInfo={rightTokenInfo}
              placeholder="0"
            />
          )}
        </StyledColumnGap>
      </StyledCard>
    </StyledPrice>
  );
};

const MaxDuration = () => {
  const { onMaxDurationChange } = TWAPLib.store.useMaxDuration();
  const { maxDurationMillis, maxDurationTimeFormat } = TWAPLib.store.useMaxDuration();

  return (
    <StyledCard>
      <StyledFlexBetween gap={10}>
        <Label tooltipText={translations.maxDurationTooltip}>{translations.maxDuration}</Label>
        <TimeSelector millis={maxDurationMillis} selectedTimeFormat={maxDurationTimeFormat} onChange={onMaxDurationChange} />
      </StyledFlexBetween>
    </StyledCard>
  );
};

const TradeInterval = () => {
  const { tradeIntervalMillis, tradeIntervalTimeFormat, customInterval, onTradeIntervalChange, onCustomIntervalClick } = TWAPLib.store.useTradeInterval();

  return (
    <StyledCard>
      <StyledFlexBetween gap={10}>
        <Label tooltipText={translations.tradeIntervalTootlip}>{translations.tradeInterval}</Label>
        <StyledIntervalTimeSelect>
          <TimeSelector disabled={!customInterval} onChange={onTradeIntervalChange} millis={tradeIntervalMillis} selectedTimeFormat={tradeIntervalTimeFormat} />
        </StyledIntervalTimeSelect>
        {!customInterval && (
          <IconButton tooltip={translations.customIntervalTooltip} onClick={onCustomIntervalClick}>
            <StyledIcon icon={<AiFillEdit />} />
          </IconButton>
        )}
      </StyledFlexBetween>
    </StyledCard>
  );
};

const TokenDisplay = ({ logo, name }: { logo?: string; name?: string }) => {
  return (
    <StyledTokenDisplay className="token-display">
      <TokenLogo logo={logo} />
      <TokenName name={name} />
    </StyledTokenDisplay>
  );
};

interface TokenPanelProps {
  children?: ReactNode;
  isSrcToken?: boolean;
}

const TokenPanel = ({ children, isSrcToken }: TokenPanelProps) => {
  const {
    inputWarningTooltip,
    tokenSeletWarningTooltip,
    amountPrefix,
    usdValueLoading,
    usdValue,
    disabled,
    balanceLoading,
    balance,
    value,
    onSelect,
    onChange,
    tokenListOpen,
    toggleTokenList,
    TokenSelectModal,
    logo,
    symbol,
  } = TWAPLib.store.useTokenPanel(isSrcToken);

  const { chain } = TWAPLib.store.useWeb3();

  const onOpen = () => {
    if (chain != null) {
      toggleTokenList(true);
    }
  };

  return (
    <>
      {TokenSelectModal && (
        <TokenSelectModal chainId={chain} commonTokens={[]} tokenSelected={undefined} onSelect={onSelect} isOpen={tokenListOpen} onClose={() => toggleTokenList(false)} />
      )}
      <StyledTokenPanel>
        <StyledCard>
          <StyledColumnGap>
            <StyledFlexBetween>
              <Tooltip text={inputWarningTooltip}>
                <StyledNumbericInput prefix={amountPrefix} loading={false} disabled={disabled} placeholder="0" onChange={onChange || (() => {})} value={value} />
              </Tooltip>
              <Tooltip text={tokenSeletWarningTooltip}>
                <StyledTokenSelect onClick={onOpen}>
                  <TokenDisplay logo={logo} name={symbol} />
                  <StyledIcon icon={<IoIosArrowDown size={20} />} />
                </StyledTokenSelect>
              </Tooltip>
            </StyledFlexBetween>
            <StyledFlexBetween>
              <StyledUSD value={usdValue} isLoading={usdValueLoading} />
              <Balance isLoading={balanceLoading} value={balance} />
            </StyledFlexBetween>
            {children}
          </StyledColumnGap>
        </StyledCard>
      </StyledTokenPanel>
    </>
  );
};

const SubmitButton = () => {
  const { loading, text, onClick, disabled } = TWAPLib.store.useSubmitOrder();

  return (
    <StyledButton loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
      {text}
    </StyledButton>
  );
};

const OrderConfirmation = () => {
  const {
    srcTokenUsdValue,
    srcTokenUiAmount,
    srcTokenInfo,
    dstTokenUsdValue,
    dstTokenUiAmount,
    dstTokenInfo,
    isLimitOrder,
    closeConfirmation,
    showConfirmation,
    disclaimerAccepted,
    setDisclaimerAccepted,
  } = TWAPLib.store.useConfirmation();

  const { account } = TWAPLib.store.useWeb3();

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
                amount={srcTokenUiAmount}
                usdPrice={srcTokenUsdValue}
                name={srcTokenInfo?.symbol}
                logo={srcTokenInfo?.logoUrl}
              />
              <TokenOrderPreview
                isLimitOrder={isLimitOrder}
                title={translations.to}
                amount={dstTokenUiAmount}
                usdPrice={dstTokenUsdValue}
                name={dstTokenInfo?.symbol}
                logo={dstTokenInfo?.logoUrl}
              />
              <OrderConfirmationLimitPrice />

              <StyledCard>
                <StyledColumnGap className="trade-info-explanation" gap={20}>
                  <ConfirmationExpiration />
                  <ConfirmationOrderType />
                  <ConfirmationTradeSize />
                  <ConfirmationTotalTrades />
                  <ConfirmationTradeInterval />
                  <ConfirmationMinimumReceived />
                </StyledColumnGap>
              </StyledCard>
              <TradeInfoDetailsDisplay />
            </StyledColumnGap>
            <StyledColumnGap gap={12}>
              <Box style={{ display: "flex", gap: 5 }}>
                <SmallLabel>{translations.acceptDisclaimer}</SmallLabel>
                <StyledSwitch value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
              </Box>
              <Text className="output-text">{translations.outputWillBeSentTo}</Text>
              <Text className="output-text">{account}</Text>
              <SubmitButton />
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
        <TradeInfoExplanation />
      </StyledColumnGap>
    </StyledCard>
  );
};

const OrderConfirmationLimitPrice = () => {
  const { isLimitOrder, toggleInverted, limitPriceUI, leftTokenInfo, rightTokenInfo } = TWAPLib.store.useLimitPrice();

  return (
    <StyledLimitPrice>
      <StyledFlexBetween>
        <Label tooltipText={translations.confirmationLimitPriceTooltip}>{translations.limitPrice}</Label>
        {isLimitOrder ? (
          <div className="right">
            <Text>1</Text> <TokenDisplay logo={leftTokenInfo?.logoUrl} name={leftTokenInfo?.symbol} /> <Text>=</Text>
            <Tooltip text={limitPriceUI}>
              <Text>
                <NumberDisplay value={limitPriceUI || "0"} />
              </Text>
            </Tooltip>
            <TokenDisplay logo={rightTokenInfo?.logoUrl} name={rightTokenInfo?.symbol} />
            <PriceToggle onClick={toggleInverted} />
          </div>
        ) : (
          <Text>{translations.none}</Text>
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
            <Label>{title}</Label>
            <StyledUSD value={usdPrice} />
          </StyledFlexBetween>
          <StyledFlexBetween>
            <TokenDisplay name={name} logo={logo} />
            <SmallLabel>
              {!isSrc && <> {isLimitOrder ? "≥ " : "~ "}</>} <NumberDisplay value={amount} />
            </SmallLabel>
          </StyledFlexBetween>
        </StyledColumnGap>
      </StyledCard>
    </StyledTokenOrder>
  );
};
