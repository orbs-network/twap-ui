import { CssBaseline } from "@mui/material";
import { Box } from "@mui/system";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import TWAPLib from "@orbs-network/twap-ui";
import { ThemeProvider } from "@mui/material/styles";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { TbArrowsRightLeft } from "react-icons/tb";
import { ReactNode } from "react";
import { GlobalStyles } from "@mui/material";
import text from "./text.json";
import {
  getTheme,
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
  StyledLayout,
  StyledLimitPrice,
  StyledMarketPrice,
  StyledMarketPriceRight,
  StyledNumbericInput,
  StyledOrderConfirmation,
  StyledPercentBtn,
  StyledPrice,
  StyledSrcTokenPercentSelector,
  StyledSwitch,
  StyledTokenDisplay,
  StyledTokenOrder,
  StyledTokenPanel,
  StyledTokenSelect,
  StyledTrade,
  StyledTradeInfoModal,
  StyledUSD,
} from "./styles";
import { ProviderWrapper, queryClient } from ".";

// TODO create file for styles

const { Balance, Loader, Icon, NumberDisplay, TimeSelector, NumericInput, Card, Label, TokenLogo, TokenName, SmallLabel, Switch, Text, IconButton, Tooltip } =
  TWAPLib.baseComponents;
const PriceToggle = TWAPLib.baseComponents.PriceToggle;

const { LimitPrice, ConfirmationExpiration, ConfirmationOrderType, ConfirmationTradeSize, ConfirmationTotalTrades, ConfirmationTradeInterval, ConfirmationMinimumReceived } =
  TWAPLib.components;

const TWAP = (props: { provider: any; connect: () => void; TokenSelectModal: any; tokensList: any[] }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProviderWrapper {...props}>
        <ThemeProvider theme={getTheme("dark")}>
          <CssBaseline />
          <GlobalStyles styles={globalStyle} />
          <StyledLayout>
            <StyledColumnGap gap={10}>
              <SrcTokenPanel />
              <ChangeTokensOrder />
              <DstTokenPanel />
              <LimitPriceDisplay />
              <TradeSize />
              <MaxDuration />
              <TradeInterval />
              <SubmitButton />
              <OrderConfirmation />
            </StyledColumnGap>
          </StyledLayout>
        </ThemeProvider>
      </ProviderWrapper>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
};

export default TWAP;

const MarketPrice = () => {
  const { toggleInverted, leftTokenInfo, rightTokenInfo, marketPrice } = TWAPLib.store.useMarketPrice();

  return (
    <StyledMarketPrice>
      <StyledCard>
        <StyledFlexBetween>
          <Text className="title">Current Market Price</Text>
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
      <StyledPercentBtn onClick={() => onClick(1)}>Max</StyledPercentBtn>
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
  const { uiTradeSize, onChange, totalTrades, uiUsdValue, usdPriceLoading, maxValue, logoUrl, symbol } = TWAPLib.store.useTradeSize();
  return (
    <StyledTrade>
      <StyledCard>
        <StyledColumnGap>
          <StyledFlexBetween gap={10}>
            <Label tooltipText={text.tradeSize}>Trade Size</Label>
            <StyledNumbericInput placeholder={"0"} onChange={onChange} value={uiTradeSize} maxValue={maxValue} />
            <TokenDisplay logo={logoUrl} name={symbol} />
          </StyledFlexBetween>
          <StyledFlexBetween>
            <SmallLabel>Total trades: {totalTrades}</SmallLabel>
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
            <Label tooltipText={isLimitOrder ? text.limitPrice : text.marketPrice}>Limit Price</Label>
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
  const { onChange } = TWAPLib.store.useMaxDuration();
  const { maxDurationMillis, maxDurationTimeFormat } = TWAPLib.store.useMaxDuration();

  return (
    <StyledCard>
      <StyledFlexBetween gap={10}>
        <Label tooltipText={text.maxDuration}>Max Duration</Label>
        <TimeSelector millis={maxDurationMillis} selectedTimeFormat={maxDurationTimeFormat} onChange={onChange} />
      </StyledFlexBetween>
    </StyledCard>
  );
};

const TradeInterval = () => {
  const { tradeIntervalMillis, tradeIntervalTimeFormat, customInterval, onChange, onCustomIntervalClick } = TWAPLib.store.useTradeInterval();

  return (
    <StyledCard>
      <StyledFlexBetween gap={10}>
        <Label tooltipText={text.tradeInterval}>Trade Interval</Label>
        <StyledIntervalTimeSelect>
          <TimeSelector disabled={!customInterval} onChange={onChange} millis={tradeIntervalMillis} selectedTimeFormat={tradeIntervalTimeFormat} />
        </StyledIntervalTimeSelect>
        {!customInterval && (
          <IconButton tooltip={text.customInterval} onClick={onCustomIntervalClick}>
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
  const { amountPrefix, usdValueLoading, usdValue, disabled, balanceLoading, balance, value, onSelect, selectedToken, onChange, tokenListOpen, toggleTokenList, TokenSelectModal } =
    TWAPLib.store.useTokenPanel(isSrcToken);

  const { chain, account } = TWAPLib.store.useWeb3();

  const onOpen = () => {
    if (chain != null) {
      toggleTokenList(true);
    }
  };

  return (
    <StyledTokenPanel>
      {TokenSelectModal && <TokenSelectModal isOpen={tokenListOpen} chainId={chain} selectedTokens={selectedToken} onClose={() => toggleTokenList(false)} onSelect={onSelect} />}
      <StyledCard>
        <StyledColumnGap>
          <StyledFlexBetween>
            <StyledNumbericInput prefix={amountPrefix} loading={false} disabled={disabled} placeholder="0" onChange={onChange ? onChange : () => {}} value={value} />
            <Tooltip text={!account ? text.connect : undefined}>
              <StyledTokenSelect onClick={onOpen}>
                <TokenDisplay logo={selectedToken?.logoUrl} name={selectedToken?.symbol} />
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
  );
};

const SubmitButton = () => {
  const { loading, text, onClick, disabled } = TWAPLib.store.useSubmitOrder();

  return (
    <StyledButton loading={loading} onClick={onClick} disabled={disabled}>
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

  const { ellipsisAccount, account } = TWAPLib.store.useWeb3();

  return (
    <>
      <StyledTradeInfoModal open={showConfirmation} onClose={closeConfirmation}>
        <StyledOrderConfirmation>
          <StyledColumnGap gap={20}>
            <StyledColumnGap gap={20}>
              <TokenOrderPreview
                isSrc={true}
                isLimitOrder={isLimitOrder}
                title="From"
                amount={srcTokenUiAmount}
                usdPrice={srcTokenUsdValue}
                name={srcTokenInfo?.symbol}
                logo={srcTokenInfo?.logoUrl}
              />
              <TokenOrderPreview
                isLimitOrder={isLimitOrder}
                title="To"
                amount={dstTokenUiAmount}
                usdPrice={dstTokenUsdValue}
                name={dstTokenInfo?.symbol}
                logo={dstTokenInfo?.logoUrl}
              />
              <OrderConfirmationLimitPrice />
              <TradeInfoDetailsDisplay />
              <StyledCard>
                <StyledColumnGap className="trade-info-explanation" gap={20}>
                  <ConfirmationExpiration tooltip={text.confirmationDeadline} />
                  <ConfirmationOrderType tooltip={isLimitOrder ? text.limitPrice : text.marketPrice} />
                  <ConfirmationTradeSize tooltip={text.confirmationTradeSize} />
                  <ConfirmationTotalTrades tooltip={text.confirmationTotalTrades} />
                  <ConfirmationTradeInterval tooltip={text.confirmationtradeInterval} />
                  <ConfirmationMinimumReceived tooltip={text.confirmationMinimumReceivedPerTrade} />
                </StyledColumnGap>
              </StyledCard>
            </StyledColumnGap>
            <StyledColumnGap gap={20}>
              <Box style={{ display: "flex", gap: 5 }}>
                <SmallLabel>{text.acceptDisclaimer}</SmallLabel>
                <Switch value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
              </Box>
              <Text className="output-text">
                {text.outputWillBeSentTo} <Tooltip text={account}>{ellipsisAccount}</Tooltip>
              </Text>
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
        <Text>{text.disclaimer1}</Text>
        <Text>{text.disclaimer2}</Text>
        <Text>{text.disclaimer3}</Text>
        <Text>{text.disclaimer4}</Text>
        <Text>{text.disclaimer5}</Text>
        <Text>
          {text.disclaimer6}
          <a href="https://www.orbs.com/" target="_blank">
            {" "}
            {text.link}
          </a>
          . {text.disclaimer7}
          <a href="https://www.orbs.com/" target="_blank">
            {" "}
            {text.link}
          </a>
          .
        </Text>
      </StyledColumnGap>
    </StyledCard>
  );
};

const OrderConfirmationLimitPrice = () => {
  const { isLimitOrder, toggleInverted, limitPriceUI, leftTokenInfo, rightTokenInfo } = TWAPLib.store.useLimitPrice();

  return (
    <StyledLimitPrice>
      <StyledFlexBetween>
        <Label tooltipText="some text">Limit Price</Label>
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
          <Text>NONE</Text>
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
